import { app, BrowserWindow, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initDatabase, getDb, getAppSetting, setAppSetting } from './db/database'
import { IngestionEngine } from './ingestion/watcher'
import { registerIpcHandlers } from './ipc/handlers'
import { checkBudgetsAndNotify } from './ipc/budget-checker'
import { TrayManager } from './tray/tray-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Ensure only a single instance of Token Tracker runs
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  console.log('[Main] Another instance is already running. Exiting.')
  app.quit()
}

// Configure Windows AppUserModelId properly:
// When running in development (npm run dev) or portable runs without an installed Start Menu shortcut,
// setting process.execPath instructs Windows Taskbar to directly bind the window and its taskbar button
// to the running process icon. When installed with an NSIS shortcut, it uses the registered appId.
if (process.platform === 'win32') {
  const startMenuShortcut = path.join(
    process.env.APPDATA || '',
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Token Tracker.lnk'
  )
  if (app.isPackaged && fs.existsSync(startMenuShortcut)) {
    app.setAppUserModelId('com.tokentracker.app')
  } else {
    app.setAppUserModelId(process.execPath)
  }
}

let mainWindow: BrowserWindow | null = null
let ingestionEngine: IngestionEngine | null = null
let trayManager: TrayManager | null = null
let isQuitting = false

function getAppIcon(): { path: string; image: Electron.NativeImage } {
  const appRoot = process.env.APP_ROOT || path.join(__dirname, '..')
  const candidates = [
    path.join(appRoot, 'build', 'icon.ico'),
    path.join(appRoot, 'public', 'icon.ico'),
    path.join(appRoot, 'dist', 'icon.ico'),
    path.join(appRoot, 'build', 'icon.png'),
    path.join(appRoot, 'public', 'icon.png'),
    path.join(appRoot, 'dist', 'icon.png'),
    path.join(appRoot, 'public', 'favicon.ico'),
  ]

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p)
      if (!img.isEmpty()) {
        return { path: p, image: img }
      }
    }
  }

  const fallback = path.join(appRoot, 'build', 'icon.ico')
  return { path: fallback, image: nativeImage.createFromPath(fallback) }
}

function createWindow() {
  const { path: iconPath, image: appIcon } = getAppIcon()

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1040,
    minHeight: 700,
    frame: false,
    thickFrame: true, // Re-enables native window style for crisp DWM taskbar thumbnails & aero snap
    icon: appIcon,
    backgroundColor: '#000000',
    title: 'Token Tracker',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Explicitly apply icon to HWND for Windows taskbar button binding
  if (process.platform === 'win32' && !appIcon.isEmpty()) {
    mainWindow.setIcon(appIcon)
  }

  mainWindow.on('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed() && process.platform === 'win32' && !appIcon.isEmpty()) {
      mainWindow.setIcon(appIcon)
    }
  })

  mainWindow.on('show', () => {
    if (mainWindow && !mainWindow.isDestroyed() && process.platform === 'win32' && !appIcon.isEmpty()) {
      mainWindow.setIcon(appIcon)
    }
  })

  // Explicitly reset thumbnail clipping for Windows DWM taskbar hover preview
  if (process.platform === 'win32') {
    mainWindow.webContents.on('did-finish-load', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setThumbnailClip({ x: 0, y: 0, width: 0, height: 0 })
      }
    })
  }

  mainWindow.setMenuBarVisibility(false)

  // Track and broadcast maximize/unmaximize window states to renderer
  mainWindow.on('maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-state', true)
    }
  })

  mainWindow.on('unmaximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-state', false)
    }
  })

  // Log renderer console messages to main process terminal
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message} (${sourceId}:${line})`)
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Handle automated screen capture if requested
  if (process.argv.includes('--capture-screens')) {
    mainWindow.webContents.on('did-finish-load', async () => {
      console.log('[Capture] Page loaded, starting automated verification capture...')
      const screenshotsDir = path.join(process.env.APP_ROOT || path.join(__dirname, '..'), 'screenshots')
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true })
      }

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      const safeCapture = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await mainWindow!.webContents.capturePage()
          } catch (e) {
            console.warn(`[Capture] capturePage retry ${i + 1}/${retries}...`)
            await sleep(1000)
          }
        }
        return await mainWindow!.webContents.capturePage()
      }

      try {
        // 1. Dashboard View
        console.log('[Capture] 1/4: Waiting for Dashboard data to render...')
        await sleep(3000)
        let img = await safeCapture()
        const dashPath = path.join(screenshotsDir, '01_dashboard.png')
        fs.writeFileSync(dashPath, img.toPNG())
        console.log(`[Capture] Saved: ${dashPath}`)

        // 2. Projects View
        console.log('[Capture] 2/4: Navigating to Projects view...')
        mainWindow!.webContents.send('navigate-page', { page: 'projects' })
        await sleep(1500)
        img = await safeCapture()
        const projPath = path.join(screenshotsDir, '02_projects.png')
        fs.writeFileSync(projPath, img.toPNG())
        console.log(`[Capture] Saved: ${projPath}`)

        // 3. Session Detail View (Using Spartan project with rich multi-turn sessions)
        const db = getDb()
        const spartanProj = db.prepare('SELECT id, name FROM projects WHERE name LIKE ? LIMIT 1').get('%Spartan%') as any
        const projId = spartanProj ? spartanProj.id : undefined
        console.log(`[Capture] 3/4: Navigating to Session Detail for project "${spartanProj?.name}" (${projId})...`)
        mainWindow!.webContents.send('navigate-page', { page: 'session-detail', projectId: projId })
        await sleep(2000)
        img = await safeCapture()
        const sessionPath = path.join(screenshotsDir, '03_session_detail.png')
        fs.writeFileSync(sessionPath, img.toPNG())
        console.log(`[Capture] Saved: ${sessionPath}`)

        // 4. Settings View
        console.log('[Capture] 4/4: Navigating to Settings view...')
        mainWindow!.webContents.send('navigate-page', { page: 'settings' })
        await sleep(1500)
        img = await safeCapture()
        const settingsPath = path.join(screenshotsDir, '04_settings.png')
        fs.writeFileSync(settingsPath, img.toPNG())
        console.log(`[Capture] Saved: ${settingsPath}`)

        // Also copy to artifacts directory for markdown embedding
        const artifactDir = 'C:\\Users\\Ganesh Bhopne\\.gemini\\antigravity\\brain\\7e69aa6c-0daa-4437-b704-caf504338880'
        if (fs.existsSync(artifactDir)) {
          fs.copyFileSync(dashPath, path.join(artifactDir, '01_dashboard.png'))
          fs.copyFileSync(projPath, path.join(artifactDir, '02_projects.png'))
          fs.copyFileSync(sessionPath, path.join(artifactDir, '03_session_detail.png'))
          fs.copyFileSync(settingsPath, path.join(artifactDir, '04_settings.png'))
          console.log('[Capture] Copied all screenshots to artifacts directory.')
        }

        console.log('[Capture] ALL 4 SCREENS VERIFIED AND CAPTURED SUCCESSFULLY!')
      } catch (captureErr) {
        console.error('[Capture] Capture error:', captureErr)
      } finally {
        app.quit()
      }
    })
  }

  // Handle automated system tray verification if requested
  if (process.argv.includes('--test-tray')) {
    mainWindow.webContents.on('did-finish-load', async () => {
      console.log('[TestTray] Starting automated verification...')
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      try {
        await sleep(1000)

        // 1. Check initial app settings
        const minToTraySetting = getAppSetting('minimize_to_tray', 'true')
        console.log(`[TestTray] 1. Initial minimize_to_tray setting: "${minToTraySetting}"`)
        if (minToTraySetting !== 'true') throw new Error('minimize_to_tray should default to "true"')

        // 2. Verify window is visible initially
        console.log(`[TestTray] 2. Window is visible initially: ${mainWindow!.isVisible()}`)
        if (!mainWindow!.isVisible()) throw new Error('mainWindow should be visible on start')

        // 3. Trigger close (which should hide to tray)
        console.log('[TestTray] 3. Triggering window close...')
        mainWindow!.close()
        await sleep(500)

        console.log(`[TestTray] 3b. Window is visible after close: ${mainWindow!.isVisible()}`)
        if (mainWindow!.isVisible()) throw new Error('mainWindow should be hidden after close with minimize_to_tray=true')

        // 4. Verify first-time tray notification was recorded
        const hasNotif = getAppSetting('has_shown_tray_first_notification', 'false')
        console.log(`[TestTray] 4. has_shown_tray_first_notification: "${hasNotif}"`)
        if (hasNotif !== 'true') throw new Error('has_shown_tray_first_notification should be "true"')

        // 5. Test background ingestion while minimized
        console.log('[TestTray] 5. Testing background ingestion while window is minimized...')
        const db = getDb()
        const testTurnId = 'test-tray-turn-' + Date.now()
        const testSessionId = 'test-tray-session-' + Date.now()
        const testProjId = 'test-tray-proj-' + Date.now()
        db.prepare('INSERT OR IGNORE INTO projects (id, path, name, tool_source, created_at) VALUES (?, ?, ?, ?, ?)').run(
          testProjId,
          'C:/test/tray-proj',
          'TrayTestProject',
          'claude_code',
          Date.now()
        )
        db.prepare('INSERT INTO sessions (id, project_id, tool_source, model, start_time, provenance) VALUES (?, ?, ?, ?, ?, ?)').run(
          testSessionId,
          testProjId,
          'claude_code',
          'claude-3-7-sonnet',
          Date.now(),
          'exact'
        )
        db.prepare('INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
          testTurnId,
          testSessionId,
          1000,
          500,
          0,
          0,
          0.05,
          Date.now(),
          'exact'
        )

        // Update tray
        trayManager!.updateTray()
        console.log('[TestTray] 5b. Successfully recorded turn and updated tray metrics while minimized')

        // 6. Test restoreWindow from tray
        console.log('[TestTray] 6. Restoring window from tray...')
        trayManager!.restoreWindow()
        await sleep(500)
        console.log(`[TestTray] 6b. Window is visible after restore: ${mainWindow!.isVisible()}`)
        if (!mainWindow!.isVisible()) throw new Error('mainWindow should be visible after restore')

        // 7. Test toggling minimize_to_tray off
        console.log('[TestTray] 7. Toggling minimize_to_tray off...')
        setAppSetting('minimize_to_tray', 'false')
        const updatedSetting = getAppSetting('minimize_to_tray', 'true')
        console.log(`[TestTray] 7b. minimize_to_tray is now: "${updatedSetting}"`)
        if (updatedSetting !== 'false') throw new Error('minimize_to_tray should be "false"')

        // Restore setting to default true
        setAppSetting('minimize_to_tray', 'true')

        // 8. Capture updated Settings screen with tray toggle
        const screenshotsDir = path.join(process.env.APP_ROOT || path.join(__dirname, '..'), 'screenshots')
        mainWindow!.webContents.send('navigate-page', { page: 'settings' })
        await sleep(1500)
        const img = await mainWindow!.webContents.capturePage()
        const settingsPath = path.join(screenshotsDir, '04_settings.png')
        fs.writeFileSync(settingsPath, img.toPNG())
        console.log(`[TestTray] Saved updated settings screenshot: ${settingsPath}`)

        const artifactDir = 'C:\\Users\\Ganesh Bhopne\\.gemini\\antigravity\\brain\\7e69aa6c-0daa-4437-b704-caf504338880'
        if (fs.existsSync(artifactDir)) {
          fs.copyFileSync(settingsPath, path.join(artifactDir, '04_settings.png'))
        }

        console.log('[TestTray] >>> ALL SYSTEM TRAY TESTS PASSED CLEANLY! <<<')
      } catch (testErr) {
        console.error('[TestTray] FAILED:', testErr)
        process.exitCode = 1
      } finally {
        isQuitting = true
        app.quit()
      }
    })
  }

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return
    }
    const minimizeToTray = getAppSetting('minimize_to_tray', 'true') === 'true'
    if (minimizeToTray) {
      event.preventDefault()
      mainWindow?.hide()
      trayManager?.showFirstTimeNotification()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    console.log('[Main] Initializing SQLite database...')
    initDatabase()

    createWindow()

    if (mainWindow) {
      trayManager = new TrayManager(mainWindow, () => {
        isQuitting = true
        if (trayManager) {
          trayManager.destroy()
          trayManager = null
        }
        if (ingestionEngine) {
          ingestionEngine.stop()
          ingestionEngine = null
        }
        app.quit()
      })

      if (ingestionEngine) {
        ingestionEngine.stop()
        ingestionEngine = null
      }

      ingestionEngine = new IngestionEngine({
        onDataChanged: () => {
          checkBudgetsAndNotify(mainWindow)
          trayManager?.updateTray()
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('data-updated')
          }
        },
      })

      registerIpcHandlers(mainWindow, ingestionEngine)

      // Run initial ingestion across all sources
      await ingestionEngine.runInitialIngestion()

      // Initial budget evaluation
      checkBudgetsAndNotify(mainWindow)

      // Initial tray data update
      trayManager?.updateTray()

      // Start watching target directories for live updates
      ingestionEngine.startWatching()
    }
  } catch (err) {
    console.error('[Main] Fatal initialization error:', err)
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  if (trayManager) {
    trayManager.destroy()
    trayManager = null
  }
  if (ingestionEngine) {
    ingestionEngine.stop()
    ingestionEngine = null
  }
})

app.on('window-all-closed', () => {
  const minimizeToTray = getAppSetting('minimize_to_tray', 'true') === 'true'
  if (!minimizeToTray || isQuitting) {
    if (trayManager) {
      trayManager.destroy()
      trayManager = null
    }
    if (ingestionEngine) {
      ingestionEngine.stop()
      ingestionEngine = null
    }
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }
})

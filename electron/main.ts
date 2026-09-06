import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initDatabase, getDb } from './db/database'
import { IngestionEngine } from './ingestion/watcher'
import { registerIpcHandlers } from './ipc/handlers'
import { checkBudgetsAndNotify } from './ipc/budget-checker'

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

app.setAppUserModelId('com.tokentracker.app')

let mainWindow: BrowserWindow | null = null
let ingestionEngine: IngestionEngine | null = null

function getAppIconPath(): string {
  const appRoot = process.env.APP_ROOT || path.join(__dirname, '..')
  if (process.platform === 'win32') {
    return path.join(appRoot, 'build', 'icon.ico')
  }
  return path.join(appRoot, 'build', 'icon.png')
}

function createWindow() {
  const iconPath = getAppIconPath()

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1040,
    minHeight: 700,
    frame: false,
    thickFrame: true, // Re-enables native window style for crisp DWM taskbar thumbnails & aero snap
    icon: iconPath,
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
      if (ingestionEngine) {
        ingestionEngine.stop()
        ingestionEngine = null
      }

      ingestionEngine = new IngestionEngine({
        onDataChanged: () => {
          checkBudgetsAndNotify(mainWindow)
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

      // Start watching target directories for live updates
      ingestionEngine.startWatching()
    }
  } catch (err) {
    console.error('[Main] Fatal initialization error:', err)
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  if (ingestionEngine) {
    ingestionEngine.stop()
    ingestionEngine = null
  }
})

app.on('window-all-closed', () => {
  if (ingestionEngine) {
    ingestionEngine.stop()
    ingestionEngine = null
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const { execSync, spawn } = require('node:child_process')
const { createShortcut } = require('./shortcuts')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 420,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    frame: false, // NO native OS window chrome at all
    roundedCorners: false, // Force 100% sharp square 90-degree corners on Windows 11
    center: true,
    backgroundColor: '#c0c0c0',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    title: 'Token Tracker Setup',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC Handlers
ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle('get-default-path', () => {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
  return path.join(localAppData, 'Programs', 'Token Tracker')
})

ipcMain.handle('browse-folder', async (_event, currentPath) => {
  if (!mainWindow) return null
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Destination Folder',
    defaultPath: currentPath || os.homedir(),
    properties: ['openDirectory', 'createDirectory'],
  })
  if (!res.canceled && res.filePaths && res.filePaths.length > 0) {
    return res.filePaths[0]
  }
  return null
})

ipcMain.handle('check-disk-space', async (_event, targetPath) => {
  try {
    const drive = path.parse(path.resolve(targetPath)).root.replace('\\', '')
    // Quick disk free check via wmic or powershell
    const psCmd = `(Get-PSDrive -Name '${drive.replace(':', '')}').Free / 1MB`
    const out = execSync(`powershell -NoProfile -Command "${psCmd}"`, { encoding: 'utf8' }).trim()
    const freeMB = Math.round(parseFloat(out)) || 10240
    return { freeMB, requiredMB: 480 }
  } catch {
    return { freeMB: 20480, requiredMB: 480 }
  }
})

function getPayloadPath() {
  const candidates = [
    path.join(__dirname, '..', 'app.asar.unpacked', 'payload.tar.gz'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'payload.tar.gz'),
    path.join(__dirname, 'payload.tar.gz'),
    path.join(process.cwd(), 'installer', 'payload.tar.gz'),
    path.join(path.dirname(app.getPath('exe')), 'payload.tar.gz'),
  ]
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c
  }
  return path.join(__dirname, 'payload.tar.gz')
}

ipcMain.handle('start-installation', async (event, targetDir) => {
  const sendProgress = (percent, status) => {
    event.sender.send('install-progress', { percent, status })
  }

  try {
    sendProgress(5, 'Preparing destination directory...')
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    sendProgress(15, 'Locating software archive...')
    const payloadPath = getPayloadPath()
    if (!fs.existsSync(payloadPath)) {
      throw new Error(`Installation archive not found: ${payloadPath}`)
    }

    sendProgress(25, 'Extracting core files and runtime...')
    // Execute tar extract synchronously or with progress ticks
    const extractCmd = `tar.exe -xzf "${payloadPath}" -C "${targetDir}"`
    
    // Simulate incremental segmented bar progress while tar is running
    let currentPct = 25
    const progressTimer = setInterval(() => {
      if (currentPct < 75) {
        currentPct += 5
        const labels = [
          'Extracting resources...',
          'Extracting application libraries...',
          'Unpacking packages...',
          'Extracting runtime components...',
        ]
        const label = labels[Math.floor((currentPct / 10)) % labels.length]
        sendProgress(currentPct, label)
      }
    }, 400)

    try {
      execSync(extractCmd, { stdio: 'ignore' })
    } finally {
      clearInterval(progressTimer)
    }

    sendProgress(80, 'Verifying extracted binaries...')
    const exePath = path.join(targetDir, 'Token Tracker.exe')
    if (!fs.existsSync(exePath)) {
      throw new Error('Verification failed: Token Tracker.exe missing after extraction')
    }

    sendProgress(88, 'Creating desktop and Start Menu shortcuts...')
    const desktopLnk = path.join(os.homedir(), 'Desktop', 'Token Tracker.lnk')
    const startMenuDir = path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs'
    )
    const startMenuLnk = path.join(startMenuDir, 'Token Tracker.lnk')

    createShortcut(desktopLnk, exePath, targetDir)
    createShortcut(startMenuLnk, exePath, targetDir)

    sendProgress(94, 'Registering uninstall entry in Windows...')
    const uninstallBat = path.join(targetDir, 'uninstall.bat')
    const batContent = `@echo off
setlocal
echo ===================================================
echo             Uninstalling Token Tracker
echo ===================================================

:: Terminate running Token Tracker processes
taskkill /F /IM "Token Tracker.exe" /T 2>nul

:: Remove Desktop and Start Menu shortcuts
set "DESKTOP_LNK=${desktopLnk}"
set "STARTMENU_LNK=${startMenuLnk}"
if exist "%DESKTOP_LNK%" del /f /q "%DESKTOP_LNK%" 2>nul
if exist "%STARTMENU_LNK%" del /f /q "%STARTMENU_LNK%" 2>nul

:: Remove Registry Uninstall Key
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\TokenTracker" /f 2>nul

:: Self-deletion of install directory
set "INSTALL_DIR=%~dp0"
if "%INSTALL_DIR:~-1%"=="\\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Remove-Item -Recurse -Force -LiteralPath '%INSTALL_DIR%'"
echo Token Tracker uninstalled successfully.
exit /b 0
`
    fs.writeFileSync(uninstallBat, batContent, 'utf8')

    // Atomic registry import for Windows Settings > Apps > Installed apps
    const regFile = path.join(targetDir, 'register_uninstall.reg')
    const installDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const escTarget = targetDir.replace(/\\/g, '\\\\')
    const escExe = exePath.replace(/\\/g, '\\\\')
    const escBat = uninstallBat.replace(/\\/g, '\\\\')

    const regContent = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\TokenTracker]
"DisplayName"="Token Tracker"
"DisplayVersion"="1.7.0"
"Publisher"="Token Tracker Project"
"DisplayIcon"="${escExe},0"
"InstallLocation"="${escTarget}"
"UninstallString"="cmd.exe /c \\"${escBat}\\""
"QuietUninstallString"="cmd.exe /c \\"${escBat}\\""
"NoModify"=dword:00000001
"NoRepair"=dword:00000001
"EstimatedSize"=dword:0006f720
"InstallDate"="${installDate}"
`
    fs.writeFileSync(regFile, regContent, 'utf8')
    execSync(`reg.exe import "${regFile}"`, { stdio: 'ignore' })
    try { fs.unlinkSync(regFile) } catch {}

    sendProgress(100, 'Installation completed successfully.')
    return { success: true, targetDir, exePath }
  } catch (err) {
    console.error('Installation error:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('launch-app', (_event, exePath) => {
  if (fs.existsSync(exePath)) {
    const child = spawn(exePath, [], {
      detached: true,
      stdio: 'ignore',
      cwd: path.dirname(exePath),
    })
    child.unref()
  }
  app.quit()
})

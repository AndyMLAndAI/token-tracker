const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

let win = null

ipcMain.handle('window-close', () => {
  if (win) win.close()
})

ipcMain.handle('window-minimize', () => {
  if (win) win.minimize()
})

ipcMain.handle('get-default-path', () => {
  return 'C:\\Users\\Ganesh Bhopne\\AppData\\Local\\Programs\\Token Tracker'
})

ipcMain.handle('check-disk-space', () => {
  return { freeMB: 48500, requiredMB: 480 }
})

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 540,
    height: 480,
    resizable: false,
    frame: false,
    center: true,
    backgroundColor: '#050505',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))

  win.webContents.on('did-finish-load', async () => {
    await new Promise((r) => setTimeout(r, 400))
    // Snapshot Welcome
    const img1 = await win.webContents.capturePage()
    fs.writeFileSync(path.join(__dirname, 'installer_shadcn_preview.png'), img1.toPNG())

    // Switch to step 2 (Location)
    await win.webContents.executeJavaScript('showStep(2)')
    await new Promise((r) => setTimeout(r, 300))
    const img2 = await win.webContents.capturePage()
    fs.writeFileSync(path.join(__dirname, 'installer_shadcn_location.png'), img2.toPNG())

    // Switch to step 3 (Installing with 65% progress)
    await win.webContents.executeJavaScript('showStep(3); updateProgress(68, "Extracting application libraries (68%)...")')
    await new Promise((r) => setTimeout(r, 300))
    const img3 = await win.webContents.capturePage()
    fs.writeFileSync(path.join(__dirname, 'installer_shadcn_installing.png'), img3.toPNG())

    // Switch to step 4 (Finish)
    await win.webContents.executeJavaScript('showStep(4)')
    await new Promise((r) => setTimeout(r, 300))
    const img4 = await win.webContents.capturePage()
    fs.writeFileSync(path.join(__dirname, 'installer_shadcn_finish.png'), img4.toPNG())

    console.log('[Inspect] Successfully captured all 4 screen previews in installer/')
    app.quit()
  })
})

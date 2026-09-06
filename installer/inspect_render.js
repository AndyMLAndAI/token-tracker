const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

let win = null

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 420,
    height: 420,
    resizable: false,
    frame: false,
    center: true,
    backgroundColor: '#c0c0c0',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))

  win.webContents.on('did-finish-load', async () => {
    // Wait for fonts and styles to paint
    await new Promise((r) => setTimeout(r, 1200))

    const img = await win.webContents.capturePage()
    const outPath = 'C:/Users/Ganesh Bhopne/.gemini/antigravity/brain/7e69aa6c-0daa-4437-b704-caf504338880/installer_square_win95.png'
    fs.writeFileSync(outPath, img.toPNG())
    console.log('[Inspect] Saved screenshot to:', outPath)
    app.quit()
  })
})

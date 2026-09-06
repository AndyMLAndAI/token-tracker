const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('installerAPI', {
  closeWindow: () => ipcRenderer.invoke('window-close'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  browseFolder: (currentPath) => ipcRenderer.invoke('browse-folder', currentPath),
  checkDiskSpace: (path) => ipcRenderer.invoke('check-disk-space', path),
  startInstallation: (targetDir) => ipcRenderer.invoke('start-installation', targetDir),
  launchApp: (exePath) => ipcRenderer.invoke('launch-app', exePath),
  onProgress: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('install-progress', handler)
    return () => ipcRenderer.removeListener('install-progress', handler)
  },
})

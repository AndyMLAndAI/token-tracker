const screens = [
  document.getElementById('screenWelcome'),
  document.getElementById('screenLicense'),
  document.getElementById('screenLocation'),
  document.getElementById('screenInstalling'),
  document.getElementById('screenFinish'),
]

let currentStep = 0
let installedExePath = null

const btnBack = document.getElementById('btnBack')
const btnNext = document.getElementById('btnNext')
const btnFinish = document.getElementById('btnFinish')
const btnCancel = document.getElementById('btnCancel')
const btnTitlebarMinimize = document.getElementById('btnTitlebarMinimize')
const btnTitlebarClose = document.getElementById('btnTitlebarClose')
const btnBrowse = document.getElementById('btnBrowse')
const inputInstallPath = document.getElementById('inputInstallPath')
const lblSpaceRequired = document.getElementById('lblSpaceRequired')
const lblSpaceAvailable = document.getElementById('lblSpaceAvailable')
const progressFill = document.getElementById('progressFill')
const lblProgressPct = document.getElementById('lblProgressPct')
const lblInstallStatus = document.getElementById('lblInstallStatus')
const chkLaunchApp = document.getElementById('chkLaunchApp')

// Update continuous progress bar & percentages
function updateProgress(percent, statusText) {
  const rounded = Math.min(100, Math.max(0, Math.round(percent)))
  if (statusText && lblInstallStatus) {
    lblInstallStatus.textContent = statusText
  }
  if (lblProgressPct) {
    lblProgressPct.textContent = `${rounded}%`
  }
  if (progressFill) {
    progressFill.style.width = `${rounded}%`
  }
}

async function updateDiskSpace() {
  const currentPath = inputInstallPath.value
  if (!currentPath || !window.installerAPI) return
  try {
    const res = await window.installerAPI.checkDiskSpace(currentPath)
    if (res) {
      lblSpaceAvailable.textContent = `${res.freeMB.toLocaleString()} MB`
      lblSpaceRequired.textContent = `${res.requiredMB} MB`
    }
  } catch {
    lblSpaceAvailable.textContent = 'Unknown'
  }
}

function showStep(stepIndex) {
  currentStep = stepIndex

  screens.forEach((screen, idx) => {
    if (idx === stepIndex) {
      screen.classList.add('active')
    } else {
      screen.classList.remove('active')
    }
  })

  // Configure footer buttons based on current screen
  if (stepIndex === 0) { // Welcome
    btnBack.disabled = true
    btnNext.disabled = false
    btnNext.textContent = 'Continue'
    btnNext.style.display = 'inline-flex'
    btnFinish.style.display = 'none'
    btnCancel.disabled = false
    btnCancel.style.display = 'inline-flex'
  } else if (stepIndex === 1) { // License
    btnBack.disabled = false
    btnNext.disabled = false
    btnNext.textContent = 'Agree & Continue'
    btnNext.style.display = 'inline-flex'
    btnFinish.style.display = 'none'
    btnCancel.disabled = false
    btnCancel.style.display = 'inline-flex'
  } else if (stepIndex === 2) { // Location
    btnBack.disabled = false
    btnNext.disabled = false
    btnNext.textContent = 'Install'
    btnNext.style.display = 'inline-flex'
    btnFinish.style.display = 'none'
    btnCancel.disabled = false
    btnCancel.style.display = 'inline-flex'
    updateDiskSpace()
  } else if (stepIndex === 3) { // Installing
    btnBack.disabled = true
    btnNext.disabled = true
    btnNext.style.display = 'inline-flex'
    btnFinish.style.display = 'none'
    btnCancel.disabled = true
    btnCancel.style.display = 'inline-flex'
    runInstallation()
  } else if (stepIndex === 4) { // Finish
    btnBack.style.display = 'none'
    btnNext.style.display = 'none'
    btnCancel.style.display = 'none'
    btnFinish.style.display = 'inline-flex'
    btnFinish.focus()
  }
}

async function runInstallation() {
  const targetDir = inputInstallPath.value
  updateProgress(0, 'Initializing setup process...')

  if (window.installerAPI) {
    const unsub = window.installerAPI.onProgress((data) => {
      updateProgress(data.percent, data.status)
    })

    try {
      const res = await window.installerAPI.startInstallation(targetDir)
      unsub()
      if (res.success) {
        installedExePath = res.exePath
        updateProgress(100, 'Installation complete.')
        setTimeout(() => {
          showStep(4) // Advance to finish screen
        }, 500)
      } else {
        alert('Installation encountered an error: ' + (res.error || 'Unknown error'))
        btnCancel.disabled = false
      }
    } catch (err) {
      unsub()
      alert('Installation failed: ' + err.message)
      btnCancel.disabled = false
    }
  } else {
    // Fallback simulation for browser testing
    let p = 0
    const timer = setInterval(() => {
      p += 5
      updateProgress(p, `Extracting files (${p}%)...`)
      if (p >= 100) {
        clearInterval(timer)
        setTimeout(() => showStep(4), 500)
      }
    }, 120)
  }
}

// Event Listeners
btnNext.addEventListener('click', () => {
  if (currentStep < screens.length - 1) {
    showStep(currentStep + 1)
  }
})

btnBack.addEventListener('click', () => {
  if (currentStep > 0) {
    showStep(currentStep - 1)
  }
})

btnBrowse.addEventListener('click', async () => {
  if (window.installerAPI) {
    const chosen = await window.installerAPI.browseFolder(inputInstallPath.value)
    if (chosen) {
      inputInstallPath.value = chosen
      updateDiskSpace()
    }
  }
})

btnFinish.addEventListener('click', () => {
  if (chkLaunchApp.checked && installedExePath && window.installerAPI) {
    window.installerAPI.launchApp(installedExePath)
  } else if (window.installerAPI) {
    window.installerAPI.closeWindow()
  }
})

btnCancel.addEventListener('click', () => {
  if (window.installerAPI) {
    window.installerAPI.closeWindow()
  }
})

if (btnTitlebarClose) {
  btnTitlebarClose.addEventListener('click', () => {
    if (window.installerAPI) {
      window.installerAPI.closeWindow()
    }
  })
}

if (btnTitlebarMinimize) {
  btnTitlebarMinimize.addEventListener('click', () => {
    if (window.installerAPI) {
      window.installerAPI.minimizeWindow()
    }
  })
}

// Initialize Default Path
if (window.installerAPI) {
  window.installerAPI.getDefaultPath().then((defaultPath) => {
    inputInstallPath.value = defaultPath
    updateDiskSpace()
  }).catch(() => {})
}

// Start at Welcome step
showStep(0)

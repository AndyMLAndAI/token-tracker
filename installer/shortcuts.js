const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { execSync } = require('node:child_process')

function createShortcut(shortcutPath, targetExe, workDir) {
  const dir = path.dirname(shortcutPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const vbsPath = path.join(os.tmpdir(), `shortcut_${Date.now()}_${Math.random().toString(36).slice(2)}.vbs`)
  const vbs = [
    'Set ws = CreateObject("WScript.Shell")',
    `Set s = ws.CreateShortcut(${JSON.stringify(shortcutPath)})`,
    `s.TargetPath = ${JSON.stringify(targetExe)}`,
    `s.WorkingDirectory = ${JSON.stringify(workDir || path.dirname(targetExe))}`,
    `s.IconLocation = ${JSON.stringify(targetExe + ',0')}`,
    's.Save',
  ].join('\r\n')

  fs.writeFileSync(vbsPath, vbs, 'utf8')
  try {
    execSync(`cscript //nologo "${vbsPath}"`, { stdio: 'ignore' })
  } finally {
    try {
      if (fs.existsSync(vbsPath)) fs.unlinkSync(vbsPath)
    } catch {}
  }
}

module.exports = { createShortcut }

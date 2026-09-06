import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

export type SourceId =
  | 'claude_code'
  | 'cline'
  | 'roo_code'
  | 'antigravity'
  | 'aider'
  | 'cursor'
  | 'windsurf'
  | 'continue'
  | 'proxy'

export interface SourcePathInfo {
  id: SourceId
  name: string
  description: string
  found: boolean
  resolvedPath: string
  provenanceDefault: 'exact' | 'estimated' | 'live_captured'
  details?: {
    statsFile?: string
    projectsDir?: string
    historyFile?: string
  }
}

export function getPlatformCodeGlobalStoragePath(extensionSubdir: string): string {
  const home = os.homedir()
  const platform = process.platform

  if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming')
    return path.join(appData, 'Code', 'User', 'globalStorage', extensionSubdir)
  } else if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', extensionSubdir)
  } else {
    return path.join(home, '.config', 'Code', 'User', 'globalStorage', extensionSubdir)
  }
}

export function resolveAllSources(): SourcePathInfo[] {
  const home = os.homedir()
  const platform = process.platform

  let appData = process.env.APPDATA || ''
  if (!appData && platform === 'darwin') {
    appData = path.join(home, 'Library', 'Application Support')
  } else if (!appData) {
    appData = path.join(home, '.config')
  }

  // 1. Claude Code
  const claudeHome = path.join(home, '.claude')
  const claudeStats = path.join(claudeHome, 'stats-cache.json')
  const claudeProjects = path.join(claudeHome, 'projects')
  const claudeFound = fs.existsSync(claudeHome) && (fs.existsSync(claudeStats) || fs.existsSync(claudeProjects))

  const claudeInfo: SourcePathInfo = {
    id: 'claude_code',
    name: 'Claude Code',
    description: 'CLI tool session logs & pre-computed model usage stats',
    found: claudeFound,
    resolvedPath: claudeHome,
    provenanceDefault: 'exact',
    details: {
      statsFile: fs.existsSync(claudeStats) ? claudeStats : undefined,
      projectsDir: fs.existsSync(claudeProjects) ? claudeProjects : undefined,
    },
  }

  // 2. Cline
  const clineBase = getPlatformCodeGlobalStoragePath('saoudrizwan.claude-dev')
  const clineHistory = path.join(clineBase, 'state', 'taskHistory.json')
  const clineFound = fs.existsSync(clineBase) && fs.existsSync(clineHistory)

  const clineInfo: SourcePathInfo = {
    id: 'cline',
    name: 'Cline',
    description: 'VS Code autonomous coding extension task histories & turn logs',
    found: clineFound,
    resolvedPath: clineBase,
    provenanceDefault: 'exact',
    details: {
      historyFile: fs.existsSync(clineHistory) ? clineHistory : undefined,
    },
  }

  // 3. Roo Code
  const rooBase = getPlatformCodeGlobalStoragePath('rooveterinaryinc.roo-cline')
  const rooHistory = path.join(rooBase, 'state', 'taskHistory.json')
  const rooFound = fs.existsSync(rooBase) && fs.existsSync(rooHistory)

  const rooInfo: SourcePathInfo = {
    id: 'roo_code',
    name: 'Roo Code',
    description: 'VS Code Roo-Cline extension task histories & turn logs',
    found: rooFound,
    resolvedPath: rooBase,
    provenanceDefault: 'exact',
    details: {
      historyFile: fs.existsSync(rooHistory) ? rooHistory : undefined,
    },
  }

  // 4. Google Antigravity
  const agyHome = path.join(home, '.gemini', 'antigravity')
  const agyConv = path.join(agyHome, 'conversations')
  const agyFound = fs.existsSync(agyHome) && fs.existsSync(agyConv)

  const agyInfo: SourcePathInfo = {
    id: 'antigravity',
    name: 'Google Antigravity',
    description: 'Autonomous IDE conversation databases & gen_metadata protobuf telemetry',
    found: agyFound,
    resolvedPath: agyHome,
    provenanceDefault: 'exact',
    details: {
      projectsDir: fs.existsSync(agyConv) ? agyConv : undefined,
    },
  }

  // 5. Aider
  const aiderHome = path.join(home, '.aider')
  const aiderFound = fs.existsSync(aiderHome) || fs.existsSync(path.join(home, '.aider.conf.yml'))

  const aiderInfo: SourcePathInfo = {
    id: 'aider',
    name: 'Aider',
    description: 'Terminal AI pair programming chat history & analytics logs',
    found: aiderFound,
    resolvedPath: aiderHome,
    provenanceDefault: 'exact',
  }

  // 6. Cursor
  const cursorDir = path.join(appData, 'Cursor', 'User', 'workspaceStorage')
  const cursorFound = fs.existsSync(cursorDir)

  const cursorInfo: SourcePathInfo = {
    id: 'cursor',
    name: 'Cursor',
    description: 'Cursor IDE workspace storage & composer session chat trees',
    found: cursorFound,
    resolvedPath: cursorDir,
    provenanceDefault: 'estimated',
  }

  // 7. Windsurf
  const windsurfDir = path.join(appData, 'Windsurf', 'User', 'workspaceStorage')
  const windsurfFound = fs.existsSync(windsurfDir)

  const windsurfInfo: SourcePathInfo = {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'Codeium Windsurf IDE cascade session store & trajectories',
    found: windsurfFound,
    resolvedPath: windsurfDir,
    provenanceDefault: 'estimated',
  }

  // 8. Continue.dev
  const continueDir = path.join(home, '.continue', 'sessions')
  const continueFound = fs.existsSync(continueDir)

  const continueInfo: SourcePathInfo = {
    id: 'continue',
    name: 'Continue.dev',
    description: 'Open-source autopilot session JSON logs with message trees',
    found: continueFound,
    resolvedPath: continueDir,
    provenanceDefault: 'estimated',
  }

  return [
    claudeInfo,
    clineInfo,
    rooInfo,
    agyInfo,
    aiderInfo,
    cursorInfo,
    windsurfInfo,
    continueInfo,
  ]
}

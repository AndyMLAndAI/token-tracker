import { app, BrowserWindow, Tray, Menu, Notification, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { getDb, getAppSetting, setAppSetting } from '../db/database'

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k'
  }
  return num.toLocaleString()
}

function formatCurrency(usd: number): string {
  if (usd === 0) return '$0.00'
  if (usd < 0.01) return '< $0.01'
  return `$${usd.toFixed(2)}`
}

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null
  private iconPath: string
  private onQuitCallback: () => void

  constructor(mainWindow: BrowserWindow, onQuit: () => void) {
    this.mainWindow = mainWindow
    this.onQuitCallback = onQuit
    this.iconPath = this.resolveTrayIconPath()
    this.initTray()
  }

  private resolveTrayIconPath(): string {
    const appRoot = process.env.APP_ROOT || path.join(__dirname, '..')

    const candidates = [
      path.join(appRoot, 'build', 'tray-icon.ico'),
      path.join(appRoot, 'build', 'tray-icon.png'),
      path.join(appRoot, 'public', 'tray-icon.ico'),
      path.join(appRoot, 'public', 'tray-icon.png'),
      path.join(appRoot, 'dist', 'tray-icon.ico'),
      path.join(appRoot, 'dist', 'tray-icon.png'),
      path.join(appRoot, 'build', 'icon.ico'),
      path.join(appRoot, 'build', 'icon.png'),
    ]

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p
      }
    }

    return path.join(appRoot, 'build', 'icon.ico')
  }

  private getTodayUsage(): { totalTokens: number; totalCost: number } {
    try {
      const db = getDb()
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      const todayStmt = db.prepare(`
        SELECT 
          COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
          COALESCE(SUM(cost_usd), 0) as total_cost
        FROM turns
        WHERE timestamp >= ?
      `)
      const todayRow = todayStmt.get(oneDayAgo) as any
      return {
        totalTokens: Number(todayRow?.total_tokens || 0),
        totalCost: Number(todayRow?.total_cost || 0),
      }
    } catch (err) {
      console.warn('[TrayManager] Error calculating today usage:', err)
      return { totalTokens: 0, totalCost: 0 }
    }
  }

  private initTray() {
    try {
      let icon = nativeImage.createFromPath(this.iconPath)
      if (process.platform === 'win32' && this.iconPath.endsWith('.ico')) {
        // Native Windows icon handle
        this.tray = new Tray(this.iconPath)
      } else {
        this.tray = new Tray(icon)
      }

      this.updateTray()

      // Left-click toggles window visibility / focus
      this.tray.on('click', () => {
        this.toggleWindow()
      })

      // Double-click on Windows restores window
      this.tray.on('double-click', () => {
        this.restoreWindow()
      })

      console.log('[TrayManager] System tray icon initialized with icon:', this.iconPath)
    } catch (err) {
      console.error('[TrayManager] Failed to initialize system tray:', err)
    }
  }

  public updateTray() {
    if (!this.tray || this.tray.isDestroyed()) return

    const { totalTokens, totalCost } = this.getTodayUsage()
    const tokensStr = formatNumber(totalTokens)
    const costStr = formatCurrency(totalCost)

    // Tooltip: "Token Tracker — 45.7M tokens today ($4.23)"
    const tooltip = `Token Tracker — ${tokensStr} tokens today (${costStr})`
    this.tray.setToolTip(tooltip)

    // Context Menu (Right Click)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Token Tracker',
        click: () => {
          this.restoreWindow()
        },
      },
      { type: 'separator' },
      {
        label: `Today: ${tokensStr} · ${costStr}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.onQuitCallback()
        },
      },
    ])

    this.tray.setContextMenu(contextMenu)
  }

  public toggleWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    if (this.mainWindow.isVisible() && !this.mainWindow.isMinimized() && this.mainWindow.isFocused()) {
      this.mainWindow.hide()
    } else {
      this.restoreWindow()
    }
  }

  public restoreWindow() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore()
    }
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  public showFirstTimeNotification() {
    try {
      const hasShown = getAppSetting('has_shown_tray_first_notification', 'false') === 'true'
      if (hasShown) return

      setAppSetting('has_shown_tray_first_notification', 'true')

      const title = 'Token Tracker'
      const body = 'Token Tracker is still running in the background. Right-click the tray icon to quit.'

      if (Notification.isSupported()) {
        const notif = new Notification({
          title,
          body,
          icon: this.iconPath,
          silent: false,
        })
        notif.show()
      } else if (this.tray && process.platform === 'win32') {
        this.tray.displayBalloon({
          title,
          content: body,
          iconType: 'info',
        })
      }
    } catch (err) {
      console.warn('[TrayManager] First-time notification notice:', err)
    }
  }

  public destroy() {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy()
      this.tray = null
    }
  }
}

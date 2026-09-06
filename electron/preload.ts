import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getDashboardMetrics: () => Promise<any>
  getProjects: () => Promise<any[]>
  getProjectSessions: (projectId: string) => Promise<any[]>
  getSessionTurns: (sessionId: string) => Promise<any[]>
  getSourceStatuses: () => Promise<any[]>
  syncNow: () => Promise<any>
  forceResync: () => Promise<any>
  startProxy: (port?: number) => Promise<{ success: boolean; port?: number; error?: string }>
  stopProxy: () => Promise<{ success: boolean }>
  getProxyStatus: () => Promise<{ running: boolean; port: number; interceptedTurns: number }>
  captureScreenshot: (screenName: string) => Promise<{ success: boolean; path?: string; error?: string }>
  clearTokenUsage: () => Promise<{ success: boolean; error?: string }>
  getBudgets: () => Promise<any[]>
  getBudgetStatus: () => Promise<any | null>
  saveBudget: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>
  deleteBudget: (budgetId: string) => Promise<{ success: boolean; error?: string }>
  getActiveBudgetAlerts: () => Promise<any[]>
  dismissBudgetAlert: (alertId: string) => Promise<{ success: boolean }>
  getReportData: (filter?: { startDate?: number; endDate?: number }) => Promise<any>
  onDataUpdated: (callback: () => void) => () => void
  onBudgetAlert: (callback: (alert: any) => void) => () => void
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
}

const api: ElectronAPI = {
  getDashboardMetrics: () => ipcRenderer.invoke('getDashboardMetrics'),
  getProjects: () => ipcRenderer.invoke('getProjects'),
  getProjectSessions: (projectId: string) => ipcRenderer.invoke('getProjectSessions', projectId),
  getSessionTurns: (sessionId: string) => ipcRenderer.invoke('getSessionTurns', sessionId),
  getSourceStatuses: () => ipcRenderer.invoke('getSourceStatuses'),
  syncNow: () => ipcRenderer.invoke('syncNow'),
  forceResync: () => ipcRenderer.invoke('syncNow'),
  startProxy: (port?: number) => ipcRenderer.invoke('startProxy', port),
  stopProxy: () => ipcRenderer.invoke('stopProxy'),
  getProxyStatus: () => ipcRenderer.invoke('getProxyStatus'),
  captureScreenshot: (screenName: string) => ipcRenderer.invoke('captureScreenshot', screenName),
  clearTokenUsage: () => ipcRenderer.invoke('clearTokenUsage'),
  getBudgets: () => ipcRenderer.invoke('getBudgets'),
  getBudgetStatus: () => ipcRenderer.invoke('getBudgetStatus'),
  saveBudget: (data: any) => ipcRenderer.invoke('saveBudget', data),
  deleteBudget: (budgetId: string) => ipcRenderer.invoke('deleteBudget', budgetId),
  getActiveBudgetAlerts: () => ipcRenderer.invoke('getActiveBudgetAlerts'),
  dismissBudgetAlert: (alertId: string) => ipcRenderer.invoke('dismissBudgetAlert', alertId),
  getReportData: (filter?: { startDate?: number; endDate?: number }) => ipcRenderer.invoke('getReportData', filter),
  onDataUpdated: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('data-updated', handler)
    return () => {
      ipcRenderer.removeListener('data-updated', handler)
    }
  },
  onBudgetAlert: (callback: (alert: any) => void) => {
    const handler = (_event: any, alert: any) => callback(alert)
    ipcRenderer.on('budget-alert', handler)
    return () => {
      ipcRenderer.removeListener('budget-alert', handler)
    }
  },
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isWindowMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onWindowMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: any, isMax: boolean) => callback(isMax)
    ipcRenderer.on('window-maximized-state', handler)
    return () => {
      ipcRenderer.removeListener('window-maximized-state', handler)
    }
  },
}

ipcRenderer.on('navigate-page', (_event, detail) => {
  window.dispatchEvent(new CustomEvent('navigate-to-page', { detail }))
})

contextBridge.exposeInMainWorld('electronAPI', api)

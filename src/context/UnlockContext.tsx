import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface UnlockContextType {
  isUnlocked: boolean
  exportCount: number
  isModalOpen: boolean
  modalReason?: string
  openUnlockModal: (reason?: string) => void
  closeUnlockModal: () => void
  supportAndUnlock: () => Promise<void>
  activateCode: (code: string) => Promise<{ success: boolean; error?: string }>
  checkAndRecordExport: () => Promise<boolean>
  refreshStatus: () => Promise<void>
}

const UnlockContext = createContext<UnlockContextType>({
  isUnlocked: false,
  exportCount: 0,
  isModalOpen: false,
  openUnlockModal: () => {},
  closeUnlockModal: () => {},
  supportAndUnlock: async () => {},
  activateCode: async () => ({ success: false, error: 'Not implemented' }),
  checkAndRecordExport: async () => true,
  refreshStatus: async () => {},
})

export const UnlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const [exportCount, setExportCount] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalReason, setModalReason] = useState<string | undefined>(undefined)

  const refreshStatus = useCallback(async () => {
    if (!window.electronAPI?.getUnlockStatus) return
    try {
      const status = await window.electronAPI.getUnlockStatus()
      setIsUnlocked(status.unlocked)
      setExportCount(status.exportCount)
    } catch (err) {
      console.error('[UnlockContext] Failed to get unlock status:', err)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
    if (window.electronAPI?.onUnlockStatusChanged) {
      const unsub = window.electronAPI.onUnlockStatusChanged((unlocked) => {
        setIsUnlocked(unlocked)
        if (unlocked) {
          setIsModalOpen(false)
        }
      })
      return unsub
    }
  }, [refreshStatus])

  const openUnlockModal = useCallback((reason?: string) => {
    setModalReason(reason)
    setIsModalOpen(true)
  }, [])

  const closeUnlockModal = useCallback(() => {
    setIsModalOpen(false)
    setModalReason(undefined)
  }, [])

  const supportAndUnlock = useCallback(async () => {
    if (window.electronAPI?.openContributionPage) {
      try {
        await window.electronAPI.openContributionPage()
      } catch (err) {
        console.error('[UnlockContext] Failed to open contribution page:', err)
      }
    } else {
      // Browser fallback (dev mode)
      window.open('https://gettokentracker.netlify.app/adcontribution', '_blank')
    }
  }, [])

  const activateCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!code || !code.trim()) {
      return { success: false, error: 'Please enter a code' }
    }

    if (window.electronAPI?.activateWithCode) {
      try {
        const res = await window.electronAPI.activateWithCode(code.trim())
        if (res.success) {
          setIsUnlocked(true)
          setIsModalOpen(false)
        }
        return res
      } catch (err: any) {
        console.error('[UnlockContext] Failed to activate with code:', err)
        return { success: false, error: err.message || 'Activation failed' }
      }
    } else {
      // Dev mode fallback
      setIsUnlocked(true)
      setIsModalOpen(false)
      return { success: true }
    }
  }, [])

  const checkAndRecordExport = useCallback(async (): Promise<boolean> => {
    if (isUnlocked) return true

    if (window.electronAPI?.recordExportUse) {
      try {
        const res = await window.electronAPI.recordExportUse()
        setExportCount(res.count)
        if (res.allowed) {
          return true
        } else {
          openUnlockModal('export_limit')
          return false
        }
      } catch (err) {
        console.error('[UnlockContext] Record export error:', err)
        return true // Fail open if error
      }
    }

    // Dev fallback
    if (exportCount >= 2) {
      openUnlockModal('export_limit')
      return false
    }
    setExportCount((c) => c + 1)
    return true
  }, [isUnlocked, exportCount, openUnlockModal])

  return (
    <UnlockContext.Provider
      value={{
        isUnlocked,
        exportCount,
        isModalOpen,
        modalReason,
        openUnlockModal,
        closeUnlockModal,
        supportAndUnlock,
        activateCode,
        checkAndRecordExport,
        refreshStatus,
      }}
    >
      {children}
    </UnlockContext.Provider>
  )
}

export function useUnlock() {
  return useContext(UnlockContext)
}

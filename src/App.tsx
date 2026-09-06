import { useState, useEffect } from 'react'
import { Shell, PageId } from '@/components/layout/Shell'
import { Dashboard } from '@/pages/Dashboard'
import { Projects } from '@/pages/Projects'
import { SessionDetail } from '@/pages/SessionDetail'
import { Settings } from '@/pages/Settings'

export function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail?.page) {
        setActivePage(e.detail.page)
        if (e.detail.projectId) {
          setSelectedProjectId(e.detail.projectId)
        }
      }
    }
    window.addEventListener('navigate-to-page', handleNav)
    return () => window.removeEventListener('navigate-to-page', handleNav)
  }, [])

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setActivePage('session-detail')
  }

  return (
    <Shell
      activePage={activePage}
      setActivePage={setActivePage}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
    >
      {activePage === 'dashboard' && (
        <Dashboard onSelectProject={handleSelectProject} />
      )}
      {activePage === 'projects' && (
        <Projects onSelectProject={handleSelectProject} />
      )}
      {activePage === 'session-detail' && selectedProjectId && (
        <SessionDetail
          projectId={selectedProjectId}
          onBack={() => setActivePage('projects')}
        />
      )}
      {activePage === 'settings' && <Settings />}
    </Shell>
  )
}

export default App

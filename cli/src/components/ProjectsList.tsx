import React from 'react'
import { Box, Text } from 'ink'
import { Header } from './Header.js'
import { Table } from './Table.js'
import { ProjectSummary } from '../queries.js'
import { formatNumber, formatCurrency, formatRelativeTime, getToolDisplayName } from '../formatters.js'

interface ProjectsListProps {
  projects: ProjectSummary[]
  dbPath?: string | null
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ projects, dbPath }) => {
  const activeProjects = projects.filter(
    (p) => p.name && p.name.trim() !== '' && p.name.toLowerCase() !== 'null' && p.tokens > 0
  )

  const tableData = activeProjects.map((p, idx) => ({
    '#': String(idx + 1),
    'Project': p.name.length > 18 ? p.name.slice(0, 17) + '…' : p.name,
    'Source': getToolDisplayName(p.toolSource),
    'Tokens': formatNumber(p.tokens),
    'Cost': formatCurrency(p.cost),
    'Sessions': String(p.sessions),
    'Turns': String(p.turns),
    'Last Active': formatRelativeTime(p.lastActive),
  }))

  return (
    <Box flexDirection="column" padding={1}>
      <Header dbPath={dbPath} />

      <Box marginBottom={1}>
        <Text bold color="white">
          Active Tracked Projects ({activeProjects.length})
        </Text>
      </Box>

      {activeProjects.length > 0 ? (
        <Table data={tableData} />
      ) : (
        <Box padding={1}>
          <Text dimColor>No active projects found in database.</Text>
        </Box>
      )}
    </Box>
  )
}

export default ProjectsList

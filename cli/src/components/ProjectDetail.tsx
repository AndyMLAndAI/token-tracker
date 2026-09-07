import React from 'react'
import { Box, Text } from 'ink'
import { Header } from './Header.js'
import { Table } from './Table.js'
import { ProjectDetailData } from '../queries.js'
import { formatNumber, formatCurrency, formatDate, getToolDisplayName } from '../formatters.js'

interface ProjectDetailProps {
  data: ProjectDetailData | null
  queryName: string
  dbPath?: string | null
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ data, queryName, dbPath }) => {
  if (!data || !data.project) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header dbPath={dbPath} />
        <Box borderStyle="round" borderColor="red" paddingX={2} paddingY={1}>
          <Text color="red" bold>✖ Project not found matching "{queryName}"</Text>
          <Text dimColor>Run `token-tracker projects` to see all available projects.</Text>
        </Box>
      </Box>
    )
  }

  const { project, sessions } = data

  const sessionsTableData = sessions.map((s) => ({
    'Session': s.id.length > 12 ? s.id.slice(0, 11) + '…' : s.id,
    'Model': s.model ? (s.model.length > 15 ? s.model.slice(0, 14) + '…' : s.model) : 'unknown',
    'Date': formatDate(s.startTime),
    'Turns': String(s.turns),
    'Tokens': formatNumber(s.tokens),
    'Cost': formatCurrency(s.cost),
    'Source': s.provenance === 'exact' ? 'Exact' : s.provenance === 'live_captured' ? 'Live' : 'Est',
  }))

  return (
    <Box flexDirection="column" padding={1}>
      <Header dbPath={dbPath} />

      {/* Project Overview Card */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={0}
        marginBottom={1}
      >
        <Box>
          <Text bold color="white">Project: </Text>
          <Text bold color="cyan">{project.name}</Text>
        </Box>
        <Box>
          <Text dimColor>Path: </Text>
          <Text color="gray">{project.path}</Text>
        </Box>
        <Box>
          <Text dimColor>Source: </Text>
          <Text color="yellow">{getToolDisplayName(project.toolSource)}</Text>
        </Box>
        <Box marginTop={0}>
          <Text dimColor>Total Usage: </Text>
          <Text bold color="white">{formatNumber(project.tokens)} </Text>
          <Text dimColor>tokens · </Text>
          <Text bold color="green">{formatCurrency(project.cost)} </Text>
          <Text dimColor>({project.sessions} sessions, {project.turns} turns)</Text>
        </Box>
      </Box>

      {/* Sessions Table */}
      <Box flexDirection="column">
        <Box marginBottom={0}>
          <Text bold color="white">
            Sessions History ({sessions.length})
          </Text>
        </Box>
        {sessions.length > 0 ? (
          <Table data={sessionsTableData} />
        ) : (
          <Box padding={1}>
            <Text dimColor>No sessions recorded for this project.</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ProjectDetail

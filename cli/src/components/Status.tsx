import React from 'react'
import { Box, Text } from 'ink'
import { Header } from './Header.js'
import { Table } from './Table.js'
import { StatusSummary } from '../queries.js'
import { formatNumber, formatCurrency, formatRelativeTime, getToolDisplayName } from '../formatters.js'

interface StatusProps {
  summary: StatusSummary
  dbPath?: string | null
}

export const Status: React.FC<StatusProps> = ({ summary, dbPath }) => {
  const activeTopProjects = (summary.topProjects || []).filter(
    (p) => p.name && p.name.trim() !== '' && p.name.toLowerCase() !== 'null' && p.tokens > 0
  )

  const topProjectsData = activeTopProjects.map((p, idx) => ({
    '#': String(idx + 1),
    'Project': p.name,
    'Source': getToolDisplayName(p.toolSource),
    'Tokens': formatNumber(p.tokens),
    'Cost': formatCurrency(p.cost),
    'Sessions': String(p.sessions),
    'Last Active': formatRelativeTime(p.lastActive),
  }))

  return (
    <Box flexDirection="column" padding={1}>
      <Header dbPath={dbPath} />

      {/* 3 Metric Cards (Today, Week, All Time) */}
      <Box flexDirection="row" marginBottom={1} gap={2}>
        {/* Today Card */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="green"
          paddingX={2}
          paddingY={0}
          minWidth={28}
        >
          <Text bold color="green">TODAY (24h)</Text>
          <Box marginTop={0}>
            <Text bold color="white">{formatNumber(summary.today.tokens)} </Text>
            <Text dimColor>tokens</Text>
          </Box>
          <Box>
            <Text color="green" bold>{formatCurrency(summary.today.cost)} </Text>
            <Text dimColor>({summary.today.turns.toLocaleString()} turns)</Text>
          </Box>
        </Box>

        {/* This Week Card */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          paddingX={2}
          paddingY={0}
          minWidth={28}
        >
          <Text bold color="cyan">THIS WEEK (7d)</Text>
          <Box marginTop={0}>
            <Text bold color="white">{formatNumber(summary.week.tokens)} </Text>
            <Text dimColor>tokens</Text>
          </Box>
          <Box>
            <Text color="cyan">{formatCurrency(summary.week.cost)} </Text>
            <Text dimColor>({summary.week.turns.toLocaleString()} turns)</Text>
          </Box>
        </Box>

        {/* All Time Card */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="gray"
          paddingX={2}
          paddingY={0}
          minWidth={28}
        >
          <Text bold dimColor>ALL TIME</Text>
          <Box marginTop={0}>
            <Text bold color="white">{formatNumber(summary.allTime.tokens)} </Text>
            <Text dimColor>tokens</Text>
          </Box>
          <Box>
            <Text color="white">{formatCurrency(summary.allTime.cost)} </Text>
            <Text dimColor>({summary.allTime.turns.toLocaleString()} turns)</Text>
          </Box>
        </Box>
      </Box>

      {/* Top 3 Active Projects */}
      <Box flexDirection="column" marginTop={1}>
        <Box marginBottom={0}>
          <Text bold color="white">Top Active Projects</Text>
        </Box>
        {summary.topProjects.length > 0 ? (
          <Table data={topProjectsData} />
        ) : (
          <Text dimColor>No project data recorded yet.</Text>
        )}
      </Box>
    </Box>
  )
}

export default Status

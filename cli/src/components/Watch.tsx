import React, { useState, useEffect } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { Header } from './Header.js'
import { Table } from './Table.js'
import { getStatusSummary, StatusSummary } from '../queries.js'
import { formatNumber, formatCurrency, formatRelativeTime, getToolDisplayName } from '../formatters.js'

interface WatchProps {
  dbPath?: string | null
}

export const Watch: React.FC<WatchProps> = ({ dbPath }) => {
  const { exit } = useApp()
  const [summary, setSummary] = useState<StatusSummary>(() => getStatusSummary())
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString())
  const [pulse, setPulse] = useState(true)

  // Listen for Ctrl+C or 'q' when stdin is interactive TTY
  useInput(
    (input, key) => {
      if ((key.ctrl && input === 'c') || input === 'q') {
        exit()
        process.exit(0)
      }
    },
    { isActive: Boolean(process.stdin && process.stdin.isTTY) }
  )

  // Listen for OS process signals (SIGINT / SIGTERM)
  useEffect(() => {
    const handleExit = () => {
      exit()
      process.exit(0)
    }
    process.on('SIGINT', handleExit)
    process.on('SIGTERM', handleExit)
    return () => {
      process.off('SIGINT', handleExit)
      process.off('SIGTERM', handleExit)
    }
  }, [exit])

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const fresh = getStatusSummary()
        setSummary(fresh)
        setLastUpdated(new Date().toLocaleTimeString())
        setPulse((p) => !p)
      } catch (err) {
        // Handled silently during concurrent access
      }
    }, 2000)

    return () => clearInterval(timer)
  }, [])

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
      <Header
        dbPath={dbPath}
        live={true}
        lastUpdated={lastUpdated}
      />

      {/* Live Status Metric Cards */}
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
          <Box>
            <Text color={pulse ? 'green' : 'gray'}>● </Text>
            <Text bold color="green">TODAY (24h)</Text>
          </Box>
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

      {/* Top Active Projects */}
      <Box flexDirection="column" marginTop={1}>
        <Box marginBottom={0}>
          <Text bold color="white">Live Active Projects</Text>
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

export default Watch

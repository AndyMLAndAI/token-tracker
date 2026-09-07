import React from 'react'
import { Box, Text } from 'ink'

interface HeaderProps {
  dbPath?: string | null
  live?: boolean
  lastUpdated?: string
}

export const Header: React.FC<HeaderProps> = ({ dbPath, live, lastUpdated }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        {live ? (
          <Box marginRight={1}>
            <Text color="green" bold>● LIVE</Text>
          </Box>
        ) : null}
        <Text bold color="white">TOKEN TRACKER</Text>
        <Text color="cyan"> v1.8.0</Text>
        <Text dimColor> · Exact Local AI Token &amp; Cost Companion</Text>
      </Box>

      {lastUpdated ? (
        <Box marginTop={0}>
          <Text dimColor>Last updated: {lastUpdated} · Press Ctrl+C to exit</Text>
        </Box>
      ) : dbPath ? (
        <Box marginTop={0}>
          <Text dimColor>Database: {dbPath}</Text>
        </Box>
      ) : null}
    </Box>
  )
}

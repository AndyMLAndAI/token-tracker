import React from 'react'
import { Box, Text } from 'ink'

export interface TableProps {
  data: Record<string, any>[]
  columns?: string[]
  padding?: number
}

export const Table: React.FC<TableProps> = ({ data, columns, padding = 1 }) => {
  if (!data || data.length === 0) {
    return (
      <Box padding={1}>
        <Text dimColor>No records found.</Text>
      </Box>
    )
  }

  // Determine keys from columns or keys present in data
  const colKeys: string[] = columns || (data[0] ? Object.keys(data[0]) : [])

  // Calculate width of each column (longest string + padding)
  const colWidths = colKeys.map((key) => {
    const headerLen = String(key).length
    const maxDataLen = data.reduce((max, row) => {
      const val = row[key]
      const strLen = val !== undefined && val !== null ? String(val).length : 0
      return Math.max(max, strLen)
    }, 0)
    return Math.max(headerLen, maxDataLen) + padding * 2
  })

  const borderLine = (left: string, mid: string, right: string, char: string) => {
    const line = left + colWidths.map((w) => char.repeat(w)).join(mid) + right
    return <Text dimColor>{line}</Text>
  }

  return (
    <Box flexDirection="column">
      {/* Top Border */}
      {borderLine('┌', '┬', '┐', '─')}

      {/* Header Row */}
      <Box flexDirection="row">
        <Text dimColor>│</Text>
        {colKeys.map((key, idx) => {
          const width = colWidths[idx]
          const label = String(key)
          const leftPad = ' '.repeat(padding)
          const rightPad = ' '.repeat(Math.max(0, width - label.length - padding))
          return (
            <React.Fragment key={idx}>
              <Text bold color="cyan">
                {leftPad}{label}{rightPad}
              </Text>
              <Text dimColor>│</Text>
            </React.Fragment>
          )
        })}
      </Box>

      {/* Divider */}
      {borderLine('├', '┼', '┤', '─')}

      {/* Data Rows */}
      {data.map((row, rowIdx) => (
        <React.Fragment key={rowIdx}>
          <Box flexDirection="row">
            <Text dimColor>│</Text>
            {colKeys.map((key, colIdx) => {
              const width = colWidths[colIdx]
              const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : ''
              const leftPad = ' '.repeat(padding)
              const rightPad = ' '.repeat(Math.max(0, width - val.length - padding))

              return (
                <React.Fragment key={colIdx}>
                  <Text color="white">
                    {leftPad}{val}{rightPad}
                  </Text>
                  <Text dimColor>│</Text>
                </React.Fragment>
              )
            })}
          </Box>
          {rowIdx < data.length - 1 ? borderLine('├', '┼', '┤', '─') : null}
        </React.Fragment>
      ))}

      {/* Bottom Border */}
      {borderLine('└', '┴', '┘', '─')}
    </Box>
  )
}

export default Table

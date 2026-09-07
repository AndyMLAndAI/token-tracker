#!/usr/bin/env node

process.removeAllListeners('warning')
const originalEmit = process.emit
process.emit = function (name, data, ...rest) {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'ExperimentalWarning'
  ) {
    return false
  }
  return originalEmit.apply(process, [name, data, ...rest])
}

const { run } = await import('../dist/cli.js')
run()

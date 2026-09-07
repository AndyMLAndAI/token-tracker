import React from 'react'
import { render } from 'ink'
import { resolveDbPath } from './db.js'
import { getStatusSummary, getAllProjects, getProjectDetail } from './queries.js'
import { Status } from './components/Status.js'
import { Watch } from './components/Watch.js'
import { ProjectsList } from './components/ProjectsList.js'
import { ProjectDetail } from './components/ProjectDetail.js'

function printHelp() {
  console.log(`
TOKEN TRACKER v1.8.0 · Exact Local AI Token & Cost Companion (React/Ink CLI)

USAGE:
  token-tracker [command] [options]
  tt [command] [options]

COMMANDS:
  status           Show today/week token totals & top projects (default)
  watch            Live-updating terminal monitor (in-place re-renders)
  projects         List all active projects with usage totals (no null/empty)
  project <name>   Show detailed session breakdown for a project

OPTIONS:
  --json           Output raw JSON instead of tables (bypasses Ink UI)
  -h, --help       Display this help message
  -v, --version    Show Token Tracker CLI version

EXAMPLES:
  tt
  tt status --json
  tt projects
  tt project "Spartan"
  tt watch
`)
}

export async function run(args = process.argv.slice(2)) {
  const isJson = args.includes('--json')
  const cleanArgs = args.filter((a) => a !== '--json')
  const command = cleanArgs[0] || 'status'

  if (cleanArgs.includes('-h') || cleanArgs.includes('--help') || command === 'help') {
    printHelp()
    process.exit(0)
  }

  if (cleanArgs.includes('-v') || cleanArgs.includes('--version') || command === 'version') {
    console.log('1.7.0')
    process.exit(0)
  }

  const dbPath = resolveDbPath()

  // 1. JSON Mode: Bypass Ink entirely for scriptable raw JSON output
  if (isJson) {
    switch (command) {
      case 'status':
      case 'watch': {
        const summary = getStatusSummary()
        console.log(JSON.stringify(summary, null, 2))
        process.exit(0)
      }
      case 'projects': {
        const projects = getAllProjects()
        console.log(JSON.stringify(projects, null, 2))
        process.exit(0)
      }
      case 'project': {
        const queryName = cleanArgs.slice(1).join(' ').trim()
        if (!queryName) {
          console.error(JSON.stringify({ error: 'Please provide a project name or ID' }))
          process.exit(1)
        }
        const detail = getProjectDetail(queryName)
        if (!detail) {
          console.error(JSON.stringify({ error: `Project not found: ${queryName}` }))
          process.exit(1)
        }
        console.log(JSON.stringify(detail, null, 2))
        process.exit(0)
      }
      default: {
        console.error(JSON.stringify({ error: `Unknown command: ${command}` }))
        process.exit(1)
      }
    }
  }

  // 2. Ink Interactive Terminal Mode
  switch (command) {
    case 'status': {
      const summary = getStatusSummary()
      const app = render(<Status summary={summary} dbPath={dbPath} />)
      await app.waitUntilExit()
      break
    }

    case 'watch': {
      const app = render(<Watch dbPath={dbPath} />)
      await app.waitUntilExit()
      break
    }

    case 'projects': {
      const projects = getAllProjects()
      const app = render(<ProjectsList projects={projects} dbPath={dbPath} />)
      await app.waitUntilExit()
      break
    }

    case 'project': {
      const queryName = cleanArgs.slice(1).join(' ').trim()
      if (!queryName) {
        console.error('\n✖ Error: Please provide a project name or ID. Example: token-tracker project "Spartan"\n')
        process.exit(1)
      }
      const detail = getProjectDetail(queryName)
      const app = render(<ProjectDetail data={detail} queryName={queryName} dbPath={dbPath} />)
      await app.waitUntilExit()
      break
    }

    default: {
      console.error(`\n✖ Unknown command: "${command}"`)
      printHelp()
      process.exit(1)
    }
  }
}

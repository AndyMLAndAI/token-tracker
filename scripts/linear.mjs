import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const TEAM_ID = 'ea35b153-90a1-4675-a6c6-73a74406eaa8' // Team 'Andy' (AND)
const PROJECT_ID = '990629f8-f8cc-484f-8912-5534f280f7c5' // Project 'Token Tracker'
const DONE_STATE_ID = 'ee4b3d17-d454-41de-b869-65b0568d1672' // State 'Done'
const GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql'

function getApiKey() {
  if (process.env.LINEAR_API_KEY) {
    return process.env.LINEAR_API_KEY
  }

  const configPath = path.join(os.homedir(), '.gemini', 'config', 'mcp_config.json')
  if (fs.existsSync(configPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      const authHeader = data?.mcpServers?.linear?.headers?.Authorization
      if (authHeader) {
        return authHeader.replace(/^Bearer\s+/i, '')
      }
    } catch {}
  }

  throw new Error('Linear API key not found in environment or mcp_config.json')
}

async function executeQuery(query, variables = {}) {
  const apiKey = getApiKey()
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()
  if (json.errors) {
    throw new Error(`Linear GraphQL Error: ${JSON.stringify(json.errors)}`)
  }
  return json.data
}

export async function createIssue({ title, description = '', priority = 0 }) {
  const query = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
          state {
            name
          }
        }
      }
    }
  `
  const data = await executeQuery(query, {
    input: {
      teamId: TEAM_ID,
      projectId: PROJECT_ID,
      title,
      description,
      priority: Number(priority),
    },
  })
  return data.issueCreate.issue
}

export async function closeIssue(issueIdOrIdentifier) {
  // If identifier (e.g. AND-1) is provided, lookup issue ID first
  let id = issueIdOrIdentifier
  if (id.includes('-') && !id.includes(' ')) {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
        }
      }
    `
    const data = await executeQuery(query, { id })
    if (data?.issue?.id) {
      id = data.issue.id
    }
  }

  const query = `
    mutation CloseIssue($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id
          identifier
          title
          url
          state {
            name
          }
        }
      }
    }
  `
  const data = await executeQuery(query, {
    id,
    input: {
      stateId: DONE_STATE_ID,
    },
  })
  return data.issueUpdate.issue
}

export async function listIssues() {
  const query = `
    query GetProjectIssues($projectId: String!) {
      project(id: $projectId) {
        issues {
          nodes {
            id
            identifier
            title
            url
            priority
            state {
              name
            }
          }
        }
      }
    }
  `
  const data = await executeQuery(query, { projectId: PROJECT_ID })
  return data.project.issues.nodes
}

// CLI handler if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const [,, cmd, ...args] = process.argv

  try {
    if (cmd === 'create') {
      const title = args[0]
      const description = args[1] || ''
      const priority = args[2] ? parseInt(args[2], 10) : 0
      if (!title) {
        console.error('Usage: node scripts/linear.mjs create <title> [description] [priority]')
        process.exit(1)
      }
      const issue = await createIssue({ title, description, priority })
      console.log(`Created issue: ${issue.identifier} - ${issue.title} (${issue.url})`)
    } else if (cmd === 'close' || cmd === 'cut') {
      const target = args[0]
      if (!target) {
        console.error('Usage: node scripts/linear.mjs close <issueId|identifier>')
        process.exit(1)
      }
      const issue = await closeIssue(target)
      console.log(`Cut issue: ${issue.identifier} - ${issue.title} -> State: ${issue.state.name}`)
    } else if (cmd === 'list') {
      const issues = await listIssues()
      if (issues.length === 0) {
        console.log('No issues found in Token Tracker project.')
      } else {
        console.log(`Issues in Token Tracker (${issues.length}):`)
        for (const i of issues) {
          console.log(`- [${i.identifier}] ${i.title} (${i.state.name}) -> ${i.url}`)
        }
      }
    } else {
      console.log('Commands: create, list')
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

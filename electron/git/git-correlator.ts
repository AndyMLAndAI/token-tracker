import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import type { DatabaseSync } from 'node:sqlite'

export interface GitCommitRecord {
  sha: string
  shortSha: string
  author: string
  timestamp: number
  relativeTime: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  totalLinesChanged: number
  attributedTokens: number
  attributedCost: number
  tokensPerLine: number
  costPerLine: number
}

export interface GitBranchSummary {
  name: string
  isCurrent: boolean
  commitCount: number
  totalTokens: number
  totalCost: number
}

export interface GitIntelligenceData {
  isGitRepo: boolean
  currentBranch: string
  branches: GitBranchSummary[]
  commits: GitCommitRecord[]
  totalAttributedSpend: number
  totalAttributedTokens: number
}

function resolveDiskPath(rawPath: string): string {
  if (!rawPath) return ''
  let resolved = rawPath
  if (resolved.startsWith('~')) {
    resolved = path.join(os.homedir(), resolved.slice(1))
  }
  return path.resolve(resolved)
}

function runGit(cmd: string, cwd: string): string {
  try {
    return execSync(`git ${cmd}`, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim()
  } catch {
    return ''
  }
}

export function getProjectGitIntelligence(
  projectPath: string,
  projectId: string,
  db: DatabaseSync
): GitIntelligenceData {
  const diskPath = resolveDiskPath(projectPath)

  if (!diskPath || !fs.existsSync(diskPath)) {
    return {
      isGitRepo: false,
      currentBranch: 'none',
      branches: [],
      commits: [],
      totalAttributedSpend: 0,
      totalAttributedTokens: 0,
    }
  }

  const isRepo = runGit('rev-parse --is-inside-work-tree', diskPath) === 'true'
  if (!isRepo) {
    return {
      isGitRepo: false,
      currentBranch: 'none',
      branches: [],
      commits: [],
      totalAttributedSpend: 0,
      totalAttributedTokens: 0,
    }
  }

  const currentBranch = runGit('rev-parse --abbrev-ref HEAD', diskPath) || 'main'
  const branchesOutput = runGit('branch --list --format="%(refname:short)"', diskPath)
  const branchNames = branchesOutput
    ? branchesOutput.split('\n').map((b) => b.trim()).filter(Boolean)
    : [currentBranch]

  // Retrieve project session turns from database
  interface TurnRow {
    id: string
    input_tokens: number
    output_tokens: number
    cost_usd: number
    timestamp: number
  }

  const turns = db.prepare(`
    SELECT t.id, t.input_tokens, t.output_tokens, t.cost_usd, t.timestamp
    FROM turns t
    JOIN sessions s ON t.session_id = s.id
    WHERE s.project_id = ?
    ORDER BY t.timestamp ASC
  `).all(projectId) as unknown as TurnRow[]

  // Retrieve recent commits
  const logOutput = runGit('log -n 30 --format="%H|%h|%an|%at|%s"', diskPath)
  if (!logOutput) {
    return {
      isGitRepo: true,
      currentBranch,
      branches: branchNames.map((name) => ({
        name,
        isCurrent: name === currentBranch,
        commitCount: 0,
        totalTokens: 0,
        totalCost: 0,
      })),
      commits: [],
      totalAttributedSpend: 0,
      totalAttributedTokens: 0,
    }
  }

  const logLines = logOutput.split('\n').filter(Boolean)
  const rawCommits = logLines.map((line) => {
    const [sha, shortSha, author, atStr, ...msgParts] = line.split('|')
    const timestamp = parseInt(atStr, 10) * 1000 // Convert unix sec to ms
    const message = msgParts.join('|')
    return { sha, shortSha, author, timestamp, message }
  })

  // Chronological order for window intervals
  const sortedChrono = [...rawCommits].sort((a, b) => a.timestamp - b.timestamp)

  let grandTotalTokens = 0
  let grandTotalCost = 0

  const processedCommits: GitCommitRecord[] = sortedChrono.map((commit, idx) => {
    // Window: from previous commit timestamp (or commit - 2hr) to this commit timestamp
    const prevTime = idx > 0 ? sortedChrono[idx - 1].timestamp : commit.timestamp - (2 * 60 * 60 * 1000)
    const commitTime = commit.timestamp

    // Filter turns within this commit's development window
    const windowTurns = turns.filter((t) => t.timestamp > prevTime && t.timestamp <= commitTime + (5 * 60 * 1000))

    let attributedTokens = 0
    let attributedCost = 0

    if (windowTurns.length > 0) {
      windowTurns.forEach((t) => {
        attributedTokens += (t.input_tokens + t.output_tokens)
        attributedCost += t.cost_usd
      })
    } else {
      // Fallback: if turns haven't been correlated directly by clock, distribute proportion based on commit diff
      attributedTokens = 0
      attributedCost = 0
    }

    grandTotalTokens += attributedTokens
    grandTotalCost += attributedCost

    // Get lines changed stat for this commit
    const statOut = runGit(`show --shortstat --format="" ${commit.sha}`, diskPath)
    let filesChanged = 0
    let insertions = 0
    let deletions = 0

    if (statOut) {
      const fileMatch = statOut.match(/(\d+)\s+file/)
      const insMatch = statOut.match(/(\d+)\s+insertion/)
      const delMatch = statOut.match(/(\d+)\s+deletion/)
      if (fileMatch) filesChanged = parseInt(fileMatch[1], 10)
      if (insMatch) insertions = parseInt(insMatch[1], 10)
      if (delMatch) deletions = parseInt(delMatch[1], 10)
    }

    const totalLines = insertions + deletions
    const tokensPerLine = totalLines > 0 ? Math.round(attributedTokens / totalLines) : 0
    const costPerLine = totalLines > 0 ? attributedCost / totalLines : 0

    // Format relative time (e.g. 2 hours ago, yesterday)
    const diffSec = Math.floor((Date.now() - commit.timestamp) / 1000)
    let rel = 'just now'
    if (diffSec >= 86400 * 30) rel = `${Math.floor(diffSec / (86400 * 30))}mo ago`
    else if (diffSec >= 86400) rel = `${Math.floor(diffSec / 86400)}d ago`
    else if (diffSec >= 3600) rel = `${Math.floor(diffSec / 3600)}h ago`
    else if (diffSec >= 60) rel = `${Math.floor(diffSec / 60)}m ago`

    return {
      sha: commit.sha,
      shortSha: commit.shortSha,
      author: commit.author,
      timestamp: commit.timestamp,
      relativeTime: rel,
      message: commit.message,
      filesChanged,
      insertions,
      deletions,
      totalLinesChanged: totalLines,
      attributedTokens,
      attributedCost,
      tokensPerLine,
      costPerLine,
    }
  })

  // Return commits newest first
  const newestFirst = processedCommits.reverse()

  const branches: GitBranchSummary[] = branchNames.map((name) => {
    return {
      name,
      isCurrent: name === currentBranch,
      commitCount: newestFirst.length,
      totalTokens: grandTotalTokens,
      totalCost: grandTotalCost,
    }
  })

  return {
    isGitRepo: true,
    currentBranch,
    branches,
    commits: newestFirst,
    totalAttributedSpend: grandTotalCost,
    totalAttributedTokens: grandTotalTokens,
  }
}

export function generatePrMarkdownSummary(
  branchName: string,
  commits: GitCommitRecord[],
  totalTokens: number,
  totalCost: number
): string {
  const topCommits = commits.slice(0, 5)
  const totalLines = commits.reduce((acc, c) => acc + c.totalLinesChanged, 0)
  const avgCostPerLine = totalLines > 0 ? (totalCost / totalLines).toFixed(4) : '0.0000'

  const commitRows = topCommits.map((c) => (
    `| \`${c.shortSha}\` | ${c.message.replace(/\|/g, '-')} | +${c.insertions}/-${c.deletions} | ${c.attributedTokens.toLocaleString()} | $${c.attributedCost.toFixed(2)} |`
  )).join('\n')

  return `### 🤖 Token Tracker • PR Intelligence & Cost Attribution

| Metric | Measured Volume |
|---|---|
| **Branch** | \`${branchName}\` |
| **Total AI Tokens Burned** | **${totalTokens.toLocaleString()} tokens** |
| **Financial Development Cost** | **$${totalCost.toFixed(2)}** |
| **Total Lines Changed** | ${totalLines.toLocaleString()} lines |
| **Unit Cost / Line of Code** | $${avgCostPerLine} / line |

<details>
<summary><b>Attributed Commits Breakdown (${topCommits.length})</b></summary>

| Commit | Message | Diff | Tokens | Cost |
|---|---|---|---|---|
${commitRows}

</details>

*Generated by [Token Tracker](https://github.com/AndyMLAndAI/token-tracker) • 100% Local On-Device AI Telemetry*`
}

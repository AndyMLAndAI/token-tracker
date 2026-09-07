import { getReadOnlyDb } from './db.js'

export interface UsageMetric {
  tokens: number
  cost: number
  turns: number
}

export interface AllTimeMetric extends UsageMetric {
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheCreation: number
}

export interface TopProject {
  id: string
  name: string
  toolSource: string
  tokens: number
  cost: number
  sessions: number
  lastActive: number | null
}

export interface StatusSummary {
  today: UsageMetric
  week: UsageMetric
  allTime: AllTimeMetric
  topProjects: TopProject[]
}

export interface ProjectSummary {
  id: string
  name: string
  toolSource: string
  path: string
  tokens: number
  cost: number
  sessions: number
  turns: number
  lastActive: number | null
}

export interface SessionDetail {
  id: string
  model: string
  toolSource: string
  startTime: number
  externalId: string | null
  provenance: string
  tokens: number
  cost: number
  turns: number
}

export interface ProjectDetailData {
  project: {
    id: string
    name: string
    toolSource: string
    path: string
    createdAt: number
    tokens: number
    cost: number
    sessions: number
    turns: number
  }
  sessions: SessionDetail[]
}

export function getStatusSummary(): StatusSummary {
  const db = getReadOnlyDb()
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

  // Today
  const todayRow = db.prepare(`
    SELECT 
      COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COUNT(id) as turn_count
    FROM turns
    WHERE timestamp >= ?
  `).get(oneDayAgo) as any

  // Week
  const weekRow = db.prepare(`
    SELECT 
      COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COUNT(id) as turn_count
    FROM turns
    WHERE timestamp >= ?
  `).get(oneWeekAgo) as any

  // All time
  const allTimeRow = db.prepare(`
    SELECT 
      COALESCE(SUM(input_tokens), 0) as input_tokens,
      COALESCE(SUM(output_tokens), 0) as output_tokens,
      COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
      COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
      COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost,
      COUNT(id) as total_turns
    FROM turns
  `).get() as any

  // Top 3 projects (filter out null/empty/zero-token projects)
  const topProjects = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.tool_source,
      COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
      COALESCE(SUM(t.cost_usd), 0) as total_cost,
      COUNT(DISTINCT s.id) as sessions_count,
      MAX(t.timestamp) as last_active
    FROM projects p
    JOIN sessions s ON s.project_id = p.id
    JOIN turns t ON t.session_id = s.id
    WHERE p.name IS NOT NULL 
      AND TRIM(p.name) != '' 
      AND LOWER(p.name) != 'null'
      AND LOWER(p.name) != 'undefined'
    GROUP BY p.id
    HAVING total_tokens > 0 AND sessions_count > 0
    ORDER BY total_tokens DESC
    LIMIT 3
  `).all() as any[]

  return {
    today: {
      tokens: Number(todayRow?.total_tokens || 0),
      cost: Number(todayRow?.total_cost || 0),
      turns: Number(todayRow?.turn_count || 0),
    },
    week: {
      tokens: Number(weekRow?.total_tokens || 0),
      cost: Number(weekRow?.total_cost || 0),
      turns: Number(weekRow?.turn_count || 0),
    },
    allTime: {
      inputTokens: Number(allTimeRow?.input_tokens || 0),
      outputTokens: Number(allTimeRow?.output_tokens || 0),
      tokens: Number(allTimeRow?.total_tokens || 0),
      cacheRead: Number(allTimeRow?.cache_read_tokens || 0),
      cacheCreation: Number(allTimeRow?.cache_creation_tokens || 0),
      cost: Number(allTimeRow?.total_cost || 0),
      turns: Number(allTimeRow?.total_turns || 0),
    },
    topProjects: topProjects.map((p) => ({
      id: p.id,
      name: p.name,
      toolSource: p.tool_source,
      tokens: Number(p.total_tokens),
      cost: Number(p.total_cost),
      sessions: Number(p.sessions_count),
      lastActive: p.last_active ? Number(p.last_active) : null,
    })),
  }
}

export function getAllProjects(): ProjectSummary[] {
  const db = getReadOnlyDb()

  // Filter out null/empty/zero-token projects, matching desktop app logic
  const rows = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.tool_source,
      p.path,
      COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
      COALESCE(SUM(t.cost_usd), 0) as total_cost,
      COUNT(DISTINCT s.id) as sessions_count,
      COUNT(t.id) as turns_count,
      MAX(t.timestamp) as last_active
    FROM projects p
    JOIN sessions s ON s.project_id = p.id
    JOIN turns t ON t.session_id = s.id
    WHERE p.name IS NOT NULL 
      AND TRIM(p.name) != '' 
      AND LOWER(p.name) != 'null'
      AND LOWER(p.name) != 'undefined'
    GROUP BY p.id
    HAVING total_tokens > 0 AND sessions_count > 0
    ORDER BY total_tokens DESC
  `).all() as any[]

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    toolSource: p.tool_source,
    path: p.path,
    tokens: Number(p.total_tokens || 0),
    cost: Number(p.total_cost || 0),
    sessions: Number(p.sessions_count || 0),
    turns: Number(p.turns_count || 0),
    lastActive: p.last_active ? Number(p.last_active) : null,
  }))
}

export function getProjectDetail(query: string): ProjectDetailData | null {
  const db = getReadOnlyDb()

  const projectRow = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.tool_source,
      p.path,
      p.created_at,
      COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
      COALESCE(SUM(t.cost_usd), 0) as total_cost,
      COUNT(DISTINCT s.id) as sessions_count,
      COUNT(t.id) as turns_count
    FROM projects p
    JOIN sessions s ON s.project_id = p.id
    JOIN turns t ON t.session_id = s.id
    WHERE (p.id = ? OR p.name LIKE ?)
      AND p.name IS NOT NULL 
      AND TRIM(p.name) != '' 
      AND LOWER(p.name) != 'null'
      AND LOWER(p.name) != 'undefined'
    GROUP BY p.id
    HAVING total_tokens > 0 AND sessions_count > 0
    ORDER BY total_tokens DESC
    LIMIT 1
  `).get(query, `%${query}%`) as any

  if (!projectRow) {
    return null
  }

  const sessions = db.prepare(`
    SELECT 
      s.id,
      s.model,
      s.tool_source,
      s.start_time,
      s.external_id,
      s.provenance,
      COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
      COALESCE(SUM(t.cost_usd), 0) as total_cost,
      COUNT(t.id) as turns_count
    FROM sessions s
    JOIN turns t ON t.session_id = s.id
    WHERE s.project_id = ?
    GROUP BY s.id
    HAVING total_tokens > 0 OR turns_count > 0
    ORDER BY s.start_time DESC
    LIMIT 100
  `).all(projectRow.id) as any[]

  return {
    project: {
      id: projectRow.id,
      name: projectRow.name,
      toolSource: projectRow.tool_source,
      path: projectRow.path,
      createdAt: Number(projectRow.created_at),
      tokens: Number(projectRow.total_tokens || 0),
      cost: Number(projectRow.total_cost || 0),
      sessions: Number(projectRow.sessions_count || 0),
      turns: Number(projectRow.turns_count || 0),
    },
    sessions: sessions.map((s) => ({
      id: s.id,
      model: s.model || 'unknown',
      toolSource: s.tool_source,
      startTime: Number(s.start_time),
      externalId: s.external_id,
      provenance: s.provenance || 'exact',
      tokens: Number(s.total_tokens || 0),
      cost: Number(s.total_cost || 0),
      turns: Number(s.turns_count || 0),
    })),
  }
}

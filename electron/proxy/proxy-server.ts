import http from 'node:http'
import https from 'node:https'
import crypto from 'node:crypto'
import { getDb } from '../db/database'
import { calculateTurnCost } from '../ingestion/pricing'

export interface ProxyStatus {
  running: boolean
  port: number
  interceptedTurns: number
}

class LocalLoopbackProxy {
  private server: http.Server | null = null
  private port: number = 19840
  private isRunning: boolean = false
  private interceptedTurnsCount: number = 0

  constructor() {
    this.server = null
  }

  public getStatus(): ProxyStatus {
    return {
      running: this.isRunning,
      port: this.port,
      interceptedTurns: this.interceptedTurnsCount,
    }
  }

  public start(port: number = 19840): Promise<number> {
    if (this.isRunning && this.server) {
      return Promise.resolve(this.port)
    }

    this.port = port
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res)
      })

      this.server.on('error', (err) => {
        console.error('[Proxy] Server error:', err)
        this.isRunning = false
        reject(err)
      })

      this.server.listen(this.port, '127.0.0.1', () => {
        this.isRunning = true
        console.log(`[Proxy] Local loopback interceptor running on http://127.0.0.1:${this.port}/v1`)
        resolve(this.port)
      })
    })
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server && this.isRunning) {
        this.server.close(() => {
          this.isRunning = false
          this.server = null
          console.log('[Proxy] Server stopped.')
          resolve()
        })
      } else {
        this.isRunning = false
        this.server = null
        resolve()
      }
    })
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/v1/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', proxy: 'token_tracker', port: this.port }))
      return
    }

    const url = req.url || ''
    const isAnthropic = url.includes('/messages')
    const isOpenAI = url.includes('/chat/completions') || url.includes('/completions')

    if (!isAnthropic && !isOpenAI) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Endpoint not supported by proxy. Supported: /v1/messages, /v1/chat/completions' }))
      return
    }

    // Determine upstream target host
    const targetHost = isAnthropic ? 'api.anthropic.com' : 'api.openai.com'
    const targetPath = url.startsWith('/v1') ? url : `/v1${url}`

    // Collect request body
    const bodyChunks: Buffer[] = []
    req.on('data', (chunk) => bodyChunks.push(chunk))
    req.on('end', () => {
      const requestBuffer = Buffer.concat(bodyChunks)
      let parsedBody: any = {}
      try {
        parsedBody = JSON.parse(requestBuffer.toString('utf8'))
      } catch {}

      const modelName = parsedBody.model || (isAnthropic ? 'claude-3-7-sonnet' : 'gpt-4o')
      const projectName = (req.headers['x-project-name'] as string) ||
                          (req.headers['x-project-path'] as string) ||
                          'Proxy Intercepted Traffic'

      // Forward request to real upstream
      const upstreamHeaders = { ...req.headers }
      delete upstreamHeaders['host']
      upstreamHeaders['host'] = targetHost

      const proxyReq = https.request(
        {
          host: targetHost,
          port: 443,
          path: targetPath,
          method: req.method,
          headers: upstreamHeaders,
        },
        (upstreamRes) => {
          // Forward upstream status and headers directly to client
          res.writeHead(upstreamRes.statusCode || 200, upstreamRes.headers)

          let responseChunks: Buffer[] = []

          upstreamRes.on('data', (chunk) => {
            res.write(chunk)
            responseChunks.push(chunk)
          })

          upstreamRes.on('end', () => {
            res.end()

            // Process usage statistics asynchronously after response finishes
            const fullResponse = Buffer.concat(responseChunks).toString('utf8')
            this.recordLiveUsage(modelName, projectName, fullResponse, isAnthropic)
          })
        }
      )

      proxyReq.on('error', (err) => {
        console.error('[Proxy] Upstream request error:', err)
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
        }
        res.end(JSON.stringify({ error: 'Bad Gateway: failed to connect to upstream API', details: err.message }))
      })

      proxyReq.write(requestBuffer)
      proxyReq.end()
    })
  }

  private recordLiveUsage(modelName: string, projectName: string, responseText: string, isAnthropic: boolean) {
    try {
      let inTok = 0
      let outTok = 0
      let cacheRead = 0
      let cacheCreation = 0

      if (isAnthropic) {
        // Handle SSE stream or JSON
        if (responseText.includes('event: message_start') || responseText.includes('event: message_delta')) {
          const lines = responseText.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'message_start' && data.message?.usage) {
                  inTok = data.message.usage.input_tokens || 0
                  cacheRead = data.message.usage.cache_read_input_tokens || 0
                  cacheCreation = data.message.usage.cache_creation_input_tokens || 0
                }
                if (data.type === 'message_delta' && data.usage) {
                  outTok = data.usage.output_tokens || 0
                }
              } catch {}
            }
          }
        } else {
          // Standard JSON response
          const json = JSON.parse(responseText)
          if (json.usage) {
            inTok = json.usage.input_tokens || 0
            outTok = json.usage.output_tokens || 0
            cacheRead = json.usage.cache_read_input_tokens || 0
            cacheCreation = json.usage.cache_creation_input_tokens || 0
          }
        }
      } else {
        // OpenAI format
        if (responseText.includes('data: ')) {
          const lines = responseText.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.usage) {
                  inTok = data.usage.prompt_tokens || 0
                  outTok = data.usage.completion_tokens || 0
                  cacheRead = data.usage.prompt_tokens_details?.cached_tokens || 0
                }
              } catch {}
            }
          }
        } else {
          const json = JSON.parse(responseText)
          if (json.usage) {
            inTok = json.usage.prompt_tokens || 0
            outTok = json.usage.completion_tokens || 0
            cacheRead = json.usage.prompt_tokens_details?.cached_tokens || 0
          }
        }
      }

      if (inTok > 0 || outTok > 0) {
        const db = getDb()
        const projectPath = `proxy://${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}`

        // Insert or get project
        const selProj = db.prepare('SELECT id FROM projects WHERE path = ?')
        let projId = (selProj.get(projectPath) as any)?.id
        if (!projId) {
          projId = crypto.randomUUID()
          db.prepare('INSERT INTO projects (id, path, name, tool_source, created_at) VALUES (?, ?, ?, ?, ?)').run(
            projId,
            projectPath,
            projectName,
            'proxy',
            Date.now()
          )
        }

        // Insert or get session
        const sessionId = `proxy-session-${new Date().toISOString().slice(0, 10)}`
        const selSess = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
        let sessId = (selSess.get(sessionId) as any)?.id
        if (!sessId) {
          sessId = crypto.randomUUID()
          db.prepare('INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            sessId,
            projId,
            'proxy',
            modelName,
            Date.now(),
            sessionId,
            'live_captured'
          )
        }

        const cost = calculateTurnCost(modelName, inTok, outTok, cacheRead, cacheCreation)
        const turnId = crypto.randomUUID()
        db.prepare('INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
          turnId,
          sessId,
          inTok,
          outTok,
          cacheRead,
          cacheCreation,
          cost,
          Date.now(),
          'live_captured'
        )

        this.interceptedTurnsCount++
        console.log(`[Proxy] Captured turn: ${inTok} in, ${outTok} out, ${cacheRead} cache read, $${cost.toFixed(4)}`)
      }
    } catch (err) {
      console.warn('[Proxy] Failed to record usage:', err)
    }
  }
}

export const proxyServer = new LocalLoopbackProxy()

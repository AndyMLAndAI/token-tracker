# Token Usage & Cost Tracking: Master Research & Architectural Engineering Report
**Project:** Token Tracker Desktop Application (Tauri / Rust / TypeScript)  
**Date:** September 2026  
**Status:** Comprehensive Specification & Synthesis  
**Target Systems:** Windows 10/11, macOS (Apple Silicon & Intel), Linux (x86_64)

---

## Executive Summary & Core Architectural Insight

Building an accurate, real-time, per-project, and per-chat token tracking desktop application requires a deep understanding of where AI consumption data originates, how fast it becomes available, and what authorization boundaries exist.

During our multi-agent investigation across **Local Agentic Tools**, **Cloud Provider APIs**, and **Local Interception Models**, we established a foundational architectural insight:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               The Tripartite Data Dilemma                              │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ 1. Local Tool Artifacts       │ 2. Cloud Provider APIs        │ 3. Local Loopback Proxy│
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • Zero auth required          │ • Requires Admin API keys     │ • Standard inference   │
│ • Zero network overhead       │ • 1 to 24+ hour batch delay   │   API keys             │
│ • Varies: Some provide exact  │ • No chat/session attribution │ • 0ms real-time capture│
│   tokens (Claude Code, Cline) │ • Metadata (`user_id`) does   │ • 100% exact usage for │
│   while others store text only│   NOT propagate to billing    │   all models & streams │
│   (Cursor, Copilot Chat)      │ • AI Studio has NO usage API  │ • Intercepts any tool  │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### The Three Ingestion Pillars

1. **Local Disk Ingestion (Zero Friction, Instant, High Fidelity for Select Tools):**  
   Tools like **Claude Code**, **Cline**, and **Roo Code** write complete, unmetered, turn-by-turn API usage objects (including cache creation and cache reads) directly to local JSONL and JSON files. For these tools, local disk parsing is the gold standard: it requires no configuration, incurs 0ms latency, and works completely offline. However, tools like **Cursor**, **Windsurf**, and **GitHub Copilot Chat** store conversational text and diffs locally but process billing tokens on remote proprietary servers.

2. **Cloud Provider APIs (Fundamentally Unsuited for Real-Time Per-Project Tracking):**  
   Neither Anthropic, OpenAI, nor Google provide APIs capable of powering a real-time developer desktop tracker:
   - **Administrative Key Gating:** Anthropic and OpenAI require organization root Admin API keys (`sk-ant-admin...`, `sk-admin-...`). Regular developers using standard project/inference keys cannot call them.
   - **Severe Latency:** Anthropic lags by ~1 hour; OpenAI lags by 1 to 24 hours; Google Vertex AI BigQuery sync lags by 4 to 12+ hours; Google AI Studio has **no public usage API whatsoever**.
   - **Lack of Session Attribution:** Request-level metadata (`user_id`, `user`) is strictly utilized by providers for trust and safety abuse monitoring—it **never** surfaces in usage reports or billing exports.

3. **Local Loopback Proxy Interception (The Universal Real-Time Engine):**  
   By embedding a lightweight HTTP/HTTPS loopback proxy inside the Tauri app (`http://localhost:PORT/v1`), Token Tracker can intercept outbound inference calls from any tool configured with a custom `baseURL`. Standard inference responses from Anthropic, OpenAI, and Google Gemini synchronously return 100% complete token breakdowns (`usage` and `usageMetadata`), including cache writes, cache reads, and reasoning/thinking tokens.

### Master Strategy
Token Tracker must employ a **hybrid, dual-track architecture**:
- **Track 1 (Passive Local File Ingestion):** Automatically monitor, parse, and attribute logs from tools with high-fidelity local records (Claude Code, Cline, Roo Code, Aider, Antigravity) with zero configuration required from the user.
- **Track 2 (Active Local Proxy Interceptor):** Provide an optional local proxy endpoint that captures live streaming tokens and reasoning metrics for tools that lack local token metrics (Cursor, Windsurf, Continue, custom scripts) or for users wanting unified real-time telemetry.
- **Track 3 (Synthetic Tokenizer Fallback):** For users who do not run the proxy, parse conversation transcripts from Cursor, Windsurf, Copilot, and Continue from SQLite/Protobuf and run offline token estimation using `tiktoken-rs`.

---

## Section 1: Local Agentic Coding Tools (Source-by-Source)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Local Tools Landscape Matrix                                         │
├───────────────────┬───────────────────┬────────────────────┬────────────────────┬──────────────────────┤
│ Tool              │ Storage Engine    │ Project Scope      │ Token Metrics      │ File Concurrency     │
├───────────────────┼───────────────────┼────────────────────┼────────────────────┼──────────────────────┤
│ Claude Code       │ JSON, JSONL       │ Explicit directory │ Exact (Full Cache) │ Append-only, no locks│
│ Google Antigravity│ SQLite + Protobuf │ Explicit URI       │ Exact in Protobuf  │ WAL mode (`mode=ro`) │
│ Cursor            │ SQLite (vscdb)    │ Workspace hash     │ Text only (0 count)│ WAL mode (`mode=ro`) │
│ Windsurf          │ Protobuf + SQLite │ Workspace hash     │ Credit quota only  │ Protobuf / WAL       │
│ Cline / Roo Code  │ JSON files        │ Explicit CWD       │ Exact (Full Cache) │ Standard file writes │
│ Aider             │ Markdown + JSONL  │ Git Root / CWD     │ Exact in logs/CLI  │ Plain append         │
│ Continue.dev      │ JSON files        │ Explicit CWD       │ Text only (Output) │ Single-file overwrite│
│ Copilot Chat      │ SQLite (vscdb)    │ Repo / CWD         │ Text only (Backend)│ WAL mode (`mode=ro`) │
└───────────────────┴───────────────────┴────────────────────┴────────────────────┴──────────────────────┘
```

---

### 1.1 Claude Code (CLI)

Claude Code is Anthropic's agentic CLI tool. It features the most developer-friendly, granular, and easily parseable local storage architecture of any agentic tool tested.

#### Disk Locations Across Platforms
- **Windows:**
  - Global Configuration: `%USERPROFILE%\.claude.json`
  - Global State & Projects: `%USERPROFILE%\.claude\`
  - Local App Cache: `%LOCALAPPDATA%\Claude\` and `%LOCALAPPDATA%\claude-cli-nodejs\`
- **macOS:**
  - Global Configuration: `~/.claude.json`
  - Global State & Projects: `~/.claude/`
- **Linux:**
  - Global Configuration: `~/.claude.json`
  - Global State & Projects: `~/.claude/`

#### Directory Layout & Workspace Separation
Claude Code separates projects using sanitized directory paths under `~/.claude/projects/` where path separators (`/`, `\`) and colons (`:`) are converted to hyphens (`-` or `--`):
```text
~/.claude/
├── settings.json               # Global CLI settings, permissions, default model
├── settings.local.json         # Local device overrides
├── history.jsonl               # Global command history across all sessions
├── stats-cache.json            # Pre-computed daily rollups and model metrics
├── projects/
│   ├── E--Code-ProjectAlpha/   # Sanitized project path (e.g. E:\Code\ProjectAlpha)
│   │   ├── <session-uuid>.jsonl
│   │   ├── <session-uuid>/
│   │   │   └── subagents/
│   │   │       ├── agent-<agent-id>.jsonl
│   │   │       └── agent-<agent-id>.meta.json
│   │   └── memory/             # Project-specific persistent memories
│   └── C--Users-Dev-Repos-Backend/
└── sessions/                   # Pointers to active sessions
```
In `~/.claude.json`, a top-level `"projects"` map records explicit allowed tools, MCP servers, and directories keyed directly by absolute project path (e.g., `"E:/Code/ProjectAlpha"`).

#### Granularity
- **Project Granularity:** Native and explicit. Sanitized directory names map 1:1 to filesystem paths. Each JSONL line contains an explicit `"cwd"` key (e.g., `"cwd": "E:\\Code\\ProjectAlpha"`).
- **Chat/Session Granularity:** Native. Each conversation produces a distinct `<session-uuid>.jsonl` file. Subagents spawned during task execution are organized in subdirectories (`subagents/agent-<agent-id>.jsonl`).

#### Update Frequency & Concurrency
- **Frequency:** Real-time append. Every turn and tool call is flushed immediately to the active `<session-uuid>.jsonl`.
- **Locking:** Pure file append. No exclusive OS file locks are acquired. Tauri can tail active JSONL files with zero read-lock errors.

#### Auth Requirements
- Zero authentication needed. Files reside in user-space plaintext.

#### Token & Cost Availability
Claude Code logs **100% exact metrics** at two levels:

1. **Per-Turn Metrics (inside `<session-uuid>.jsonl`):**
   ```json
   {
     "parentUuid": "b4e2...",
     "type": "assistant",
     "sessionId": "446021f3-03f3-4d27-980e-c07d4c6ce267",
     "cwd": "E:\\Code\\ProjectAlpha",
     "timestamp": "2026-09-05T07:37:38.704Z",
     "message": {
       "role": "assistant",
       "model": "claude-3-7-sonnet-20250219",
       "usage": {
         "input_tokens": 28622,
         "cache_creation_input_tokens": 1250,
         "cache_read_input_tokens": 24800,
         "output_tokens": 936,
         "server_tool_use": {
           "web_search_requests": 0,
           "web_fetch_requests": 0
         },
         "service_tier": "standard",
         "speed": "standard"
       }
     }
   }
   ```
2. **Aggregated Reconciler (`~/.claude/stats-cache.json`):**
   - `dailyModelTokens`: Array of `{ date: "YYYY-MM-DD", tokensByModel: { "<model>": <count> } }`
   - `modelUsage`: `{ "<model>": { inputTokens, outputTokens, cacheReadInputTokens, cacheCreationInputTokens, webSearchRequests, costUSD, contextWindow, maxOutputTokens } }`
   - `dailyActivity`: `{ date, messageCount, sessionCount, toolCallCount }`

---

### 1.2 Google Antigravity

Google Antigravity is Google's advanced agentic coding environment. It uses a dual-engine architecture combining SQLite and Protocol Buffers.

#### Disk Locations Across Platforms
- **Windows:** `%USERPROFILE%\.gemini\antigravity\`
- **macOS:** `~/.gemini/antigravity/`
- **Linux:** `~/.gemini/antigravity/`

#### Directory Layout
```text
~/.gemini/antigravity/
├── antigravity_state.pbtxt     # Protobuf text: onboarding, active agent model
├── agyhub_summaries_proto.pb   # Binary Protobuf: index of workspaces, branches, summaries
├── brain/                      # Subagent trajectories, plans, logs
│   └── <conversation-id>/
│       ├── implementation_plan.md
│       ├── walkthrough.md
│       └── .system_generated/
│           └── logs/
│               ├── transcript.jsonl        # Compact step log
│               └── transcript_full.jsonl   # Full untruncated step log
└── conversations/              # Primary conversation databases
    ├── <conversation-id>.db    # SQLite session database
    ├── <conversation-id>.db-wal# Write-Ahead Log
    └── <conversation-id>.db-shm
```

#### Granularity
- **Project Granularity:** Native and explicit. Stored in `agyhub_summaries_proto.pb` and inside `<conversation-id>.db` (`trajectory_metadata_blob` contains `workspaceUri: "file:///e:/AI/Token_Tracker"` and git branch).
- **Chat/Session Granularity:** Native. Every session has a unique `<conversation-id>` UUID.

#### Update Frequency & Concurrency
- **Frequency:** Real-time. Transcripts and database records are updated after every action/tool call.
- **Locking:** SQLite WAL mode. Antigravity maintains an open write connection. External readers **must** open with `mode=ro` (read-only) and avoid triggering schema modifications.

#### Auth Requirements
- None for local disk inspection.

#### Token & Cost Availability
Antigravity bifurcates logging:
1. **`transcript.jsonl` (Plaintext):** Logs step index, source (`USER_EXPLICIT`, `MODEL`, `SYSTEM`), step type (`USER_INPUT`, `PLANNER_RESPONSE`), `content`, `thinking`, and `tool_calls`. Raw token counts are omitted from the plaintext transcript.
2. **`conversations/<conversation-id>.db` (SQLite + Protobuf):**
   - Table `gen_metadata`: Contains serialized binary Protobuf messages.
   - Field 1 & 2 varints contain exact: `input_tokens`, `output_tokens`, and `cached_tokens`.
   - Field 19 contains the model name string (e.g. `gemini-3.8-flash`, `claude-3-7-sonnet`).
   - Field 20 contains `request_id`, `trajectory_id`, and `model_enum`.

---

### 1.3 Cursor IDE (Anysphere)

Cursor is a dedicated VS Code fork with deep AI integration (Composer, inline edits, and chat).

#### Disk Locations Across Platforms
- **Windows:**
  - Global State: `%APPDATA%\Cursor\User\globalStorage\state.vscdb`
  - Workspace Storage: `%APPDATA%\Cursor\User\workspaceStorage\<workspace-hash>\state.vscdb`
  - AI Code Tracking: `%USERPROFILE%\.cursor\ai-tracking\ai-code-tracking.db`
- **macOS:**
  - Global State: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`
  - Workspace Storage: `~/Library/Application Support/Cursor/User/workspaceStorage/<workspace-hash>/state.vscdb`
  - AI Code Tracking: `~/.cursor/ai-tracking/ai-code-tracking.db`
- **Linux:**
  - Global State: `~/.config/Cursor/User/globalStorage/state.vscdb`
  - Workspace Storage: `~/.config/Cursor/User/workspaceStorage/<workspace-hash>/state.vscdb`
  - AI Code Tracking: `~/.cursor/ai-tracking/ai-code-tracking.db`

#### Schema & Data Layout
In recent Cursor builds, conversations are stored in `%APPDATA%\Cursor\User\globalStorage\state.vscdb` across three core tables:
1. **`composerHeaders`**:
   - Schema: `composerId TEXT PRIMARY KEY, workspaceId TEXT, createdAt INTEGER, lastUpdatedAt INTEGER, isArchived INTEGER, isSubagent INTEGER, recency INTEGER, checkpointAt INTEGER, subagentTypeName TEXT, value TEXT`
   - Maps each Composer session to its associated `workspaceId` (the workspace hash).
2. **`cursorDiskKV`**:
   - Key: `bubbleId:<composerId>:<messageId>`
   - Value: JSON blob representing user prompt or model response.
   - Contains: `richText`, `text`, `modelInfo` (`{"modelName": "claude-3.5-sonnet"}`), tool execution data, file context selections.
   - Key: `agentKv:blob:<hash>` stores subagent trajectory blobs.
3. **`ai-code-tracking.db`**:
   - `ai_code_hashes`: Records code chunks, `requestId`, `conversationId`, `model`, `timestamp`.
   - `scored_commits`: Records AI vs human lines added and deleted.
   - `conversation_summaries`: High-level session metadata.

#### Granularity
- **Project Granularity:** Inferred via `workspaceId` mapped through `workspaceStorage/<hash>/workspace.json`, or via explicit `workspaceUris` in `bubbleId` JSON.
- **Chat/Session Granularity:** Native per `composerId` and `bubbleId`.

#### Update Frequency & Concurrency
- **Frequency:** Updates on turn completion and during active typing.
- **Locking:** SQLite WAL mode (`state.vscdb-wal`). Heavy concurrent writes. Must use `mode=ro` with busy timeout.

#### Auth Requirements
- None for local disk reading.

#### Token & Cost Availability
- **Critical Finding:** Cursor does **not** persist billed token counts locally. The `tokenCount` object inside message bubbles is initialized to `{"inputTokens": 0, "outputTokens": 0}`.
- All billing telemetry is processed on Anysphere's cloud backend.
- **Fallback Solution:** Token Tracker must extract `text`, `richText`, and file context from `cursorDiskKV` bubbles and pass them to a local tokenizer (`tiktoken-rs`) parameterized by `modelInfo.modelName`. Alternatively, users can route Cursor through Token Tracker's local proxy.

---

### 1.4 Windsurf (Codeium)

Windsurf is Codeium's agentic IDE featuring the "Cascade" AI flow.

#### Disk Locations Across Platforms
- **Windows:**
  - Cascade Sessions: `%USERPROFILE%\.codeium\windsurf\cascade\`
  - MCP & Settings: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`
  - Global State: `%APPDATA%\Windsurf\User\globalStorage\state.vscdb`
  - Workspace Storage: `%APPDATA%\Windsurf\User\workspaceStorage\<workspace-hash>\state.vscdb`
- **macOS:**
  - Cascade Sessions: `~/.codeium/windsurf/cascade/`
  - Global State: `~/Library/Application Support/Windsurf/User/globalStorage/state.vscdb`
- **Linux:**
  - Cascade Sessions: `~/.codeium/windsurf/cascade/`
  - Global State: `~/.config/Windsurf/User/globalStorage/state.vscdb`

#### Data Format & Storage
- Cascade conversations are serialized as binary Protocol Buffer files (`.pb`) inside `~/.codeium/windsurf/cascade/` along with JSON configuration.
- Global settings and window states are held in `state.vscdb`.

#### Granularity
- **Project Granularity:** Stored inside workspace storage and cascade session metadata.
- **Chat/Session Granularity:** Native per Cascade session file.

#### Update Frequency & Concurrency
- Binary files are written at each checkpoint. Standard file watching (`notify`) can detect updates.

#### Auth Requirements
- None for local disk.

#### Token & Cost Availability
- Windsurf uses a proprietary **Credit / Quota allocation model**. Token consumption is managed server-side by Codeium.
- The local IDE fetches quota balances via RPC (`GetPlanStatus`) to render the UI badge.
- Raw per-message token counts are not logged locally.
- **Fallback Solution:** Parse the Cascade protobuf conversation transcripts to extract prompt/response text for local token estimation, or use the local proxy interceptor.

---

### 1.5 Cline & Roo Code (VS Code Extensions)

Cline (formerly Claude Dev) and its fork Roo Code are autonomous coding extensions for VS Code. They provide **the highest fidelity, cleanest local token logs** of any IDE extensions.

#### Disk Locations Across Platforms
- **Cline:**
  - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/`
  - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/`
  - Standalone CLI: `~/.cline/data/`
- **Roo Code:**
  - Windows: `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/`
  - Linux: `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/`

#### Directory & Data Architecture
```text
globalStorage/<extension-id>/
├── state/
│   └── taskHistory.json            # Array of all historical tasks with full token metrics
└── tasks/
    └── <task-id>/
        ├── api_conversation_history.json  # Raw API request/response turns
        ├── ui_messages.json               # Real-time UI events and token stats
        └── task_metadata.json             # Environment and model information
```

#### Granularity
- **Project Granularity:** Native. `taskHistory.json` explicitly records `cwdOnTaskInitialization` for every single task.
- **Chat/Session Granularity:** Native. Every task has a discrete UUID/ULID directory.

#### Update Frequency & Concurrency
- Real-time file writes. `ui_messages.json` is updated turn-by-turn. `taskHistory.json` is updated upon task completion or checkpoint.
- Standard JSON files; no SQLite lock contention.

#### Auth Requirements
- None for local disk reading.

#### Token & Cost Availability
- **Complete, verified local breakdown:**
  In `state/taskHistory.json`:
  ```json
  {
    "id": "1786625698772",
    "ulid": "01KZXK1AZ614HPKCA7Z9565S5K",
    "ts": 1786625769143,
    "task": "Build authentication module...",
    "tokensIn": 13574,
    "tokensOut": 647,
    "cacheWrites": 0,
    "cacheReads": 26624,
    "totalCost": 0.0412,
    "size": 29512,
    "cwdOnTaskInitialization": "E:\\Code\\ProjectAlpha",
    "modelId": "claude-3-7-sonnet-20250219"
  }
  ```
  In `tasks/<task-id>/ui_messages.json`:
  ```json
  {
    "ts": 1786625729994,
    "type": "say",
    "say": "api_req_started",
    "text": "{\"tokensIn\":12856,\"tokensOut\":127,\"cacheWrites\":0,\"cacheReads\":256,\"cost\":0.012}",
    "modelInfo": {
      "providerId": "anthropic",
      "modelId": "claude-3-7-sonnet-20250219",
      "mode": "act"
    }
  }
  ```
  *(Note: Standalone Cline CLI also maintains `~/.cline/data/db/sessions.db` with table `schedule_executions(tokens_used, cost_usd)`).*

---

### 1.6 Aider (Terminal AI Pair Programmer)

Aider is a popular open-source command-line AI pair programming tool.

#### Disk Locations Across Platforms
- Stored directly inside the project root repository (CWD):
  - `.aider.chat.history.md`: Full markdown conversation transcript.
  - `.aider.input.history`: Raw user prompt input lines.
  - `.aider.model.metadata.json`: Optional local model configuration.
  - Analytics Log (if enabled): Configured via `--analytics-log <path>` or `AIDER_ANALYTICS_LOG` environment variable.

#### Granularity
- **Project Granularity:** Native (per git repository root).
- **Chat/Session Granularity:** Appended sequentially to `.aider.chat.history.md`.

#### Update Frequency & Concurrency
- Real-time text append. Standard file tailing works seamlessly.

#### Auth Requirements
- None.

#### Token & Cost Availability
- Aider calculates exact tokens and turn costs in memory using internal pricing tables and displays them in the terminal:  
  `"Tokens: 4.2k sent, 310 received. Cost: $0.015 message, $0.12 session."`
- If `--analytics-log` is enabled, it appends structured JSONL records with exact `tokens_sent`, `tokens_received`, and model parameters.
- If `--analytics-log` is not enabled, Token Tracker can parse `.aider.chat.history.md` and tokenize using `tiktoken-rs`.

---

### 1.7 Continue.dev (VS Code & JetBrains Extension)

Continue is a widely adopted open-source AI code assistant.

#### Disk Locations Across Platforms
- **Windows:** `%USERPROFILE%\.continue\sessions\` and `%USERPROFILE%\.continue\config.yaml`
- **macOS:** `~/.continue/sessions/` and `~/.continue/config.yaml`
- **Linux:** `~/.continue/sessions/` and `~/.continue/config.yaml`

#### Data Format
- Each conversation is stored as an individual JSON file: `~/.continue/sessions/<session-id>.json`.
  ```json
  {
    "sessionId": "b4e872d1-...",
    "title": "Fix memory leak in WebSocket",
    "workspaceDirectory": "E:\\Code\\ProjectAlpha",
    "history": [
      {
        "message": { "role": "user", "content": "..." },
        "promptLogs": [...]
      },
      {
        "message": { "role": "assistant", "content": "..." }
      }
    ]
  }
  ```

#### Granularity
- **Project Granularity:** Explicit via `"workspaceDirectory"` in each session JSON.
- **Chat/Session Granularity:** Explicit per file UUID.

#### Update Frequency & Concurrency
- Flushed on turn completion. No file locks.

#### Auth Requirements
- None.

#### Token & Cost Availability
- Continue does not store standardized token metrics inside session JSON files (detailed token usage is emitted to the IDE Output channel during streaming).
- **Fallback Solution:** Token Tracker can read the `history` message array from `<session-id>.json`, extract model names from `config.yaml`, and compute token counts via `tiktoken-rs`.

---

### 1.8 GitHub Copilot Chat (VS Code Extension)

GitHub Copilot Chat is GitHub's official coding assistant extension for VS Code.

#### Disk Locations Across Platforms
- **Windows:** `%APPDATA%\Code\User\globalStorage\github.copilot-chat\session-store.db`
- **macOS:** `~/Library/Application Support/Code/User/globalStorage/github.copilot-chat/session-store.db`
- **Linux:** `~/.config/Code/User/globalStorage/github.copilot-chat/session-store.db`

#### Schema & Format
`session-store.db` is an active SQLite database in WAL mode:
- **`sessions`**: `id`, `cwd`, `repository`, `host_type`, `branch`, `summary`, `agent_name`, `created_at`.
- **`turns`**: `turn_index`, `user_message`, `assistant_response`, `timestamp`.
- **`checkpoints`**: `title`, `overview`, `work_done`, `technical_details`.
- **`search_index`**: FTS5 virtual table for searching chat history.

#### Granularity
- **Project Granularity:** Native. Stored explicitly in columns `cwd`, `repository`, and `branch`.
- **Chat/Session Granularity:** Native per session row.

#### Update Frequency & Concurrency
- Written after every interaction. Operates in WAL mode (`session-store.db-wal`). External readers must use `mode=ro`.

#### Auth Requirements
- None for local database reading.

#### Token & Cost Availability
- GitHub Copilot Chat does **not** store token metrics or billing costs locally. All telemetry is transmitted directly to GitHub's subscription servers.
- **Fallback Solution:** Query `turns` from `session-store.db` and calculate tokens for `user_message` and `assistant_response` using `tiktoken-rs` (assuming GPT-4o / Claude 3.5 Sonnet BPE).

---

## Section 2: Provider APIs (Provider-by-Provider Analysis)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Provider API Comparison Matrix                                       │
├──────────────────────────┬───────────────────────┬────────────────────────┬────────────────────────────┤
│ Capability               │ Anthropic API         │ OpenAI API             │ Google Gemini / Vertex AI  │
├──────────────────────────┼───────────────────────┼────────────────────────┼────────────────────────────┤
│ Admin Usage Endpoint     │ `/v1/organizations/   │ `/v1/organization/     │ AI Studio: NONE            │
│                          │  usage_report/messages│  usage/completions`    │ Vertex: BigQuery Export    │
│ Required Auth Key        │ Admin Key             │ Admin Key              │ Vertex: GCP Service Account│
│                          │ (`sk-ant-admin...`)   │ (`sk-admin-...`)       │ AI Studio: Manual web UI   │
│ Plan Gate                │ Team/Enterprise only  │ Org Admin role         │ GCP Cloud Project          │
│ Batch Delay Latency      │ ~1 Hour               │ 1 to 24+ Hours         │ 4 to 12+ Hours (BigQuery)  │
│ Per-Chat Granularity     │ ❌ Impossible         │ ❌ Impossible          │ ❌ Impossible              │
│ Request Metadata Billing │ ❌ `user_id` ignored  │ ❌ `user` param ignored│ ⚠️ `labels` in BigQuery    │
│ Standard Response Usage  │ `usage` object        │ `usage` object         │ `usageMetadata` object     │
│ Streaming Usage Capture  │ SSE default (0ms)     │ SSE via `stream_options│ SSE in final chunk (0ms)   │
└──────────────────────────┴───────────────────────┴────────────────────────┴────────────────────────────┘
```

---

### 2.1 Anthropic API

#### Admin Usage & Cost Endpoints
- **Admin Usage API:** `GET https://api.anthropic.com/v1/organizations/usage_report/messages`
- **Admin Cost API:** `GET https://api.anthropic.com/v1/organizations/cost_report`
- **Rate Limits:** `GET https://api.anthropic.com/v1/organizations/rate_limits`

#### Granularity & Aggregation
- Supports `group_by[]`: `api_key_id`, `workspace_id`, `model`, `service_tier`, `context_window`, and `speed` (with beta header `anthropic-beta: fast-mode-2026-02-01`).
- `bucket_width`: Configurable to `1m`, `1h`, or `1d`.
- **Missing Dimensions:** No grouping by custom project names, chat session IDs, or arbitrary tags.

#### Request-Level Metadata Limitations
- Anthropic permits passing `metadata: { "user_id": "..." }` in `POST /v1/messages`.
- **Critical Limitation:** Anthropic strictly uses `metadata.user_id` for **abuse detection and rate limiting**.
- **Does NOT Propagate:** `metadata.user_id` is completely omitted from usage reports and billing exports.
- **PII Guardrail:** Submitting an email address or personal identifier in `user_id` immediately fails with `400 Bad Request`.

#### Standard Inference Response Usage
Standard non-streaming inference calls synchronously return token usage:
```json
"usage": {
  "input_tokens": 1520,
  "output_tokens": 340,
  "cache_creation_input_tokens": 1024,
  "cache_read_input_tokens": 496
}
```
- **Streaming Behavior:** When `stream: true`, Anthropic delivers usage over Server-Sent Events (SSE) **by default**:
  - Event `message_start`: delivers `message.usage` (`input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`).
  - Event `message_delta`: delivers final cumulative `usage.output_tokens`.

#### Auth, Permissions & Latency
- Requires an **Admin API Key** (`sk-ant-admin...`).
- **Plan Gate:** Admin API keys can only be generated on **Team or Enterprise accounts**. Individual developers (Free, Pro, API Build) have no access.
- **Latency:** Reporting pipeline lags by **~1 hour**.

---

### 2.2 OpenAI API

#### Organization Usage & Cost Endpoints
- **Completions Usage API:** `GET https://api.openai.com/v1/organization/usage/completions`
- **Costs API:** `GET https://api.openai.com/v1/organization/costs`
- Additional endpoints exist for `/usage/embeddings`, `/usage/images`, etc.

#### Granularity & Aggregation
- `group_by`: Supports `project_id`, `api_key_id`, `model`, `line_item`, `user_id`.
- Filters: `project_ids[]`, `api_key_ids[]`, `user_ids[]`.
- `bucket_width`: Fixed to `1d` (daily aggregation).

#### Request-Level Tagging Limitations
- While OpenAI supports `group_by=user_id`, this refers strictly to the **OpenAI Organization Member / Service Account ID** within the OpenAI console.
- The `"user"` parameter passed in `POST /v1/chat/completions` is solely used for end-user abuse tracking. It **never** surfaces in Organization Usage or Cost reports.

#### Standard Inference Response Usage
Standard inference responses contain:
```json
"usage": {
  "prompt_tokens": 1250,
  "completion_tokens": 420,
  "total_tokens": 1670,
  "prompt_tokens_details": {
    "cached_tokens": 512,
    "audio_tokens": 0
  },
  "completion_tokens_details": {
    "reasoning_tokens": 128,
    "audio_tokens": 0
  }
}
```
- **Streaming Trap:** When streaming (`stream: true`), OpenAI **omits usage by default**.
- **Requirement:** The client request body must include:
  ```json
  "stream_options": { "include_usage": true }
  ```
  When present, OpenAI emits a penultimate SSE chunk before `data: [DONE]` containing the complete `usage` object.

#### Auth, Permissions & Latency
- Requires an **Admin API Key** (`sk-admin-...`) with `Management API` and `Usage API` scopes. Project keys (`sk-proj-...`) receive `403 Forbidden`.
- **Latency:** Organization reporting pipelines lag by **several hours up to 24 hours**.

---

### 2.3 Google Gemini & Vertex AI API

#### Google AI Studio (`generativelanguage.googleapis.com`)
- **Usage Endpoints:** **NONE.** Google AI Studio has no public REST endpoint for fetching historical consumption or cost.
- **Visibility:** Usage is exclusively visible inside the manual web dashboard (**Dashboard > Usage**) or Google Cloud Console traffic metrics.
- **Request Tagging:** No support for custom billing tags.

#### Vertex AI (Google Cloud Platform)
- **Usage Tracking:** Tracked via Google Cloud Monitoring metrics (`aiplatform.googleapis.com/...`) or **Cloud Billing Export to BigQuery**.
- **Request Labels:** `generateContent` accepts a `labels` map (up to 64 key-value pairs):
  ```json
  {
    "contents": [...],
    "labels": {
      "project_name": "project_alpha",
      "session_id": "chat_8923"
    }
  }
  ```
- **Limitations:** Requires setting up a GCP project, BigQuery export, service account IAM credentials, and managing a **4 to 12+ hour batch sync delay**.

#### Response `usageMetadata` Object
Both Google AI Studio and Vertex AI return detailed token usage synchronously in inference calls:
```json
"usageMetadata": {
  "promptTokenCount": 840,
  "candidatesTokenCount": 210,
  "totalTokenCount": 1050,
  "cachedContentTokenCount": 256,
  "thoughtsTokenCount": 64
}
```
- **Thoughts Tokens:** Explicitly measures reasoning token overhead for Gemini 2.0 Flash Thinking and Gemini 2.5 thinking models.
- **Streaming:** Delivered inside the final SSE chunk of `streamGenerateContent`.

---

### 2.4 The Local Proxy / Response Interceptor Alternative

Because cloud usage APIs are gated behind admin keys, delayed by hours, and blind to chat sessions, a **local loopback proxy** embedded inside the desktop app provides the ultimate interception engine.

```
┌──────────────┐             ┌───────────────────────────┐             ┌────────────────────┐
│ Developer IDE│             │ Tauri Local Proxy Server  │             │ Upstream Provider  │
│ (Cursor/Roo) │             │ (http://localhost:3000/v1)│             │ (Anthropic/OpenAI) │
└──────┬───────┘             └─────────────┬─────────────┘             └─────────┬──────────┘
       │                                   │                                     │
       │ 1. POST /v1/chat/completions      │                                     │
       │    (Custom base_url)              │                                     │
       ├──────────────────────────────────►│ 2. Transparent Body Inspection      │
       │                                   │    - Tag project/chat metadata      │
       │                                   │    - Inject stream_options if OpenAI│
       │                                   ├────────────────────────────────────►│
       │                                   │                                     │
       │                                   │ 3. Forward Upstream SSE Stream      │
       │ 4. Pipe SSE Stream to IDE (0ms)   │◄────────────────────────────────────┤
       │◄──────────────────────────────────┤                                     │
       │                                   │ 5. Parse Usage Chunk Off-Thread:    │
       │                                   │    - input, output, cache, reasoning│
       │                                   │    - calculate cost via pricing.json│
       │                                   │    - write to local SQLite DB       │
       │                                   │    - emit Tauri event to UI         │
```

#### How the Local Proxy Solves Every Limitation
1. **Zero High-Privilege Keys:** The user provides their standard inference keys (`sk-ant-api...`, `sk-proj...`, `AIza...`).
2. **0ms Latency:** Tokens are captured the millisecond the stream finishes.
3. **100% Attribution:** Projects and chats are explicitly tagged via virtual proxy base paths (e.g. `http://localhost:3000/projects/web-app/v1`) or custom HTTP headers (`X-Project-Name`, `X-Session-ID`).
4. **Auto-Injection of `stream_options`:** The proxy automatically injects `"stream_options": {"include_usage": true}` into OpenAI-compatible streaming requests, ensuring token metrics are returned even if the IDE omitted the parameter.

---

## Section 3: Ingestion & Parsing Deep Dive for Tauri / TypeScript

Building a robust ingestion pipeline inside a Tauri desktop app requires handling OS file locks, WAL concurrency, incremental stream parsing, and workspace hash decoding.

---

### 3.1 SQLite WAL Concurrency (`rusqlite`, `mode=ro`, Windows Locking)

VS Code, Cursor, Windsurf, Copilot Chat, and Antigravity all store state in SQLite databases running in **Write-Ahead Logging (WAL)** mode.

#### The `immutable=1` Trap
- Developers often try opening SQLite databases with `?immutable=1` to bypass locks.
- **CRITICAL FAILURE:** When `immutable=1` is set, SQLite assumes the database never changes and **completely ignores `state.vscdb-wal`**. Any active chat session, composer turn, or token update currently in the WAL file will be completely invisible.

#### The Windows File Lock Challenge
On Windows, when an IDE runs a checkpoint (`PRAGMA wal_checkpoint`), direct read connections can throw `SQLITE_BUSY` (code 5) or `SQLITE_CANTOPEN` (code 14).

#### Production Rust / `rusqlite` Read Pattern
```rust
use rusqlite::{Connection, OpenFlags};
use std::path::Path;

pub fn open_state_db_readonly(path: &Path) -> Result<Connection, rusqlite::Error> {
    // 1. Format URI with mode=ro to ensure WAL index files are inspected
    let uri = format!("file:{}?mode=ro", path.to_str().unwrap().replace('\\', "/"));
    
    // 2. Open with read-only, URI parsing, and no internal thread mutex
    let flags = OpenFlags::SQLITE_OPEN_READ_ONLY 
              | OpenFlags::SQLITE_OPEN_URI 
              | OpenFlags::SQLITE_OPEN_NO_MUTEX;

    let conn = Connection::open_with_flags(&uri, flags)?;
    
    // 3. Busy timeout allows active WAL write transactions to clear
    conn.pragma_update(None, "busy_timeout", 5000)?;
    
    // 4. Prevent accidental schema modifications
    conn.pragma_update(None, "query_only", true)?;
    
    Ok(conn)
}
```

#### Snapshot-on-Conflict Fallback
If Windows file locking prevents opening `state.vscdb` even with a busy timeout:
1. Open the file with Windows API sharing flags: `FILE_SHARE_READ | FILE_SHARE_WRITE`.
2. Copy `state.vscdb`, `state.vscdb-wal`, and `state.vscdb-shm` into `%LOCALAPPDATA%/Temp/TokenTracker/stage/`.
3. Open and query the staged replica, then release.

---

### 3.2 JSONL Incremental Streaming Parser (Byte Offsets & Deduplication)

App-level logs (Claude Code, Antigravity) grow continuously. Re-reading a 50MB JSONL file from byte 0 on every file change event is unacceptable for CPU and battery performance.

#### The Byte-Offset Cursor Pattern
Token Tracker maintains an offset cursor `(file_path, byte_offset)` in local SQLite. When a file modification event occurs, the reader seeks directly to `byte_offset`:

```rust
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::Path;

pub struct IncrementalJsonlReader {
    pub last_offset: u64,
}

impl IncrementalJsonlReader {
    pub fn new(last_offset: u64) -> Self {
        Self { last_offset }
    }

    pub fn read_new_lines<F>(&mut self, path: &Path, mut handle_line: F) -> std::io::Result<()>
    where
        F: FnMut(&str),
    {
        let mut file = File::open(path)?;
        let file_len = file.metadata()?.len();

        // Detect log rotation or truncation
        if file_len < self.last_offset {
            self.last_offset = 0;
        }

        file.seek(SeekFrom::Start(self.last_offset))?;
        let mut reader = BufReader::new(file);
        let mut line = String::new();

        while reader.read_line(&mut line)? > 0 {
            if line.ends_with('\n') {
                handle_line(line.trim_end());
                self.last_offset += line.len() as u64;
                line.clear();
            } else {
                // Partial line at EOF; wait for next flush
                break;
            }
        }
        Ok(())
    }
}
```

#### The Claude Code Deduplication Trap
During streaming, Claude Code emits multiple JSONL lines sharing the **identical `message.id`** and identical `usage` payload:
```json
{"type":"assistant","uuid":"6a1b...","message":{"id":"fb8a75...","usage":{"input_tokens":28190,"output_tokens":176}}}
{"type":"assistant","uuid":"be81...","message":{"id":"fb8a75...","usage":{"input_tokens":28190,"output_tokens":176}}}
```
**Remedy:** Ingestion must track seen `message.id` values. Do not sum duplicate `usage` blocks; only record usage on the initial encounter or track `max(output_tokens)`.

---

### 3.3 Workspace Resolution (Mapping VS Code / Cursor Hashes to Projects)

VS Code forks store per-project state in hashed folders:  
`%APPDATA%/<IDE>/User/workspaceStorage/<workspace-hash>/`

To resolve `<workspace-hash>` to a canonical path (`E:\Code\ProjectAlpha`):
1. Inspect `<workspace-hash>/workspace.json`.
2. Parse `"folder"` or `"workspace"` URI:
   ```json
   { "folder": "file:///c%3A/Users/Dev/ProjectAlpha" }
   ```
3. Strip `file:///`.
4. URL-decode percent-encoded characters (`%20` -> space, `%3A` -> `:`).
5. Normalize Windows drive prefixes (`/c:/` -> `C:\`).
6. Build a persistent mapping table:
   ```sql
   CREATE TABLE workspace_mapping (
       workspace_hash TEXT PRIMARY KEY,
       ide_name TEXT,
       canonical_project_path TEXT,
       project_name TEXT,
       last_seen INTEGER
   );
   ```

---

### 3.4 Live Watching vs Polling Architecture

Using the Rust `notify` crate across developer machines presents four pitfalls:
1. **Event Floods:** A single file save emits multiple OS events (`Modify`, `Modify`, `CloseWrite`).
2. **SQLite WAL Target:** SQLite writes to `state.vscdb-wal`, NOT `state.vscdb`. Watching only `state.vscdb` misses all writes.
3. **Atomic File Swaps:** Many editors write `<file>.tmp` and rename over `<file>.json`.
4. **OS Handle Exhaustion:** Watching entire root drives or `.git` / `node_modules` folders exhausts OS handles.

#### The Dual-Engine Pipeline
- **Focused Watcher:** Attach `notify` strictly to target log folders (`~/.claude/projects/`, `globalStorage/`).
- **Debounce Window:** Implement a 350ms sliding debounce window per path before triggering ingestion.
- **Background Ticker:** Run a 10-second polling heartbeat to catch missed OS events or uncheckpointed WAL frames.

---

## Section 4: Sources Lacking Native Token Breakdowns & Fallbacks

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Source Fidelity Matrix                                         │
├───────────────────────┬───────────────────┬───────────────────┬──────────────────────────────────┤
│ Tool / Source         │ Native Tokens     │ Text Content      │ Recommended Fallback Strategy    │
├───────────────────────┼───────────────────┼───────────────────┼──────────────────────────────────┤
│ Claude Code           │ ✅ Exact (Full)   │ ✅ Full turns     │ Native JSONL ingestion           │
│ Cline & Roo Code      │ ✅ Exact (Full)   │ ✅ Full turns     │ Native JSON ingestion            │
│ Aider (CLI)           │ ✅ Exact (Logs)   │ ✅ Markdown       │ Native JSONL / CLI parsing       │
│ Antigravity           │ ✅ Exact (PB DB)  │ ✅ JSONL steps    │ Protobuf varint decoder in DB    │
│ Cursor Composer       │ ❌ Zero count     │ ✅ Full bubbles   │ Local `tiktoken-rs` or Proxy     │
│ Windsurf Cascade      │ ❌ Quota only     │ ⚠️ Protobuf text  │ Local `tiktoken-rs` or Proxy     │
│ Continue.dev          │ ❌ In output only │ ✅ Session JSON   │ Local `tiktoken-rs` or Proxy     │
│ Copilot Chat          │ ❌ Backend only   │ ✅ SQLite turns   │ Local `tiktoken-rs` or Proxy     │
│ Anthropic Admin API   │ ⚠️ Hourly aggregate│ ❌ No text       │ Not recommended for real-time    │
│ OpenAI Org API        │ ⚠️ Daily aggregate│ ❌ No text        │ Not recommended for real-time    │
│ Local Loopback Proxy  │ ✅ Exact (0ms)    │ ✅ Full streaming │ Universal capture for all tools  │
└───────────────────────┴───────────────────┴───────────────────┴──────────────────────────────────┘
```

### Detailed Fallback Methodologies

1. **Local Tokenizer Estimation (`tiktoken-rs`):**
   - For tools that store full conversation text but lack token counts (Cursor, Copilot Chat, Continue):
   - Extract `user_message`, `assistant_response`, and referenced code files.
   - Match the recorded `model` name against standard BPE encodings:
     - `cl100k_base`: GPT-4, GPT-4o, Claude models (approximation within ~3-5%)
     - `o200k_base`: GPT-4o, o1, o3-mini
   - Compute input and output token counts offline without network requests.

2. **Workspace Hash & Path Inference:**
   - When a session record lacks an explicit project path (e.g. Cursor's `composerHeaders`), resolve `workspaceId` against the startup cache populated from `workspaceStorage/<hash>/workspace.json`.
   - If an ad-hoc session has no workspace, categorize under `"Global / Scratchpad"`.

3. **Local Loopback Proxy:**
   - The cleanest fallback for Cursor and Windsurf users who require 100% exact token numbers (including caching and reasoning tokens). Point the IDE's custom model endpoint to `http://localhost:PORT/v1`.

---

## Section 5: Prioritized Roadmap & Tauri Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Implementation Phasing                                    │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Phase 1: MVP Release          │ Phase 2: Enhanced Ingestion   │ Phase 3: Enterprise    │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • Claude Code JSONL & Stats   │ • Antigravity Protobuf Decoder│ • Admin API 24h        │
│ • Cline & Roo Code JSON       │ • Cursor `tiktoken` Estimator │   Reconciler           │
│ • SQLite `mode=ro` Ingestion  │ • Continue & Copilot Parsers  │ • Multi-seat team      │
│ • Tauri UI with Project/Chat  │ • Embedded Tauri Loopback     │   dashboard sync       │
│   attribution & Live Charts   │   Proxy for live interception │ • Export CSV/Parquet   │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

---

### 5.1 Phase 1 (MVP) — The Top 3 Sources to Ship First
The first version should focus on sources that provide **100% verified, out-of-the-box local token data** with zero need for tokenizers or proxy configuration:

1. **Claude Code (`~/.claude/`):**
   - Read `stats-cache.json` on startup for instant historical charts.
   - Attach an incremental byte-offset watcher to `~/.claude/projects/*/*.jsonl`.
   - Captures `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, and `cache_read_input_tokens` per project and session.
2. **Cline & Roo Code (`globalStorage/saoudrizwan.claude-dev/` & `roo-cline/`):**
   - Ingest `state/taskHistory.json` for all historical tasks, tokens, and costs.
   - Watch `tasks/<task-id>/ui_messages.json` for live turn-by-turn streaming updates.
3. **Aider (`.aider.chat.history.md` & Analytics Log):**
   - Tail `.aider.chat.history.md` and analytics logs in active projects.

---

### 5.2 Phase 2 — Protobuf Decoders, Synthetic Estimators & Local Proxy
1. **Google Antigravity Decoder:**
   - Implement read-only SQLite reader for `conversations/<id>.db`.
   - Decode `gen_metadata` varints to extract generation tokens and model names.
2. **Cursor & Copilot Chat Synthetic Estimator:**
   - Query `cursorDiskKV` and `session-store.db`.
   - Run extracted prompt/response text through `tiktoken-rs` to populate estimated token counts.
3. **Tauri Loopback Proxy:**
   - Launch an embedded `axum` HTTP proxy on `localhost:3000`.
   - Intercept outbound OpenAI and Anthropic requests, inject `stream_options`, and record live SSE token usage.

---

### 5.3 High-Level Tauri App Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Tauri Frontend (React / Vue)                           │
│  - Dashboard: Real-time Tokens, Active Model Costs, Daily Burn Rate                    │
│  - Per-Project Breakdown: E:\Code\Spartan vs E:\AI\Token_Tracker                       │
│  - Per-Chat Breakdown: Turn-by-turn tokens, Cache hit ratios, Tool call overhead       │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │ Tauri IPC Events / Commands
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             Tauri Core Backend (Rust)                                  │
│                                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐  │
│  │   Focused Watcher    │  │  Incremental File Tailer│  │   SQLite Read-Only Engine │  │
│  │   (notify Crate)     │  │  (Byte-offset cursor)   │  │   (rusqlite + mode=ro)    │  │
│  └──────────┬───────────┘  └────────────┬────────────┘  └─────────────┬─────────────┘  │
│             │                           │                             │                │
│             ▼                           ▼                             ▼                │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             Ingestion Normalizer Router                          │  │
│  │   - Claude Code Parser      - Cline / Roo Parser      - Antigravity Decoder      │  │
│  │   - Cursor / Copilot Parser - Aider Log Parser        - Continue Session Parser  │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│                                         ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    Embedded Loopback Proxy (Axum - Optional)                     │  │
│  │   - Intercepts http://localhost:PORT/v1                                          │  │
│  │   - Injects stream_options: {include_usage: true}                                │  │
│  │   - Off-thread SSE chunk sniffing (Anthropic, OpenAI, Gemini usage blocks)      │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│                                         ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                      Local Master Database (SQLite / WAL)                        │  │
│  │   - projects (id, path, name)                                                    │  │
│  │   - sessions (id, project_id, tool_source, model, start_time)                    │  │
│  │   - turns (id, session_id, input_tokens, output_tokens, cache_read, cost)        │  │
│  │   - pricing_catalog (model_id, input_cost_per_m, output_cost_per_m, cache_cost)  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.4 Recommended Rust Crate Dependencies (`Cargo.toml`)
```toml
[dependencies]
tauri = { version = "2.0", features = ["tray-icon"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.31", features = ["bundled"] }
notify = "6.1"
tokio = { version = "1.0", features = ["full"] }
axum = "0.7"
reqwest = { version = "0.12", features = ["stream", "json"] }
tiktoken-rs = "0.5"
prost = "0.12" # For Protobuf decoding
chrono = { version = "0.4", features = ["serde"] }
```

---

## Conclusion
By prioritizing passive local ingestion of **Claude Code** and **Cline/Roo Code** in Phase 1, Token Tracker will immediately deliver **100% accurate, zero-latency, zero-cost, and per-project token and cost tracking** without requiring users to configure API keys or run proxies. In Phase 2, integrating local tokenizers and the optional local loopback proxy will expand complete coverage across **Cursor, Windsurf, Copilot, and custom scripts**, establishing Token Tracker as the definitive developer telemetry dashboard.

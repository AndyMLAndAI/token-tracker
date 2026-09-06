# Comprehensive Research Report: Local Agentic IDEs & Coding Tools Storage, Session Logs, and Token Usage

**Research Date:** September 2026  
**Investigator:** Subagent 1 (Local Agentic IDEs & Coding Tools Researcher)  
**Host Environment Tested:** Windows 11 (with cross-platform verification for macOS and Linux)

---

## Executive Summary Matrix

| Tool | Primary Storage Location | File Formats | Native Project Granularity | Token Breakdown Availability | Live Watching / Locking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude Code (CLI)** | `~/.claude/` & `~/.claude.json` | JSON, JSONL | Explicit directory sanitization (`E--Code-Spartan`) | **Full Breakdown:** `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `modelUsage`, daily aggregate | Append-friendly JSONL, no OS locks, safe for external tailing / file watchers |
| **Google Antigravity** | `~/.gemini/antigravity/` | SQLite (`.db`, `.db-wal`), Protobuf (`.pb`, `.pbtxt`), JSONL | Explicit workspace URIs in SQLite & `agyhub_summaries_proto.pb` | **Granular in Protobuf DB:** Per-step generation tokens embedded in SQLite `gen_metadata` blobs. Plaintext `transcript.jsonl` contains actions/steps without raw token counts | SQLite WAL mode (`.db-wal`), active process holds write locks, readers need `PRAGMA query_only` or WAL-safe connections |
| **Cursor IDE** | `%APPDATA%\Cursor\User\` & `~/.cursor/` | SQLite (`state.vscdb`), JSON | Workspace hash folder + `workspaceId` / `workspaceUris` in global storage | **Limited locally:** Message bubbles have schema `'tokenCount': {'inputTokens': 0, 'outputTokens': 0}`, but token accounting is executed on Anysphere cloud backend. Full prompts/diffs stored locally | SQLite WAL mode, frequent UI writes, readers must use read-only SQLite flags |
| **Windsurf (Codeium)** | `~/.codeium/windsurf/cascade/` & `%APPDATA%\Windsurf\` | Protobuf (`.pb`), SQLite (`state.vscdb`), JSON | Explicit workspace identifiers | **Credit / Cloud-based:** Local state caches recent plans/memories via Protobuf; exact token consumption is managed via Codeium cloud quota | SQLite and file-backed Protobuf, requires protobuf schema decoding or API polling |
| **Cline (VS Code)** | VS Code `globalStorage/saoudrizwan.claude-dev/` & `~/.cline/` | JSON, SQLite (`sessions.db`) | Explicit CWD/workspace path in `taskHistory.json` and SQLite | **Full Breakdown:** Exact `tokensIn`, `tokensOut`, `cacheReads`, `cacheWrites`, `totalCost`, per task & per request | Standard JSON & SQLite files, easy to poll or watch via `fs.watch` |
| **Roo Code (VS Code)** | VS Code `globalStorage/rooveterinaryinc.roo-cline/` | JSON, JSONL | Explicit workspace CWD per task | **Full Breakdown:** Same as Cline (`tokensIn`, `tokensOut`, `cacheReads`, `cacheWrites`, `totalCost`) | Standard JSON files, no lock contention |
| **Aider** | Project root CWD (`.aider.*`) | Markdown (`.md`), Plaintext, optional JSONL | Project-local root (per repository) | **Turn & Session Telemetry:** Real-time console reports tokens & costs; `--analytics-log` writes JSONL with token usage per event | Plain file append, trivial to tail with file watchers |
| **Continue.dev** | `~/.continue/sessions/` | JSON, YAML (`config.yaml`) | Implicit / per-session JSON metadata | **Context window tracking:** Tracks prompts, models, and context chunks; detailed billing tokens typically in IDE output channel | Loose individual JSON files per session |
| **GitHub Copilot Chat** | VS Code `globalStorage/github.copilot-chat/` | SQLite (`session-store.db`), JSON | Explicit repository, branch, and CWD columns in `sessions` table | **Conversation / Turn text only:** SQLite stores prompts, responses, tool calls, and FTS5 search index; billing tokens reside on GitHub backend | SQLite WAL mode, easy to query read-only |

---

## 1. Claude Code (CLI Tool)

### 1.1 Filesystem Paths Across Platforms
- **Windows:**
  - Config & Global State: `C:\Users\<username>\.claude.json`
  - CLI Application Directory: `C:\Users\<username>\.claude\`
  - App Local Data: `C:\Users\<username>\AppData\Local\Claude\` and `...\claude-cli-nodejs\`
- **macOS:**
  - Config: `~/.claude.json`
  - Application Directory: `~/.claude/`
- **Linux:**
  - Config: `~/.claude.json`
  - Application Directory: `~/.claude/`

### 1.2 Directory Structure & Project Separation
Claude Code uses an explicit, sanitized directory structure under `~/.claude/projects/` to separate workspaces without hashing or collisions:
```text
~/.claude/
├── settings.json               <-- Global settings, custom env, default model, permissions
├── settings.local.json         <-- Local overrides
├── history.jsonl               <-- Global command history across all projects
├── stats-cache.json            <-- Aggregated token usage, daily activity, and model stats
├── projects/
│   ├── E--Code-Spartan/        <-- Sanitized project path (colon & slashes replaced with '-')
│   │   ├── <session-uuid>.jsonl
│   │   ├── <session-uuid>/
│   │   │   └── subagents/
│   │   │       ├── agent-<agent-id>.jsonl
│   │   │       └── agent-<agent-id>.meta.json
│   │   └── memory/             <-- Project memory and scratchpad
│   └── C--Users-Ganesh-Bhopne/
└── sessions/                   <-- Active session pointers
```
In `~/.claude.json`, a top-level `"projects"` map records explicit allowed tools, MCP servers, and context URIs keyed directly by absolute project path (e.g. `"E:/Code/Spartan"`).

### 1.3 Token Metrics & Logged Data
Claude Code records **complete, granular token metrics** at two levels:

#### A. Per-Message Turn (inside `~/.claude/projects/<project>/<session-uuid>.jsonl`):
Every assistant message includes an exhaustive `usage` object:
```json
{
  "parentUuid": "...",
  "type": "assistant",
  "sessionId": "446021f3-03f3-4d27-980e-c07d4c6ce267",
  "cwd": "E:\\Code\\Spartan",
  "timestamp": "2026-09-05T07:37:38.704Z",
  "message": {
    "role": "assistant",
    "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "usage": {
      "input_tokens": 28622,
      "cache_creation_input_tokens": 0,
      "cache_read_input_tokens": 0,
      "output_tokens": 936,
      "server_tool_use": {
        "web_search_requests": 0,
        "web_fetch_requests": 0
      },
      "service_tier": "standard",
      "cache_creation": {
        "ephemeral_1h_input_tokens": 0,
        "ephemeral_5m_input_tokens": 0
      },
      "speed": "standard"
    }
  }
}
```

#### B. Aggregated Statistics Cache (`~/.claude/stats-cache.json`):
Maintains pre-computed aggregates ideal for dashboard tracking:
- `dailyActivity`: Array of `{ date, messageCount, sessionCount, toolCallCount }`
- `dailyModelTokens`: Array of `{ date, tokensByModel: { [model]: count } }`
- `modelUsage`: Per-model breakdown containing:
  - `inputTokens`
  - `outputTokens`
  - `cacheReadInputTokens`
  - `cacheCreationInputTokens`
  - `webSearchRequests`
  - `costUSD`
  - `contextWindow`
  - `maxOutputTokens`
- `totalSessions`, `totalMessages`, `longestSession`, `firstSessionDate`, `hourCounts`

### 1.4 Live Watching & Concurrency
- `projects/<project>/<session-id>.jsonl` and `history.jsonl` are strictly appended line-by-line.
- Standard file watchers (`fs.watch`, `chokidar`, `ReadDirectoryChangesW`) can tail these files in real-time with zero file locking conflicts.
- No authentication is required to inspect local files.

---

## 2. Google Antigravity

### 2.1 Filesystem Paths Across Platforms
- **Windows:** `C:\Users\<username>\.gemini\antigravity\`
- **macOS:** `~/.gemini/antigravity/`
- **Linux:** `~/.gemini/antigravity/`

### 2.2 Internal Directory Structure
```text
~/.gemini/antigravity/
├── antigravity_state.pbtxt     <-- Text-format protobuf: onboarding, migration status, last model
├── agyhub_summaries_proto.pb   <-- Binary protobuf: index of all projects, branches, URIs, summaries
├── brain/
│   └── <conversation-id>/
│       ├── implementation_plan.md
│       ├── walkthrough.md
│       └── .system_generated/
│           └── logs/
│               ├── transcript.jsonl        <-- Token-efficient step transcript (truncated fields)
│               └── transcript_full.jsonl   <-- Untruncated step transcript
└── conversations/
    ├── <conversation-id>.db                <-- Primary SQLite conversation database
    ├── <conversation-id>.db-wal            <-- Active WAL journal
    └── <conversation-id>.db-shm
```

### 2.3 Storage Format & Token Breakdown
Antigravity splits conversational data into two distinct subsystems:

1. **Human-Readable JSONL Transcripts (`brain/<conversation-id>/.system_generated/logs/transcript.jsonl`):**
   - Each line represents a step:
     ```json
     {
       "step_index": 28,
       "source": "MODEL",
       "type": "PLANNER_RESPONSE",
       "status": "DONE",
       "created_at": "2026-09-05T11:48:32.120Z",
       "thinking": "...",
       "tool_calls": [...]
     }
     ```
   - Plaintext `transcript.jsonl` deliberately omits raw token numbers to conserve context tokens when subagents read logs.

2. **SQLite Database with Serialized Protobufs (`conversations/<conversation-id>.db`):**
   - **`trajectory_meta`**: `trajectory_id`, `cascade_id`, `trajectory_type`, `source`
   - **`trajectory_metadata_blob`**: Contains workspace URI (e.g. `file:///e:/AI/Token_Tracker`), git branch, agent role instructions.
   - **`steps`**: Detailed execution steps with blob payloads.
   - **`gen_metadata`**: Stores raw Protobuf message blobs for each generation turn:
     - Embedded fields record exact token counts:
       - Protobuf Field 1 / Field 2: `input_tokens`, `output_tokens`, `cached_tokens`
       - Protobuf Field 19: Model string (e.g. `gemini-3.8-flash`)
       - Protobuf Field 20: Key-value metadata (`request_id`, `used_claude`, `model_enum`, `trajectory_id`).

### 2.4 Live Watching & Concurrency
- SQLite is operated in **WAL (Write-Ahead Logging)** mode.
- Antigravity IDE keeps the `.db` connection open while a conversation runs.
- External tools reading `<conversation-id>.db` should connect in **read-only mode** (e.g. `sqlite3.connect('file:...db?mode=ro', uri=True)`) or inspect `transcript.jsonl` via append-tailing.
- No local authentication is required.

---

## 3. Cursor (Anysphere)

### 3.1 Filesystem Paths Across Platforms
- **Windows:**
  - Global State: `%APPDATA%\Cursor\User\globalStorage\state.vscdb`
  - Workspace State: `%APPDATA%\Cursor\User\workspaceStorage\<workspace-hash>\state.vscdb`
  - User AI Tracking: `C:\Users\<username>\.cursor\ai-tracking\ai-code-tracking.db`
  - Settings: `%APPDATA%\Cursor\User\settings.json`
- **macOS:**
  - Global State: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`
  - Workspace State: `~/Library/Application Support/Cursor/User/workspaceStorage/<workspace-hash>/state.vscdb`
  - AI Tracking: `~/.cursor/ai-tracking/ai-code-tracking.db`
- **Linux:**
  - Global State: `~/.config/Cursor/User/globalStorage/state.vscdb`
  - Workspace State: `~/.config/Cursor/User/workspaceStorage/<workspace-hash>/state.vscdb`
  - AI Tracking: `~/.cursor/ai-tracking/ai-code-tracking.db`

### 3.2 Database Schema & Architecture
Cursor has migrated across versions from storing inline chats inside `workspaceStorage` to a centralized global KV architecture:

#### A. Global Storage (`globalStorage\state.vscdb`):
Contains three primary tables:
1. **`ItemTable`** (`key TEXT UNIQUE, value BLOB`): General IDE preferences and extension states.
2. **`composerHeaders`**:
   - Schema: `composerId TEXT PRIMARY KEY, workspaceId TEXT, createdAt INTEGER, lastUpdatedAt INTEGER, isArchived INTEGER, isSubagent INTEGER, recency INTEGER, checkpointAt INTEGER, subagentTypeName TEXT, value TEXT`
   - Maps each composer session to its corresponding `workspaceId`.
3. **`cursorDiskKV`** (`key TEXT UNIQUE, value BLOB`):
   - Stores each chat and composer interaction turn under keys formatted as:
     `bubbleId:<composerId>:<messageId>`
   - Each bubble value is a large JSON blob containing:
     - `text` / `richText`: User prompts and assistant responses
     - `modelInfo`: E.g. `{"modelName": "claude-3.5-sonnet"}` or `{"modelName": "grok-4.6"}`
     - `context`: Mentions, file selections, git diffs, web searches, terminal output
     - `tokenCount`: Defined as `{"inputTokens": 0, "outputTokens": 0}`

#### B. AI Code Tracking Database (`~/.cursor/ai-tracking/ai-code-tracking.db`):
- Tracks commit scoring and code generation:
  - `ai_code_hashes`: `(hash, source, fileExtension, fileName, requestId, conversationId, timestamp, model, createdAt)`
  - `scored_commits`: Counts `linesAdded`, `linesDeleted`, `composerLinesAdded`, `humanLinesAdded`, `v1AiPercentage`
  - `conversation_summaries`: `(conversationId, title, tldr, overview, model, mode, updatedAt)`

### 3.3 Are Token Metrics Stored Locally?
- **Finding:** Cursor does **not** persist actual billed token counts locally in `state.vscdb`. The `tokenCount` structure inside message bubbles is initialized to `{inputTokens: 0, outputTokens: 0}` and token accounting is managed remotely on Anysphere's cloud infrastructure.
- Local storage preserves full prompt text, file selections, code diffs, thinking blocks, and tool executions. To estimate token usage from Cursor locally, a tracker must calculate tokens by tokenizing the stored prompt and response strings using model-specific tokenizers (e.g. tiktoken or cl100k_base).

---

## 4. Windsurf (Codeium)

### 4.1 Filesystem Paths Across Platforms
- **Windows:**
  - Cascades & Sessions: `C:\Users\<username>\.codeium\windsurf\cascade\`
  - Config & Rules: `C:\Users\<username>\.codeium\windsurf\mcp_config.json`
  - Global State: `%APPDATA%\Windsurf\User\globalStorage\state.vscdb`
  - Workspace State: `%APPDATA%\Windsurf\User\workspaceStorage\<workspace-hash>\state.vscdb`
- **macOS:**
  - Cascades: `~/.codeium/windsurf/cascade/`
  - Global Storage: `~/Library/Application Support/Windsurf/User/globalStorage/state.vscdb`
- **Linux:**
  - Cascades: `~/.codeium/windsurf/cascade/`
  - Global Storage: `~/.config/Windsurf/User/globalStorage/state.vscdb`

### 4.2 Formats & Token Handling
- **Cascade Storage:** Modern versions of Windsurf store Cascade session logs in binary Protocol Buffer (`.pb`) files within `~/.codeium/windsurf/cascade/` along with JSON configuration.
- **Token Metrics:** Windsurf functions on a proprietary **Credit & Quota system** rather than exposing raw per-turn API token metrics locally. The local IDE queries server-side endpoints (e.g. `GetPlanStatus` protobuf API) to display remaining credits and quota in the UI widget.
- Detailed token counts are not exposed as plain local CSV/JSON logs; local parsing requires decoding the internal protobuf schemas or calculating token counts directly from prompt text.

---

## 5. Cline & Roo Code (VS Code Extensions)

### 5.1 Filesystem Paths Across Platforms
- **Cline:**
  - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\` and `C:\Users\<username>\.cline\`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/`
  - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/`
- **Roo Code:**
  - Windows: `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\`
  - macOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/`
  - Linux: `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/`

### 5.2 Storage Structure & Token Breakdown
Cline and Roo Code provide **the most complete and cleanly exported local token logs** among all IDE extensions:

```text
globalStorage/saoudrizwan.claude-dev/
├── state/
│   └── taskHistory.json        <-- High-level task summary with exact tokens & cost
├── tasks/
│   └── <task-id>/
│       ├── api_conversation_history.json
│       ├── ui_messages.json
│       └── task_metadata.json
```

#### Task History Summary (`state/taskHistory.json`):
Each task entry contains verified exact metrics:
```json
{
  "id": "1786625698772",
  "ulid": "01KZXK1AZ614HPKCA7Z9565S5K",
  "ts": 1786625769143,
  "task": "Hey! Can you make a python function...",
  "tokensIn": 13574,
  "tokensOut": 647,
  "cacheWrites": 0,
  "cacheReads": 26624,
  "totalCost": 0.00,
  "size": 29512,
  "cwdOnTaskInitialization": "e:\\AI\\Learn",
  "modelId": "deepseek/deepseek-v4-flash"
}
```

Additionally, standalone CLI Cline stores scheduled executions and sessions in `~/.cline/data/db/sessions.db`:
- `schedule_executions`: columns `(execution_id, schedule_id, session_id, tokens_used, cost_usd)`.

---

## 6. Aider & Continue.dev

### 6.1 Aider (Terminal AI Pair Programmer)
- **File Locations:** Stored natively in the current working directory / git root:
  - Chat history: `.aider.chat.history.md` (Markdown transcript of all turns)
  - Prompt history: `.aider.input.history` (Raw prompt commands)
  - Optional Analytics Log: Configured via `--analytics-log <path>` or `AIDER_ANALYTICS_LOG`
- **Tokens & Costs:**
  - Aider computes exact token counts at every prompt turn using model pricing tables (`.aider.model.metadata.json`).
  - Terminal prints: `"Tokens: 4.2k sent, 310 received. Cost: $0.015 message, $0.12 session."`
  - When `--analytics-log` is enabled, events are appended in JSONL format with exact tokens sent/received per model call.

### 6.2 Continue.dev
- **File Locations:**
  - Windows: `%USERPROFILE%\.continue\sessions\` and `%USERPROFILE%\.continue\config.yaml`
  - macOS / Linux: `~/.continue/sessions/` and `~/.continue/config.yaml`
- **Format:**
  - Each chat session is saved as an individual `.json` file (`<session-id>.json`).
  - Contains `sessionId`, `title`, `workspaceDirectory`, and message arrays with model references.
  - Granular API tokens are streamed to the IDE Output panel (`Output > Continue`); the local session JSON focuses on message prompts and context references.

---

## 7. GitHub Copilot Chat

### 7.1 Storage Location & SQLite Architecture
- **Windows:** `%APPDATA%\Code\User\globalStorage\github.copilot-chat\session-store.db`
- **macOS:** `~/Library/Application Support/Code/User/globalStorage/github.copilot-chat/session-store.db`
- **Linux:** `~/.config/Code/User/globalStorage/github.copilot-chat/session-store.db`

### 7.2 Tables & Data Available
- **`sessions`**: `id`, `cwd`, `repository`, `host_type`, `branch`, `summary`, `agent_name`, `agent_description`, `created_at`
- **`turns`**: `turn_index`, `user_message`, `assistant_response`, `timestamp`
- **`checkpoints`**: `title`, `overview`, `work_done`, `technical_details`, `important_files`, `next_steps`
- **`search_index`**: SQLite FTS5 virtual table for full-text search across conversations
- **Token Availability:** GitHub Copilot Chat logs conversation turns and tool executions, but does not record per-request token usage or cost in `session-store.db` (telemetry is relayed to GitHub servers).

---

## 8. Practical Implementation Recommendations for Token Tracker

1. **Direct Ingestion for Claude Code & Cline / Roo Code:**
   - These tools provide **direct, out-of-the-box local token and cost metrics**:
     - Claude Code: Parse `~/.claude/stats-cache.json` for instant aggregated metrics, and tail `~/.claude/projects/*/*.jsonl` for live streaming tokens (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`).
     - Cline / Roo Code: Read `globalStorage/<extension>/state/taskHistory.json` for clean arrays of `tokensIn`, `tokensOut`, `cacheReads`, `cacheWrites`, and `totalCost`.
2. **Protobuf Extraction for Google Antigravity:**
   - To track Antigravity tokens, query `conversations/*.db` for `gen_metadata` blobs and extract protobuf varint tags (Field 1: tokens, Field 19: model name), or tail `transcript.jsonl` for step activity and workspace associations.
3. **Synthetic Estimation for Cursor, Windsurf, Copilot, & Continue:**
   - Because Cursor, Windsurf, Copilot, and Continue prioritize server-side token accounting, local tracker integration should ingest conversation prompts, tool calls, and responses from their local databases (`cursorDiskKV`, `session-store.db`, `sessions/*.json`), and pass the text through a standard local tokenizer (e.g., `tiktoken` or HuggingFace tokenizers) mapped to the recorded `model` name.

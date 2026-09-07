# Token Tracker CLI Companion

Lightweight, high-performance terminal companion for **Token Tracker** built with **[Ink](https://github.com/vadimdemedes/ink)** (React for interactive CLIs).

The CLI connects directly to the desktop app's local SQLite database (`node:sqlite`) in **read-only mode**, providing instant visibility into your AI token consumption, model costs, and project metrics right from your terminal without opening the desktop GUI.

---

## Features

- **Ink (React) Terminal UI**: Beautiful interactive dashboard with rounded-border metric cards and clean Unicode box-drawing tables.
- **Top / Htop Style Live Monitor**: `tt watch` updates in place using React hooks (`useState`, `useEffect`) without terminal scrolling or flickering.
- **Global Shorthand**: Run commands via either `token-tracker` or the concise `tt` alias.
- **Zero-Bloat Architecture**: Powered by Node.js v22+ built-in `node:sqlite` engine (no C++ compilers or native rebuilds needed).
- **Zero Write Contention**: Always opens SQLite in read-only mode (`PRAGMA query_only = ON;`), safely running concurrently while the desktop app ingests active turns.
- **Scripting Friendly**: Full `--json` flag support across every command for clean raw JSON piping into `jq` or CI logs.

---

## Installation & Usage

### 1. Global Installation (npm)
```bash
npm install -g @andymlandai/token-tracker-cli
```

### 2. Instant Run via npx
```bash
npx @andymlandai/token-tracker-cli status
```

---

## Commands

Both `token-tracker` and `tt` work interchangeably:

### `tt` or `tt status`
Displays today's usage (last 24 hours), 7-day totals, lifetime token/cost metrics, and top active projects.
```bash
tt status
```
Output as pure JSON:
```bash
tt status --json
```

### `tt watch`
Interactive live monitor that updates in place every 2 seconds with a pulsing live indicator.
```bash
tt watch
```
*(Press `q` or `Ctrl+C` to cleanly exit).*

### `tt projects`
Lists all active tracked projects sorted by token volume with session counts, turns, cost, and last-active timestamps (filtering out empty/null projects).
```bash
tt projects
```

### `tt project <name>`
Inspects a specific project, listing individual chat sessions, AI model names, turn counts, and cost breakdown.
```bash
tt project "Token_Tracker"
tt project "Spartan"
```

---

## Environment Variables

- `TOKEN_TRACKER_DB`: Optional override path to a custom `token_tracker.db` SQLite database file.
  *(Default automatically discovers standard desktop app locations across Windows `%APPDATA%`, `~/.token_tracker`, and Linux/macOS paths).*

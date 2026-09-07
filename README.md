# Token Tracker

Exact local token and cost tracking for your AI coding assistants — broken down by **project** and **individual chat/session**, not just one global number.

Most usage trackers only show account-wide totals. Token Tracker tells you exactly which project (and which specific chat) is actually burning through your budget.

![Version](https://img.shields.io/badge/version-1.7.0-10b981)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/telemetry-none-black)

**[Download](https://gettokentracker.netlify.app/) · [Website](https://gettokentracker.netlify.app/)**

---

## Why

If you use Claude Code, Cline, Roo Code, or similar tools across multiple projects, you've probably wondered *which* project is actually costing you money. Every tool reports its own number, none of them talk to each other, and none of them break it down further than "here's your total."

Token Tracker reads your local session logs directly — no API calls, no cloud sync, nothing leaves your machine — and gives you a real breakdown: per project, per chat, with exact token counts and cost.

## Features

- **Per-project & per-chat breakdown** — not just a global total
- **100% local** — reads session logs directly off disk, no telemetry, no cloud
- **Multi-source ingestion** — Claude Code, Cline, Roo Code, Google Antigravity (more in progress)
- **Data provenance labeling** — clearly marked as Exact / Estimated / Live-captured, so you always know how reliable a number is
- **Live tracking** — file watchers pick up new sessions as they happen
- **Dashboard** — usage overview, trends over time, cache hit ratios
- **Budget alerts** — optional spend thresholds, daily/weekly/monthly
- **Export** — CSV, JSON, and shareable summary reports

## Screenshots

*(add a couple of Dashboard/Projects screenshots here)*

## Install

Download the latest installer from the [website](https://gettokentracker.netlify.app/) or directly from [Releases](https://github.com/AndyMLAndAI/token-tracker/releases).

- Windows 10/11 (64-bit)
- No admin rights required
- ~460 MB disk space

> **Note:** Windows SmartScreen may show a warning since this is a newly published app. Click **More Info → Run Anyway** to proceed. The installer is not malicious — this is standard for unsigned/new publishers.

## How it works

Token Tracker doesn't intercept or proxy any API traffic. It reads the same local session files your AI coding tools already write to disk:

| Source | What's read |
|---|---|
| Claude Code | `~/.claude/stats-cache.json` + live `.jsonl` session tailing |
| Cline | VS Code extension task history + live task tracking |
| Roo Code | VS Code extension task history + live task tracking |
| Google Antigravity | Local conversation database |

All ingested data is stored locally in a SQLite database on your machine. Nothing is uploaded anywhere.

## Status

This is an early release (v1.8.0) and my first project at this scale — it works and I use it daily, but there will be rough edges. Bug reports and feedback are genuinely welcome via [Issues](https://github.com/AndyMLAndAI/token-tracker/issues).

**Currently Windows-only.** macOS/Linux support is on the roadmap.

## Roadmap

- [ ] macOS & Linux builds
- [ ] Cursor / Windsurf / Copilot estimated tracking (tokenizer-based)
- [ ] Optional local proxy for real-time capture on tools without local logs
- [ ] Code-signed installer (remove SmartScreen warning)

## Tech Stack

TypeScript · Electron · React · shadcn/ui · SQLite (`node:sqlite`)

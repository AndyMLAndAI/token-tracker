# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React

## Users

Software engineers, AI developers, and engineering leads using agentic coding tools (Claude Code, Google Antigravity, Cursor, Windsurf, Cline, Roo Code, Aider) who need exact, granular visibility into token consumption and LLM costs per local project and session.

## Product Purpose

Token Tracker provides exact local telemetry and cost monitoring for agentic coding workflows. It eliminates the mystery of blended monthly provider invoices by attributing every prompt, completion, and cache read to specific repositories and chat sessions on the developer's workstation—100% offline with zero cloud telemetry.

## Positioning

Unlike cloud observability dashboards (LangSmith, Helicone) or provider billing pages that aggregate monthly org-wide API totals, Token Tracker runs entirely on the developer's local machine, indexing local session logs and SQLite databases without transmitting code, prompts, or tokens to any external server.

## Operating Context

Desktop engineering workstations (Windows 10/11, with macOS and Linux in development), agentic IDEs (Cursor, Windsurf, VS Code), and CLI coding tools (Claude Code, Google Antigravity, Aider).

## Capabilities and Constraints

- File-system based ingestion (JSONL streams, SQLite WAL databases, Markdown logs)
- Verified provenance categorization (Exact, Estimated BPE, Captured)
- Local SQLite database storage
- Threshold budgeting with native desktop alerts
- 100% local-first, zero telemetry, offline operational
- Marketing website: Independent Vercel deployment, editorial parchment aesthetic, Lora + Geist Sans typography, flat tone-shift elevation

## Brand Commitments

- Name: Token Tracker
- Primary Accent: #10b981 (Emerald)
- Hover Accent: #059669 (Emerald Deep)
- Neutral Canvas: #f0eee6 (Ivory Medium)
- Card Surface: #faf9f5 (Ivory Light)
- Highlight Panel: #f5e3c7 (Manilla)
- Secondary Surface: #e3dacc (Oat Warm)
- Inverted Surface: #141413 (Slate Dark)
- Border: #cccbc8 (Stone)
- Typography: Lora (serif 20px body, 68px display) + Geist Sans (61px bold heading, UI, buttons, nav) + Geist Mono (technical snippets)
- Button Radii: Bottom-only 8px radius on filled buttons (`rounded-b-[8px] rounded-t-none`)
- Card Radii: 24px (`rounded-[24px]`)
- Single primary Emerald CTA per page, no decorative accent scattering

## Evidence on Hand

- Shipped desktop application v1.8.0 installer (Token-Tracker-Setup-1.8.exe)
- Ingestion engine covering 6+ agentic tool sources
- Real UI screenshot assets (dashboard-preview.png, icon.png, icon.svg)

## Product Principles

1. Local-first is non-negotiable: zero telemetry, zero cloud accounts, 100% offline data integrity.
2. Exact attribution over blended estimates: distinguish verified provider tokens from local BPE heuristics.
3. Editorial restraint: a physical, literary parchment presentation that treats token telemetry like a ledger of craft.
4. Transparent utility: controls name their action, metrics reflect reality, and primary actions are unambiguous.

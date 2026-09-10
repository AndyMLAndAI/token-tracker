# Skills Hub ✦

> *"Want a skill? Don't search. Come here, copy, done."*

A curated, high-craft editorial catalog of verified agent skills, CLI workflows, and engineering primitives for developers building with Claude, Antigravity, and modern AI developer tools.

---

## Design System

Skills Hub strictly adheres to the **Claude Parchment Design System**:

- **Paper Canvas**: `#f8f8f6`
- **Surface Cards**: Primary `#ffffff`, Secondary `#efeeeb`
- **Ink Hierarchy**:
  - Ink Primary: `#121212`
  - Ink Secondary: `#373734`
  - Ink Muted: `#7b7974`
  - Ink Subtle: `#9c9a92`
- **Accent Mark**: Clay `#d97757` — used exclusively for indicator dots, micro marks, and subtle states; never as CTA fill.
- **True Obsidian Footer**: `#000000` — museum-grade editorial colophon grounding the catalog.
- **Editorial Typography**:
  - **Serif**: Source Serif 4 (headlines, editorial statements)
  - **Sans**: Inter (UI, metadata, descriptions)
  - **Monospace**: JetBrains Mono (command code blocks)
- **Geometry & Depth**:
  - 8px radii (nav pills, inputs, buttons, command blocks)
  - 16px radii (feature benefit skill cards)
  - Soft featherweight shadows: `0 4px 20px rgba(0,0,0,0.04)`

---

## Motion System (Framer Motion)

- **Large-scale choreography**: Staggered fade + rise for hero titles, settling metadata notice, and spring grid entrance.
- **Micro-interactions**:
  - **CopyButton**: Spring-animated SVG morph from clipboard outline to confirmed checkmark with `pathLength` interpolation and a floating micro-pill tooltip.
  - **FilterChip**: Spring-scaled pill buttons with layout physics on selection and category count markers.
  - **SearchInput**: Real-time filtering with Carbon Ink focus ring (`#121212`) and `/` keyboard shortcut.
  - **SkillCard**: Gentle hover lift (`-3px`) and soft shadow expansion.

---

## Data Model (`/data/skills.json`)

Each entry in `/data/skills.json` adheres to the schema:
```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  installCommand: string;
  tags: string[];
  sourceUrl?: string;
}
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run production build
npm run build
```

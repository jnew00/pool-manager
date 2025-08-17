# CLAUDE.md — PoolManager

This file sets the standing rules for *every* Claude Code session in this repo.

## At Session Start

- Read this `CLAUDE.md` (rules), then read:
  - `docs/TECH_GUIDE.md` (structure & tools)
  - `docs/PROJECT_BRIEF.md` (business requirements)
  - `SESSION.md` (running history/context)
- Confirm understanding of current milestone before writing code.

## At Session End

Update `SESSION.md` with a concise summary:

- **Date/Time**
- **Objectives** (intended goals)
- **Accomplishments** (what shipped)
- **Files Modified** (significant changes, 1–2 lines each)
- **Design Decisions** (important choices + rationale)
- **DB Changes** (migrations/DDL)
- **Dependencies** (added/updated)
- **Testing** (new/changed tests, notable coverage)
- **Next Steps** (clear, actionable)
- **Context for Future** (gotchas, follow-ups)

If `SESSION.md` grows past ~5000 lines, compact older entries into a “Milestones” summary and keep the last 5–10 sessions detailed.

## Development Ground Rules

- **TDD** always: write a failing test → make it pass → refactor.
- **TDD Guard is active.** Keep two terminals running:
  - `npx tdd-guard`
  - `npm run test:watch`
- Small, frequent commits. No pushes unless I say so.
- ESM modules, TypeScript strict, readable over clever.
- Never hardcode secrets; use `.env`.

## UI/UX General Guidelines

- Modern that feels fast, fluid, and premium at every touchpoint. 
- The interface should be clean and responsive, with balanced white space, crisp typography, and a visual hierarchy that guides the eye naturally
- Animations and transitions should be smooth, purposeful, and performance-friendly — enhancing the user’s sense of flow rather than distracting.
- Every interaction, from button presses to page loads, should feel instant and effortless, reinforcing the sense of quality and polish.
- The design language should work across all devices without compromise, giving users a consistent, beautiful experience whether on mobile, tablet, or desktop.

## Notion Usage (Docs)

- Keep high-level documentation in Notion under the “PoolManager” wiki:
  - “Tech & Tools” (stack notes), “Runbooks” (ops), “Features & Rules” (pool rules), “Data & Schema” (DB/ERD).
- When you complete a milestone, append a dated section to the appropriate Notion page with:
  - What changed, any migrations, links (commit hash/branch), and how to roll back.

> For implementation details use `docs/TECH_GUIDE.md`.  
> For scope/business rules use `docs/PROJECT_BRIEF.md`.  
> For session continuity use `SESSION.md`.
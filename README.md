# FOUNDRY — AI Company Simulator

Deterministic organization simulation and CEO management game. Phase 1: Playable Startup.
See [PHASE1_REPORT.md](PHASE1_REPORT.md) for executed acceptance evidence and limitations.

Requires Node.js 24 and pnpm 11.19.0. Install with `pnpm install`.

- `pnpm dev` — development web UI at http://127.0.0.1:5173
- `pnpm build` — typecheck, production Vite bundle and Electron main/preload bundle
- `pnpm desktop` — launch the built desktop application
- `pnpm typecheck` — strict TypeScript validation
- `pnpm lint` — ESLint plus simulation randomness restrictions
- `pnpm test` — Vitest regression suite
- `pnpm test:e2e` — browser and Electron user workflows (requires local Chrome)
- `pnpm package:win` — build Windows portable executable in release/
- `pnpm test:packaged` — exercise the packaged Windows application
- `pnpm sim --seed garage-001 --years 5` — headless simulation / replay check
- `pnpm benchmark` — 100 seeds × five calendar years
- `pnpm benchmark:stress` — 1,000 employees × ten calendar years

No LLM in simulation or narration. No API key or network connection required for gameplay.
Money uses integer NT cents. UI projections hide exact employee psychology. Desktop saves use SQLite; a browser adapter uses per-origin IndexedDB so refreshing retains progress.

Desktop saves: `%APPDATA%/ai-company-simulator/companies.sqlite` (actual user-data location is selected by Electron). Browser saves: per-origin IndexedDB. Every accepted decision autosaves; header Save creates a separate manual checkpoint. Settings restores the checkpoint, exports/imports portable JSON and verifies replay. Refresh resumes autosave. Two different browser profiles/devices have isolated worlds. Clearing site data removes the browser save; export a backup before clearing data or changing the site's URL. No cloud account sync is claimed.

Start with NT$500,000, CEO/CTO/Engineer and one Atlas prototype. Advance days/weeks, recruit, manage salaries and teams, choose product priority and company strategy. Observe employee concerns and event causes rather than exact psychological scores. Monthly payroll and active-day revenue are booked at calendar month boundaries. Insolvency stops operations; create a new company or restore an earlier checkpoint.

Documentation: [architecture](ARCHITECTURE.md), [equations/scheduling](SIMULATION.md), [save format](SAVE_FORMAT.md), [validation commands](TESTING.md). The original supplied specification is preserved at docs/PHASE1_SPEC.txt. GitHub source remains private.

# FOUNDRY — AI Company Simulator

Deterministic organization simulation and CEO management game. Current app: 0.2.3, simulation v3. Phase 2 organization mechanics are implemented; Phase 2.5 human validation/retention diagnostics are documented in [PHASE2_5_REPORT.md](PHASE2_5_REPORT.md). The current gate is further Phase 2.5 iteration, not automatic Phase 3 development.
See [PHASE1_REPORT.md](PHASE1_REPORT.md) for executed acceptance evidence and limitations.
Phase 1.5 gameplay findings and the remaining balance gate: [PHASE1_5_REPORT.md](PHASE1_5_REPORT.md).

Play online: https://foundry-company-simulator.oliverchenovo.chatgpt.site . Each browser profile keeps its own local progress; refresh resumes it. Export a backup in Settings before clearing browser data. Cross-device account synchronization is outside Phase 1.

Requires Node.js 24 and pnpm 11.19.0. Install with `pnpm install`.

- `pnpm dev` — development web UI at http://127.0.0.1:5173
- `pnpm build` — typecheck, production Vite bundle and Electron main/preload bundle
- `pnpm build:site` — hosted browser bundle with Sites-compatible CSP in out/
- `pnpm test:hosted` — production URL acceptance; intentionally creates isolated test profiles
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
- `pnpm audit:retention` — 13 observable-information policies × 100 shared seeds × five years, with developer-only funnel evidence
- `pnpm audit:retention:long` — four survival-focused policies × 100 shared seeds × ten years
- `pnpm audit:retention:controlled` — controlled ten-year retention scenarios and matched interventions

No LLM in simulation or narration. No API key or network connection required for gameplay.
Money uses integer NT cents. UI projections hide exact employee psychology. Desktop saves use SQLite; a browser adapter uses per-origin IndexedDB so refreshing retains progress.

Desktop saves: `%APPDATA%/ai-company-simulator/companies.sqlite` (actual user-data location is selected by Electron). Browser saves: per-origin IndexedDB. Every accepted decision autosaves; header Save creates a separate manual checkpoint. Settings restores the checkpoint, exports/imports portable JSON and verifies replay. Refresh resumes autosave. Two different browser profiles/devices have isolated worlds. Clearing site data removes the browser save; export a backup before clearing data or changing the site's URL. No cloud account sync is claimed.

Start with NT$500,000, CEO/CTO/Engineer and one Atlas prototype. Advance days/weeks, recruit, manage salaries and teams, choose product priority and company strategy. Observe employee concerns and event causes rather than exact psychological scores. Monthly payroll and active-day revenue are booked at calendar month boundaries. Insolvency stops operations; create a new company or restore an earlier checkpoint.

Documentation: [architecture](ARCHITECTURE.md), [equations/scheduling](SIMULATION.md), [save format](SAVE_FORMAT.md), [validation commands](TESTING.md). The original supplied specification is preserved at docs/PHASE1_SPEC.txt. GitHub source remains private.


Phase1.5B: [compensation integrity report](PHASE1_5B_REPORT.md), [independent expectation model](docs/phase1_5b/COMPENSATION_MODEL.md), [version compatibility](docs/phase1_5b/COMPATIBILITY.md), [human playtest protocol](docs/phase1_5b/HUMAN_PLAYTEST_PROTOCOL.md). New0.1.1games use simulation2; existing saves replay with simulation1 without migration. Phase2 is only a recommendation, not implemented.

Phase 2.6B Living Office uses a genuine lightweight React Three Fiber / Three.js cutaway with deterministic people, real-event presentation and SVG graphics/mobile fallback. See [PHASE2_6B_REPORT.md](PHASE2_6B_REPORT.md) and [3D visual acceptance](docs/living_office_3d/VISUAL_ACCEPTANCE.md). The original [Phase 2.6 report](PHASE2_6_REPORT.md) remains a historical SVG baseline. Phase 2.5 human retention validation remains pending; this visual feature does not replace it.

# FOUNDRY — AI Company Simulator

Deterministic organization simulation and CEO management game. Phase 1: Playable Startup.
Current development is incremental; see docs/PHASE1_SPEC.txt for the acceptance contract.

Requires Node.js 24 and pnpm 11.19.0. Install with `pnpm install`.

- `pnpm build` / `pnpm typecheck` — strict TypeScript validation (desktop bundling added at UI milestone)
- `pnpm lint` — ESLint plus simulation randomness restrictions
- `pnpm test` — Vitest regression suite
- `pnpm sim --seed garage-001 --years 5` — headless simulation / replay check
- `pnpm benchmark` — 100 seeds × five calendar years
- `pnpm benchmark:stress` — 1,000 employees × ten calendar years

No LLM in simulation or narration. No API key or network connection required for gameplay.
Money uses integer NT cents. UI projections hide exact employee psychology. Desktop saves use SQLite; a browser adapter uses per-origin IndexedDB so refreshing retains progress.

Final hosting and independent player progress are the product destination. Account sync and online publishing remain outside this Phase 1 acceptance scope.

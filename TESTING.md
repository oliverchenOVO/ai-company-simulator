# Validation

Requires Node24, pnpm11.19.0, installed Google Chrome and Windows for Electron packaging. `pnpm install --frozen-lockfile` explicitly allows Electron/esbuild installation scripts; electron-winstaller is not used by the portable target. Chromium can alternatively be installed and channel changed intentionally if Chrome is unavailable.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm benchmark`, `pnpm benchmark:stress`, `pnpm build`, `pnpm test:e2e`, `pnpm package:win`, `pnpm test:packaged`. The packaged test requires packaging to finish first; do not race the test against an output directory being rewritten.

Vitest categories cover RNG isolation, canonical hashing, leap dates, initial scenario, validated commands/atomic rejection, payroll and proration, work exclusion, employee stress/burnout/compensation/resignation, relationship changes, real product/customer progression, bankruptcy, invariants, command/event history, save/load/migrations, real SQLite reopen/slot overwrite/isolation, durable application sessions, private truth exclusion, narration and golden seeds.

Golden seeds golden-001/002/003 check tick365/1096/1826 (year1/3/5) against committed SHA-256 fixtures. `pnpm golden:generate` is maintenance only; never run it automatically to fix a failing regression. Explain changed equations/version and review fixture diffs before committing a legitimate new baseline.

E2E starts the production Vite preview at http://127.0.0.1:4173. Workflows: create/advance/hire/adjust salary/manual save/refresh/replay/checkpoint load, separate browser contexts, teams/move/product/strategy/screens, 390px layout and keyboard Escape, loaded offline operation, browser export → Node replay, 1,000-person pagination/responsive worker calculation, and true Electron process restart using SQLite. Desktop tests use isolated temporary user-data directories and close processes before cleanup.

Visual evidence comes from Playwright at reference-native1586×992 and mobile390×844; set `FOUNDRY_QA_DIR` to an absolute external artifact folder. Browser plugin/browser skill were unavailable; regular Playwright with local Chrome was the fallback. Inspect actual image pixels against docs/design/dashboard-concept.png; passing tests alone is not visual sign-off. Trace files are retained only for failures and remain git-ignored.

Benchmark reports are docs/benchmarks/seeds.json and stress.json: runtime, employees, active customers, revenue, cash, events, bankruptcy, exceptions, finite-number scans, corrupted states, invariant counts and state hashes. All100 seed runs also execute independent replay and round-trip restoration. Stress replay is not repeated; stress integrity/schema/invariants are checked, and that field's zero is not a claim that an independent stress replay ran. Hardware/timing is observational and not a brittle CI pass threshold.

The CLI `pnpm sim --seed garage-001 --days 120 --debug` inspects seed, tick, hash, hidden employee truth, recent events and invariant status outside normal gameplay. Production desktop debug needs the explicit `--debug-simulation` flag.

CI in .github/workflows/ci.yml runs Windows validation and a separate packaging job, uploads benchmark/failure evidence and the portable executable, and performs no public GitHub release. Remote CI status must be inspected separately from local check results.

`pnpm build:site` produces out/ for .openai/hosting.json; default `pnpm build` keeps strict offline CSP in dist/. `pnpm test:hosted` runs the same gameplay, independent-session, persistence, export/replay, offline-loaded and visual workflows on the live ChatGPT Site. Console and page errors remain acceptance failures, including errors introduced by the host.

## Phase 2 acceptance

New organization tests and v3 year1/3/5 goldens supplement all 55 original assertions. Compensation and historical golden tests explicitly select v2; fixtures are never regenerated to repair historical failures. The new v3 golden baseline was established before release, with an explicit concern-episode calibration reason in its generator. A real v2 export was captured from the published 0.1.1 UI before v3 deployment.

Local offline preview now uses 127.0.0.1:4183 with reuseExistingServer=false: port4173 belonged to a different project, and tests must not silently reuse it. Hosted-equivalent preview is 4181. All original E2E assertions remain, plus desktop/mobile organization workflows. Shared Electron/packaged smoke now promotes and changes manager, verifies persisted organization state after actual process restart, then can continue. Browser plugin is absent; existing Playwright is used. Console/page errors remain failures. Installed Chrome lifecycle failures, if any, are distinguished from completed bundled-Chromium suites.

Benchmark defaults to newest v3, optional --v2 explicitly selects historical compensation behavior. --replay-stress performs an actual independent 1000-person replay. Phase2 outputs are isolated under docs/phase2/data and do not overwrite historical phase evidence. Performance inspection includes relationships, bounded memories, events and heap, as well as every previous integrity counter. All committed raw worlds are generated synthetic fixtures; personal QA material, traces and screenshots stay outside source.

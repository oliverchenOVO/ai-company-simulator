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

## Phase 2.5 validation

All original 72 tests remain. New retention diagnostics test real released v3 export preservation, long-lived warnings, gradual manager support, guarded combined moderate risk, causal departure, intervention resolution, completed-goal inertia and weekly counts against an independent daily trace. Current total: 82 tests. The captured hosted 0.2.0 fixture and all v1/v2/v3 goldens are immutable. App 0.2.1 changes explanations and tooling, not simulation rules.

`pnpm audit:retention`, `pnpm audit:retention:long` and `pnpm audit:retention:controlled` write separate synthetic evidence under docs/phase2_5/data. Full normal runs use 100 shared seeds; policies receive only CompanyView, never diagnostics. Weekly aligned developer traces measure observed evaluations and disclose six-day onset/resolution uncertainty; an independent daily test checks this instrument. Each final command history is independently replayed and restored. The original eight policies remain intact. Baseline performance is measured with `pnpm exec tsx scripts/benchmark.ts --out=docs/phase2_5/data/performance` and stress adds `--stress --replay-stress`.

Local Web/Electron now has 14 workflows; hosted-equivalent and production Google Chrome have 12. New controlled v3 import flows exercise actual career/manager warnings, recorded causes/history, promotion explanations, interventions, refresh and replay; another verifies actual v3 departure causes. Packaged Windows has two actual executable tests, including loading the released v3 save before intervention/restart/continued play/replay. Browser plugin is unavailable; Playwright is the recorded fallback. Human participants remain 0 and these checks do not replace the protocol in docs/phase2_5/HUMAN_PLAYTEST.md.

## Phase 2.6 Living Office

Current total: 99 tests; all prior 82 remain. `pnpm benchmark:office` records pure projection measurements. Office semantic boundaries, 17 local E2E cases, 15 hosted cases and the additional actual packaged Office restart are documented in [docs/living_office/TESTING.md](docs/living_office/TESTING.md). All world versions and goldens remain unchanged.

## Phase 2.6B genuine 3D

Current total: 112 unit tests /14 files, 27 local browser/development-Electron workflows, 25 hosted workflows, and three genuine packaged Windows tests. All prior assertions remain. See [release report](PHASE2_6B_REPORT.md) for source/environment provenance and [performance definitions](docs/living_office_3d/PERFORMANCE.md) for observational measurements.

`pnpm test:e2e` uses headless installed Chrome locally. Standard CI runs all 26 Web cases with headed installed Chrome under Xvfb on Ubuntu 24.04 using the SwANGLE driver; Windows runs the original development-Electron restart and three genuine packaged tests, plus all 112 unit tests. Repeated Windows runner browser stalls are documented, while actual production Chrome acceptance is independently run on Windows. CI retains all original 27 cases, the same real-canvas, raycast, full world/hash, replay, error and size assertions with ordinary 60-second case limits. Explicit headless software modes are reproducible independently:

```powershell
$env:FOUNDRY_OFFICE_QA_DIR = 'C:\path\to\isolated\software-webgl-evidence'
pnpm exec playwright test --config playwright.software.config.ts --output test-results/software-webgl
$env:FOUNDRY_SOFTWARE_MODE = 'driver'
$env:FOUNDRY_OFFICE_QA_DIR = 'C:\path\to\isolated\software-driver-evidence'
pnpm exec playwright test --config playwright.software.config.ts --output test-results/software-driver
Remove-Item Env:FOUNDRY_SOFTWARE_MODE
Remove-Item Env:FOUNDRY_OFFICE_QA_DIR
```

Default mode is `webgl` (SwiftShader WebGL fallback); `driver` uses Chromium's SwANGLE driver. Both select all 13 Office tests, all eight company sizes, actual DPR .75, and real graphics-failure coverage. Run browser/platform suites sequentially with distinct evidence directories. Do not treat interrupted shutdown, partial benchmark output or development Electron as packaged acceptance. No numerical FPS assertion substitutes for behavioral acceptance.

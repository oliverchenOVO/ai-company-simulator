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

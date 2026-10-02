# Phase 1 acceptance report — FOUNDRY 0.1.0

Date: 2026-10-03 (Asia/Taipei). Scope: Playable Startup / deterministic organization vertical slice. No Phase 2 simulation features or LLM integration were added.

## Implemented

Garage Startup starts at 2026-01-01 with NT$500,000, CEO/CTO/Engineer, no customers and Atlas prototype. Deterministic named RNG, UTC clock and explicit scheduler support employee skills/traits, stress/burnout/satisfaction/trust/exit intent, bounded memories, directed relationships, autonomous staged resignation, useful work, product priorities/milestones/launch, customer acquisition/revenue/churn, monthly salary/revenue accrual, runway and insolvency. Player commands cover hiring/firing/salary/team creation/moves/company strategy/product priority/time.

World state and command/event history are authoritative and hashable. Saves are versioned, validated SQLite on desktop and per-origin IndexedDB on web, with separate autosave/manual checkpoint, portable export/import and deterministic replay. Narration is template-only from actual events; private truth never appears in normal gameplay. The nine core screens are fully connected, with labeled controls, focus states, keyboard dialog close, loading/error feedback and small-screen layout. Browser calculation runs in a Worker; employee/customer/event tables paginate. Finance charts lazy-load.

## Executed validation

| Check | Observed result |
| --- | --- |
| Production build / Electron bundle | Passed |
| TypeScript strict typecheck | Passed |
| ESLint | Passed |
| Vitest | 34 tests, 5 files, all passed |
| Golden seed regression | 3 seeds × year1/3/5 hashes passed |
| Browser + Electron E2E | 7 tests passed; last run 37.1s |
| Browser export → Node replay | Identical SHA-256 |
| Refresh / independent sessions | Passed |
| Loaded web client offline decisions/replay | Passed |
| Desktop process restart + SQLite | Passed |
| Actual packaged Windows app | Passed creation/hiring/salary/save/restart workflow; app.isPackaged=true |
| Actual packaged startup smoke | Renderer loaded, process exit0 |
| Final portable packaging refresh | Completed; packaged E2E1/1 passed (52.9s total),97,551,727 bytes |
| GitHub Actions Windows validation and package | Both jobs passed: run37058085628 |
| ChatGPT Site publication | Published; production QA completed separately below |
| Production URL E2E | 5/5 passed (1.4m); complete gameplay flow has0 console/page errors |

The packaged E2E first launched while packaging output was being replaced and failed immediately. After output stabilized, the same workflow passed without weakening its assertions. Local checks are actual execution results; remote GitHub Actions results are tracked separately.

## Benchmarks

100 seeds × 1,826 days (five calendar years): latest run10,414ms. Crashes0, NaN0, Infinity0, corrupted states0, invariant violations0, independent replay mismatches0. Per-seed records and hashes: docs/benchmarks/seeds.json. Passive outcomes:97 bankrupt,3 survive; failure financially is an intended possible outcome. This suggests a demanding initial economy and requires later balance review with active-player sessions rather than automatic tuning.

1,000 employees × 3,652 days (ten calendar years), explicit capitalized stress configuration:93,605ms. Crashes0, NaN0, Infinity0, corrupted states0, invariant violations0. Full schema/round-trip checks passed; independent ten-year replay was not repeated. Details: docs/benchmarks/stress.json.

1,000-person browser test: navigation during simulation160ms; week+navigation+pagination617ms;25 visible employee rows and40 pages. Timings reflect this Windows machine under concurrent workload and are observational.

## UI QA evidence

Native reference1586×992 and mobile390×844 captured through Playwright/local Chrome. Browser plugin/browser skill unavailable; Playwright was used. Both generated reference and actual screenshots were inspected with view_image. Reference: docs/design/dashboard-concept.png; local evidence folder `C:\Users\oliver\.codex\artifacts\foundry-phase1-qa`.

Comparison ledger: navy rail/teal selected navigation matched; rail adjusted to252px and header/footer to70/86px; open four-column metric strip matched with actual simulation amounts; two-column product/team/pulse composition retained; outline icon metaphors corrected to home/mail/bar chart; initial employee identities and avatar colors retained; finance typography/spacing/dialogs use the same tokens; mobile horizontal navigation/stacked panels and persistent time controls checked. First-screen copy audited against the allowed list in docs/design/DESIGN.md. Intentional deviations: Traditional Chinese, contractual2026 date and CEO/CTO/Engineer roles, real metric/narrative content, removal of mockup-only phase progress, and responsive chrome. Functional fidelity was checked; no static screenshot serves as gameplay UI.

Production screenshot evidence: `C:\Users\oliver\.codex\artifacts\foundry-phase1-hosted-qa` (desktop dashboard, mobile dashboard/team, employee detail, monthly finance). Captured at1586×992 /390×844 with Playwright Chrome; final production desktop pixels were re-inspected after version2 publication and retained the same reference composition. Production acceptance exercises actual IndexedDB refresh/manual restore, isolated browser profiles, exported-save Node replay, decisions on all screens, loaded offline operation and keyboard/mobile interaction. All5 tests passed without changing the original console-error assertions.

## Git and technical issues

Private repository: https://github.com/oliverchenOVO/ai-company-simulator . Visibility verified PRIVATE before push. Commits so far:

- c0f8ee6 — workspace / deterministic primitives
- 605abfa — simulation, replay, regression seeds
- 4563f41 — validated persistence / durable sessions / projections
- 4e2ad0c — playable desktop/browser UI / E2E
- 8f8e53e — restored settings, large-company UI QA and packaged acceptance
- d708180 — ChatGPT Site configuration
- 8ca64d3 — isolated hosted CSP / production acceptance workflow
- ca4d67f — supported static output directory

Further focused commits add settings refresh, 1,000-person UI QA, packaged tests, CI, documentation and hosting metadata. Use `git log --oneline` for exact final IDs. No node_modules, build output, saves or credentials are committed. No public GitHub repository/release was created.

Resolved issues: pnpm11 build-script configuration differs from older onlyBuiltDependencies (explicit allowBuilds used); registry timeouts retried; sql.js export resets pragmas so target-slot log deletion is explicit; missing favicon fixed; selector targeting strengthened to semantic combobox roles; setting/replay UI remounts when the world revision changes. Build warnings about Zod comment annotations are dependency metadata and do not affect output. Electron-builder omits irrelevant platform-native Tailwind binaries; runtime does not use them. The portable app currently has the default Electron executable icon.

Sites local skill files advertised in the environment were missing after cache search. The available native Sites tool contract was used for source/version/access/deployment operations. Website: https://foundry-company-simulator.oliverchenovo.chatgpt.site . GitHub remains private. Windows CI evidence: https://github.com/oliverchenOVO/ai-company-simulator/actions/runs/37058085628 .

Initial production QA passed all gameplay/persistence checks but caught two CSP console errors from Cloudflare's dynamically injected protection scripts. A separate `pnpm build:site` output permits inline scripts only in the hosted CSP. The default offline/Electron build keeps `script-src 'self'`. No console errors are filtered out of the acceptance test. Hosted build output is ignored by Git; only source/configuration are committed.

Sites requires a supported static directory (`out` used). Production version2 is built from pushed source `ca4d67f49b25707709aa1b239dac536ca7cade55`, archive SHA-256 `199fa030240ed96ae1b02d08325265ca15ed0ebb59e3be3ec807af7ccb91d1d3`. Deployment succeeded. The final report commit only documents executed results; it does not change the deployed game. Remote CI for8ca64d3 passed both Windows jobs (run37059471574); ca4d67f CI was still running at this report's preparation. Private repository access and public website access are separate.

Automatic execution review rejected a recursive cleanup of the obsolete dist-site build directory; no reason beyond policy blocking was supplied. Kept that generated directory ignored instead, and used out/ for the accepted deployment. No source, tests or acceptance assertions were removed.

## Remaining scope and next steps

No authenticated account sync, cross-device cloud restore, multiplayer, financing, international subsidiaries, IPO, full Slack/email, 3D scenes or LLM. Each browser origin/profile has a separate local world; different people sharing one browser profile share that profile's save. Clearing browser data removes progress unless a portable backup was exported. Browser offline refresh without cached assets is not claimed; the desktop build is fully offline.

Next: player acceptance of decision clarity, difficulty and story causality; then plan Phase 2 explicitly. Avoid automatically changing golden fixtures or expanding simulation based only on passive bankruptcy statistics. Website publication exposes the same Phase 1 browser experience and does not create a second simulation authority.


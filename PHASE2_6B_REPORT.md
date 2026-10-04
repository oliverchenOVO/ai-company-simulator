# FOUNDRY — Phase 2.6B Living Office 3D release report

App **0.2.3** is deployed to the existing [FOUNDRY Site](https://foundry-company-simulator.oliverchenovo.chatgpt.site/), version **8**. Actual production Chrome **25/25**, genuine Windows packaged application **3/3**, and complete Linux browser CI **26/26** passed with clean exit. CI preserves Windows application coverage and moves the full browser suite to the proven Linux graphics environment. No Phase 3 work. Phase 2.5 human validation remains pending, **0 participants**.

## Completed

The primary desktop Office is a genuine React Three Fiber / Three.js architectural cutaway. CompanyView → existing OfficeProjection → pure metre-based scene adapter preserves the semantic bridge. Thick slabs/walls, an elevator core, executive timber/lounge/boardroom, four larger manager positions, staff clusters, volumetric furniture/props, restrained PBR finishes and selective soft shadows distinguish organizational hierarchy. The building dominates the page; constrained perspective, zoom/floor focus/reset and an actual contextual inspector keep it understandable.

A shared articulated human family varies skin, hair, clothing and accessories deterministically by employee ID. Idle, typing, walking, talking, presenting and reading are presentation states. Hires arrive from the elevator; departures leave actual vacant desks; observed promotions and manager changes use bounded corridor/elevator/document/meeting paths. Real public cues drive these sequences. Neutral gestures assert no invented praise, rejection, schedule or world outcome. Previous-placement history is bounded, resets for a new company and is excluded from saves.

Actual head raycasts, keyboard controls, employee search, selected nameplate/ring, reports/concern overlays and People/Teams/Timeline links use real data. Local geometry and labels require no external models, textures, fonts or HDRI. SVG remains a management-capable fallback for mobile, >100 people, manual simplified view and initial/context-loss WebGL failure. All individuals remain rendered up to 100; ambient walks stop above 40. Reduced motion holds final poses and uses demand rendering.

## Simulation and progress

Simulation/domain/narrative source has no diff from accepted 0.2.2 (`1cc4be2`). v1/v2/v3, compensation and retention remain authoritative; no v4 or LLM world loop. Save schema remains 2. Only app-version metadata changes. Fixed seeds, released fixtures, complete exported-world/hash comparisons and independent replay remain tested.

Browser progress persists per browser profile/origin; independent sessions and refresh recovery passed. Windows retains SQLite. Account service and cross-device synchronization are outside this Phase. Loaded assets work offline; first-ever offline loading is not claimed.

## Validation ledger

| Gate | Evidence |
|---|---|
| Typecheck / lint | passed |
| Unit tests | **112/112**, 14 files, all original 99 retained |
| Desktop/Electron build; hosted build | passed; lazy chunk advisory retained |
| Full local default Chrome + development Electron | **27/27**, source `ca17d51`, clean exit (5.6 min); predates post-frame pacing |
| Final hosted-equivalent Chrome | **25/25**, post-frame runtime, clean exit (7.9 min) |
| Actual production Chrome | **25/25**, Site v8, clean exit (7.1 min) |
| Controlled software WebGL fallback | **13/13**, final runtime, clean exit (6.0 min), all eight sizes |
| Controlled SwANGLE software driver | **13/13**, final runtime, clean exit (7.2 min), all eight sizes |
| Genuine Windows package | **3/3**, final source `3526e38`, private CI run `37165983060`, 16.4 sec; earlier `eb4ad79` also 3/3 |
| Seed benchmark | **100 seeds × 1,826 days: 24,024 ms** local / **1,867 ms** final Linux CI, all six integrity counters zero; all 100 final hashes agree across platforms |
| Deployed resource verification | **9/9** exact resource byte hashes match accepted stage |
| Complete Linux browser CI | **26/26**, run `37165695870`, source `f3cd232`, clean exit (2.8 min); lint/type/unit/benchmark/build also passed |
| Consolidated standard CI | **all jobs succeeded**, source `3526e38`, run `37165983060`: Linux Web **26/26** (4.1 min), Windows development Electron **1/1** (7.3 sec), genuine package **3/3** (16.4 sec), unit **112/112 on both platforms**, lint/type/benchmark/build passed |

No tests were removed, fixtures rewritten, outcomes hardcoded or acceptance timeouts enlarged. Each company size has an independent ordinary 60-second case and fresh context; complete aggregate data is emitted only if all eight succeed. Fault injection proves both initialization failure and actual context loss preserve world state and usable management. Normal paths require no console/page errors.

## Benchmarks and visual review

Raw data and definitions: [PERFORMANCE.md](docs/living_office_3d/PERFORMANCE.md). Production 30 people: scene ready **2,124 ms**, selection **253 ms**, week **204 ms**, navigation **196 ms**, JS heap **31.5 MB**, **667 draw calls / 84,840 triangles**. Production 100: **3,687 / 362 / 410 / 256 ms**, **53.6 MB**, **2,010 calls / 241,636 triangles**. 250/1,000 use focused SVG. Pure adapter plus pose median is .047 ms at 30 and .089 ms at 100, deterministic and non-mutating.

Frame observations sample 1.2-second startup/warm-up, not sustained FPS. Production 30/100 observed 97.3/199.5 ms intervals. Software 100 remains slower: WebGL-fallback selection/week 2,675/1,155 ms; driver 2,522/3,093 ms. Scheduling is one timer after completed draw, 33 ms normal /125 ms software; actual rendering can be slower. Software uses real detected DPR .75 and 1,024-square shadows, normal DPR 1–1.5 and 2,048-square shadows. No employees are dropped. Shared geometry, instanced furniture and smaller bevels reduced 30-person triangles approximately 42%. Optional lazy scene chunk is approximately 903 kB minified /245 kB gzip.

[VISUAL_ACCEPTANCE.md](docs/living_office_3d/VISUAL_ACCEPTANCE.md) records A–G: startup, 12 people, 30 people, overload, concern, promotion and vacancy, plus mobile/Windows. Final hosted-equivalent and actual production A–G were manually reviewed against previous SVG and existing architectural reference. The low-poly scene improves spatial richness and hierarchy; photorealistic concept parity and human retention acceptance are not claimed. Evidence: `C:\Users\oliver\.codex\artifacts\foundry-phase2-6b-qa\`.

## Release identity

- Deployed source: `66648b9b1ffdf353b229dc010fd46e3b6d11d1a8`. Subsequent test/config/docs commits do not change runtime bytes.
- Site version: `appgprj_6ac00cc0ca308191a1689834e149acb4~appgver_5a1946840988819195144233152a920a`.
- Deployment: `appgdep_6ac194601ea08191bb23083ec1b33989`, native status **succeeded**.
- Accepted archive: 1,792,000 bytes, 11 files including manifest; SHA256 `a1a80d1e792eb43d90e4c2973d13ed20958f51e49f00e7b7f969dad956ca3559`.
- Portable: `release/Foundry-Company-Simulator-0.2.3-Windows.exe`, 98,833,935 bytes, SHA256 `C7908B2F8141B7B47F3FACBE6CE55519C901C30A6FEC82325F4DAA873D9C2273`. Downloaded from final successful genuine package job, source `3526e38`, run `37165983060`. NotSigned, consistent with existing distribution policy.
- Private GitHub origin verified before pushing; no public source repository, force push or Site audience change. Existing version 7 remains the earlier 0.2.2 rollback release.

[Production assets](docs/living_office_3d/data/production-assets.json), [production browser measurements](docs/living_office_3d/data/browser-production.json), [final CI browser measurements](docs/living_office_3d/data/browser-ci-final.json), [package evidence](docs/living_office_3d/data/packaged-release.json) are checked into Git. [Native packaged graphics status](docs/living_office_3d/data/packaged-ci-gpu.json) reports software/unavailable hardware acceleration on the runner; actual WebGL draw/restart passed. Hardware GPU acceleration is not claimed by that evidence.

## Focused commits

| Commit | Change |
|---|---|
| `3f059e3` | renderer, visual target and asset architecture |
| `cb5af9a` | deterministic metre adapter and pose sampler |
| `c17a861` | local reusable assets and renderer dependencies |
| `de34c84` | real previous placement, corridor handoff, promotion |
| `79c72c5` | primary instanced cutaway, articulated people, selection |
| `e3eeb75` | geometry optimization, meeting continuity, benchmark, stable test workers |
| `f9d138e` | real raycast, manager changes, graphics failures, packaged canvas |
| `673043b` | 0.2.3 metadata |
| `4bdb44e` | real concern/vacancy captures and executable selection |
| `7954efa` | initial visual/platform ledger |
| `e61d949` | elapsed diagnostics, demand rendering and software budget |
| `ff2941d` | manager draft transaction guard and original test synchronization |
| `d87fdf9` | face workstations, readable labels, typing arms, printer waypoint |
| `ca17d51` | persist real software DPR; eight independent benchmark cases |
| `eb4ad79` | post-frame pacing instead of accumulating interval |
| `66648b9` | final paced local/hosted evidence |
| `cc51445` | explicit SwANGLE driver investigation |
| `a5569a6` | normal headed Windows Chrome compositor; preserve all tests |
| `f3cd232` | complete cross-platform browser investigation |
| `3526e38` | split standard CI into complete Web and Windows application coverage; reproducible software configuration |

## Technical issues and remaining work

Windows fork-worker shutdown/memory pressure was resolved using two Vitest threads, retaining all assertions and case limits. An incorrect Canvas fallback effect was replaced by static fallback content, a graphics boundary and actual context-loss handling. Continuous paths remove promotion jumps/table overlap. Software DPR now survives React updates. Manager drafts cannot change during an in-flight transaction.

The F: electron-builder output encountered EPERM; an isolated short C: build succeeded and clean standard Windows CI packaged the actual release. This workstation's local package repeat stalled at process shutdown, even when initial actions and native renderer loading succeeded. A window-close alternative was tried and reverted; forced termination is not counted as acceptance. CI package restart/replay/actual WebGL passed. The local shutdown cause remains unresolved.

Private Windows software-rendering CI repeatedly stalled input/downloads and protocol sessions despite clean local software, hosted and production passes. Forced-driver run `37163396683` passed 18/27 and failed nine workflows. Normal headed Windows Chrome run `37164971276` passed 20/27 and failed seven; both genuine package jobs succeeded. Neither browser run is accepted. Trace evidence includes 13-second node queries and 23-second screenshots. Root OS/driver cause is not proven.

Isolation on Ubuntu 24.04, headed real Chrome under Xvfb with the SwANGLE driver, passed the **complete 26/26 Web suite**, all eight sizes, actual DPR .75, genuine raycast, complete world/replay/hash and console/error checks in **2.8 minutes**. Standard CI therefore runs all Web cases on that platform and the original development-Electron restart plus all three genuine packaged tests on Windows; Windows also runs all 112 unit tests. All original 27 cases remain across jobs. No timeout, visual fidelity, world outcome or assertion was relaxed. Actual production acceptance was separately run in real Windows Chrome. Repeated Windows CI browser limitations remain disclosed, rather than relabeled as passing.

Sites' Windows Bash packaging path failed. Publication recovered with a hidden-stdin credential helper, exact pushed-source verification and native tar of a fresh accepted stage, then native Sites save/deploy. Old unreferenced root out files were excluded. No credentials were stored in Git or logs.

Human Phase 2.5 validation still needs 3–5 independent players and anonymized sessions. The diagnostic/test package is available. Collect that evidence and calibrate retention before proposing another large Phase. No Phase 3 expansion.

# FOUNDRY — Phase 2.6C acceptance report

Status: visual/functional candidate implemented; final software-renderer, Windows packaged and production deployment verification in progress. No next Phase has started.

App candidate 0.2.4; simulation v1/v2/v3 and save schema 2 remain unchanged. The authoritative simulation/domain/narrative have no diff from the Phase 2.6B baseline. No LLM, RNG call, world command or animation state enters the core loop or save.

## Completed implementation

- Executive timber, fabric lounge, wall slats and warm accents; slate management planning rooms; brighter practical staff workstations. Shared PBR material families, tiny deterministic local grain/cloth textures, metal/glass details, bounded lights and batched contact shading.
- Stable ID-derived founder/generic character styling in 3D and portraits; articulated seated work, distance-driven gait, smoothed turning, subtle selected-person glance, real hire screen wake, quiet promotion emphasis and dark vacancies.
- Bounded real-event meetings and document handoffs using actual active related employees/current manager. Participant reservation, shared cue clocks, explicit chairs and routes around tables/capacity desks, return and reduced-motion behavior.
- Camera initializes before its first ready frame, fits real cutaway geometry, synchronizes aspect after inspector resize and supports actual floor focus/reset. Off-floor wires are omitted in focused rooms. Mobile/manual/lost/unavailable WebGL and >100-person SVG strategies remain.
- Fresh A–I screenshots, source design reference, baseline audit, art direction, choreography contract and visual comparison.

## Validation already executed

- `pnpm build`: production Vite + strict TypeScript + Electron bundles passed.
- `pnpm lint`: passed.
- `pnpm test`: 119/119, including all original 112 and seven new pure identity/eligibility/nonmutation/save/replay/path tests.
- Actual installed Chrome Office suite: 15/15 on the polished candidate, including real GPU draws, raycast/keyboard selection, hire screen wake, promotion, meeting/handoff participants and return, departure, save/refresh/exact replay, context loss and mobile. Zero asserted console/page errors.
- 100 seeds × 1,826 days: 3,956 ms; crashes, NaN, infinity, corrupt states, invariant violations and replay mismatches all zero. Raw data is under `docs/living_office_3d_polish/data/polish-seeds`.
- 30-person local Chrome: scene initialization 802 ms, selection 150 ms, week 126 ms, navigation 165 ms, 708 draw calls. 100-person: 931 / 254 / 236 / 186 ms, 2,121 calls. These are one-run observations, not fixed gates or steady-state FPS.

## Evidence

[Baseline review](docs/living_office_3d_polish/BASELINE_REVIEW.md), [art direction](docs/living_office_3d_polish/ART_DIRECTION.md), [choreography](docs/living_office_3d_polish/CHOREOGRAPHY.md), [A–I visual comparison](docs/living_office_3d_polish/VISUAL_COMPARISON.md). Final production/package/performance results will be added after their actual execution.

## Technical issues and pending work

C: had less than 1 GB free and an earlier browser run failed with ENOSPC while writing screenshots/traces, plus an initial navigation abort. Evidence is retained. QA output and process-local TEMP/TMP moved to F:; fresh complete Chrome verification then passed. No user files were deleted and no tests or deadlines were relaxed.

Previously observed local Electron `app.close()` stalls remain an open environmental limitation until a fresh packaged run proves its own lifecycle. Windows CI must still validate the actual executable, vignette, save, restart, continue and replay before release is declared accepted.

The Three scene remains a lazily loaded ~913 kB chunk; the existing size warning is not suppressed. Low-poly style remains deliberate, with small faces in full-building views. 100-person detail uses floor focus/search. Phase 2.5 human feedback remains at zero independent participants; no retention calibration or balance claim is made.

## Next actions within this Phase

Finish both software modes, verify the private-repository Windows package and full Web CI, publish the accepted build to the existing Site, verify exact hosted assets and independent refresh/offline/replay workflows, then finalize this report and commits. After that, human playtesting can inform the already-pending Phase 2.5 gate; do not automatically begin Phase 3.

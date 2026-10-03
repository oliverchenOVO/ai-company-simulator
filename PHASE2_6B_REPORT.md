# FOUNDRY — Phase 2.6B Living Office 3D

App **0.2.3**. Local implementation and hosted-equivalent acceptance passed. A packaged candidate passed; the final responsiveness revision is being repackaged and production release evidence is appended after its actual run; this document does not substitute for those gates. No Phase 3 work. **Phase 2.5 human validation remains pending (0 participants).**

## Completed implementation

Primary desktop Office is genuine React Three Fiber / Three.js, using CompanyView → unchanged OfficeProjection → pure metre-based scene adapter. Cutaway slabs, thick walls, teal/metal elevator, executive timber/lounge/boardroom, manager planning area and larger desks, staff desk clusters, local volumetric props and selective soft shadows replace the previous primary diagram. Compact controls, constrained perspective/zoom/floor focus/reset and a real contextual inspector make the office the main content.

One shared articulated low-poly human family has deterministic employee-ID skin, hair, clothing, glasses and accessories. Idle, typing, walking, talking, presenting and document reading use presentation clocks and refs. Actual public cues drive hires, departures, observed floor transfers, manager document handoffs and bounded promotion meetings. Corridor waypoints and hide/appear elevator transfers assert no invented schedule, praise, rejection or simulation outcome. One existing colleague may accompany a real promotion and walks back to work. Local previous-placement history is bounded and clears for a new company; it is excluded from saves.

Search, actual 3D-head raycast, external keyboard buttons, selection ring/nameplate, management/concern overlays and People/Teams/Timeline links use real game data. SVG stays available for mobile, companies above 100, manual simplified mode and initial WebGL/context-loss failure. Management remains usable in every branch. Reduced motion holds final poses and uses demand rendering. All runtime geometry and labels ship locally, with no third-party asset licensing ambiguity or external model/texture requests.

## Simulation and persistence boundary

Simulation/domain/narrative source has no diff from accepted 0.2.2. v1/v2/v3 remain authoritative, retention/compensation rules unchanged, no v4 and no LLM in the world loop. Only persistence APP_VERSION metadata changes; save schema remains 2. Fixed seeds, released fixtures, independent replay and exported state hashes remain valid. Browser presentation interactions compare the entire exported world before/after, not just a subset.

Browser progress remains local to each browser profile/origin; independent contexts and refresh recovery are tested. Packaged Windows uses its existing SQLite database. This iteration adds no account service or cross-device sync. Freshly loaded runtime assets continue offline; first-ever offline loading is not claimed.

## Validation

| Gate | Result |
|---|---|
| TypeScript / ESLint | passed |
| Original + new unit tests | **112 / 112**, 14 files; original 99 retained |
| Desktop build + Electron bundle | passed |
| Hosted build | passed |
| Local full Web + development Electron | **27 / 27**, final default Chrome/development-Electron suite |
| Hosted-equivalent real Chrome | **25 / 25**, final post-frame runtime, clean exit (7.9 minutes) |
| Actual packaged Windows | final post-frame source `eb4ad79`: standard Windows CI package job passed; local repeat shutdown limitation documented below |
| Actual production Chrome | awaiting deployment and actual run |
| 100 seeds × 1,826 days | **24,024 ms**, all six integrity counters zero |

No tests were removed, standards lowered, golden fixtures rewritten or results hardcoded. The new initial-WebGL fault injection retains full world/hash comparison and continued management checks. Normal workflows require no console/page errors; intentional graphics-failure diagnostics are isolated.

## Benchmarks and visual acceptance

[PERFORMANCE.md](docs/living_office_3d/PERFORMANCE.md) records all 3/12/30/40/60/100/250/1,000 measurements, initialization, search/selection, week advancement, navigation, JS heap, actual draw calls/triangles and approximate frame intervals. On the local final runtime, 30 people initialized in 1,947 ms, selected in 220 ms, advanced a week in 149 ms, with 84,840 triangles and an observed 100.8 ms warm-up frame interval. 100 people: 3,408 / 367 / 362 ms, 241,636 triangles and 190.1 ms interval. Normal motion targets roughly 30 Hz demand rendering; these intervals include startup, not steady FPS. Hosted-equivalent and production observations are recorded separately after their final acceptance.

The pure adapter plus one frame sample median is .047 ms at 30 and .089 ms at 100; all placements deterministic and hashes unchanged. Lazy 3D chunk approximately 903 kB minified / 245 kB gzip. Shared geometry/materials, instanced static furniture, smaller bevels/leaves and selective shadows reduced 30-person triangles by approximately 42%. 41–100 retains individual characters with ambient walking disabled; >100 uses focused fallback. Numerical FPS is not a brittle CI threshold.

[VISUAL_ACCEPTANCE.md](docs/living_office_3d/VISUAL_ACCEPTANCE.md) contains A–G screenshot scenes and the comparison ledger against the previous SVG and existing architectural reference. Evidence remains outside Git under `C:\Users\oliver\.codex\artifacts\foundry-phase2-6b-qa\`. The actual low-poly scene clearly improves depth, room hierarchy and office presence; it does not claim photorealistic parity with concept art. Human retention feedback is not fabricated or inferred from these screenshots.

## Focused commits

- `3f059e3` — renderer, asset architecture and visual target.
- `cb5af9a` — deterministic metre adapter and motion sampler.
- `c17a861` — reusable local room assets and renderer dependencies.
- `de34c84` — observed placement history, corridor handoffs and promotions.
- `79c72c5` — primary instanced cutaway, articulated people and interactions.
- `e3eeb75` — geometry optimization, continuous meeting choreography, benchmark data and stable test workers.
- `f9d138e` — actual raycast/manager changes, both graphics failure paths and packaged canvas checks.
- `673043b` — 0.2.3 version metadata and Phase 2.6B labels.
- `4bdb44e` — inspect actual concern/vacancy screenshots and permit a selected packaged executable path.
- `7954efa` — visual review and first packaged/hosted-equivalent evidence.
- `e61d949` — elapsed-time telemetry, demand render budget, software quality and explicit CI WebGL.
- `ff2941d` — preserve manager drafts while team transactions complete.

The existing GitHub origin was explicitly verified private before pushing. No public source repository, force push or audience change. Release source and deployment identifiers are recorded after publication; a final documentation-only commit may follow without changing runtime bytes.

## Technical issues and limits

- Windows Node fork workers intermittently exceeded memory/worker shutdown limits under host load. Vitest now uses two threads; all 112 assertions and existing 60-second case limits remain. Clean final gates passed. A browser teardown stall and one aborted navigation were investigated; subsequent normal retained-trace full runs passed. These were not counted as successful runs until a clean exit.
- Canvas HTML fallback content mounts even when WebGL works; an effect in that content incorrectly switched renderer. It was replaced with static fallback content, a React graphics boundary and an actual context-loss handler. Both initial unavailability and context loss now have behavioral coverage.
- Three/R3F produces a large optional lazy chunk, and 100 animated individuals cost substantially more than 30. Chunk warnings remain visible. Additional authored assets, advanced AO/postprocessing and 1,000 fully animated people were intentionally outside scope.
- Prior animation staging could overlap a meeting tabletop or jump on a cross-floor promotion. Separate chair/presenter anchors and continuous bounded 8–18 second meeting paths fix it without changing world time.
- Local electron-builder hit EPERM when renaming unpacked output on the F: workspace, including a fresh subdirectory. The same build succeeded through extraction in an independent short C: artifact path; no unrelated process was killed and no dependency or validation standard was changed. The test executable is selectable through FOUNDRY_PACKAGED_EXECUTABLE, retaining the existing default for clean CI.
- Production publication uses the existing Sites hosting workflow; any actual hosting packaging failure and recovery will be recorded with the release evidence.

## Remaining work and next step

Finish the actual production gate for this release. Human Phase 2.5 validation remains blocked on real 3–5 independent players; the existing diagnostics/test package remains available. Next recommended work is that human playtest and retention calibration using actual anonymized sessions, before proposing another large Phase. No autonomous Phase 3 expansion.

## Software-renderer regression investigation

Private CI run 37155774070 passed lint/typecheck/unit/benchmark/build and packaged Windows, but WebGL browser input stalled and one original mobile manager test missed its requested assignment. This failed run is not counted as acceptance. A superseded repeat (37156403176) was cancelled. Controlled local SwiftShader reproduced stale completion telemetry; elapsed-time publishing, 30 Hz rendering and explicit CI software WebGL resolve the observed cases. The manager form now disables draft changes during a transaction, and the original test additionally waits for the actual Delivery heading and completed transaction before assigning a manager. No assertion or timeout was weakened. Normal full suite: 20/20; controlled software Office/organization suite: 8/8 before the final software-only pixel/shadow budget.

The original out directory retained unreferenced historical assets. Publication uses a fresh short-path staging directory; its exact contents receive hosted-equivalent Chrome acceptance and asset-byte verification. The bundled Sites Bash script fails to resolve its Windows path, so a hidden-stdin credential helper verifies the pushed source SHA and native tar packages only the manifest and fresh output. Native Sites save/deploy remains the publication path. Credentials are never committed or logged.

## Final independent benchmark gate

CI run 37157792009 passed 19/20 browser cases and packaged Windows; its single aggregate eight-size benchmark exceeded the shared 180-second case budget. All eight sizes now run in independent fresh contexts, retaining every selection/week/navigation/count/error assertion and the original 60-second ordinary-case and per-action limits. Complete JSON is emitted only after all eight succeed. A controlled run exposed React resetting software DPR through the Canvas prop; the DPR prop now follows detected graphics capability, current telemetry follows the real renderer ratio, and explicit software runs assert 0.75. This is a quality-policy fix, not a simulated measurement. Final clean repeats are recorded below when complete.

Seated figures face their workstations, typing arms reach desk height, selected labels remain readable during body turns, and the printer waypoint stops in front of the cabinet. Commit d87fdf9 contains those presentation fixes.

Final correction commit `ca17d51` passed lint/typecheck, 112 unit tests, desktop/Electron build and complete 27-case local E2E with a clean exit. Controlled software cases verified actual 0.75 DPR, but those interrupted teardown runs remain diagnostic evidence only.

## Post-frame pacing verification

`eb4ad79` replaces accumulating invalidation intervals with one timer scheduled after the actual draw (33 ms normal, 125 ms detected software). Typecheck, lint, 112 unit tests, desktop/Electron build and controlled software Office **13/13 with clean exit (6.0 minutes)** passed. Every employee, raycast, replay/hash, fallback and size assertion remains. Software 100-person selection/week measured 2,675/1,155 ms; limitations remain explicit. CI ca17d51 failed 8/27 software cases, so its browser gate is not accepted; its genuine Windows package job passed **3/3 in 23.2 seconds**. The new source receives separate release verification.

Local final-package attempts stalled at shutdown under this workstation (including a native smoke that loaded the renderer but missed its 30-second process-exit probe); a native-window-close test alternative was tried and fully reverted. No forced close or relaxed assertions were adopted as passing acceptance. Package evidence from the clean standard Windows CI is labeled by source and environment.

Final post-frame hosted-equivalent Chrome: **25/25 with clean exit (7.9 minutes)**. A–G final scenes were manually inspected against the earlier SVG and architectural reference. Windows CI source `eb4ad79` package job `111316867646` succeeded; its portable artifact was downloaded from run `37161889412`. The run browser job remains pending at this source-preparation snapshot and is not claimed green.

# Performance and acceptance — Phase 2.6C

Measurements are observed runs, not fixed timing gates. Each company size uses an independent page and deterministic fixture. Scene initialization, search/selection, advancing a week and navigation are timed separately. `approximateFrameMs` includes initialization and a short warm-up; it is not steady-state FPS. Browser heap measures JavaScript only, not total process RAM or VRAM.

## Local installed Chrome

Windows, 1586 × 992, normal compositor, 15/15 Office workflows passed. [Raw measurements](data/chrome-browser.json).

| Employees | Scene ms | Selection ms | Week ms | Navigation ms | Draw calls |
|---:|---:|---:|---:|---:|---:|
| 3 | 635 | 104 | 77 | 105 | 158 |
| 12 | 805 | 89 | 63 | 82 | 344 |
| 30 | 802 | 150 | 126 | 165 | 708 |
| 40 | 983 | 498 | 222 | 210 | 907 |
| 60 | 804 | 157 | 138 | 107 | 1311 |
| 100 | 931 | 254 | 236 | 186 | 2121 |
| 250 (SVG) | 386 | 74 | 204 | 103 | — |
| 1000 (SVG) | 404 | 170 | 502 | 161 | — |

30-person heap was 28.4 MB; 100-person heap 51.8 MB. All 100 individuals remain accessible in 3D. Larger companies use the existing bounded SVG floor strategy.

## Software rasterizers

Both explicit SwiftShader modes passed all 15 Office tests without retries or larger deadlines. They retain actual 3D characters, DPR .75 and selective shadows. Initial evidence before the final input-gap adjustment: [WebGL fallback](data/software-webgl-browser.json), [driver mode](data/software-driver-browser.json). WebGL fallback 30-person scene/selection/week/navigation: 2497/1479/267/215 ms; 100-person: 3939/3107/1109/287 ms. Driver mode 100-person: 2414/1030/410/2456 ms. This variability and multi-second input latency are real limitations, not GPU frame-rate claims.

The final driver rerun passed 15/15, founders workflow 46.9 seconds within its original 60-second limit. The software scheduler now leaves a 250 ms gap after each actual draw; only one timer is outstanding. Animation uses elapsed renderer time, so event duration, participants and outcomes stay unchanged. Hardware rendering retains its 30 Hz scheduling target; reduced motion does not run the recurring timer.

## Build and deterministic benchmark

Strict TypeScript/build, lint and 119 tests passed, retaining all original 112 tests. The lazy Three scene is approximately 912.6 kB / 248.2 kB gzip, versus baseline 903.3 / 245.3 kB. The existing size warning remains visible. Local textures are shared tiny deterministic canvas textures; there are no remote asset dependencies or additional world state.

100 seeds × 1826 simulated days: the initial polished run took 3956 ms; the input-gap rerun took 3217 ms. Six counters (crashes, NaN, infinity, corrupted states, invariant violations, replay mismatches) were all zero. Hardware load differs between runs; timing alone is not a balance or retention result. [Raw seed evidence](data/polish-seeds/seeds.json).

## CI, native package and production

Early private run 37184697674 passed Windows build, development Electron and all three actual packaged tests (version 0.2.4, `isPackaged: true`), including real handoff, week advance, save, normal close, restart, continue and exact replay. Linux Web passed 27/28; the founders workflow exhausted its aggregate 60-second budget near the final export. That failed trace is retained outside the repository. Fresh complete CI acceptance after the scheduler, camera-readiness and persistent-placement checks passed before production release, as recorded below.

Final private CI [37185671035](https://github.com/oliverchenOVO/ai-company-simulator/actions/runs/37185671035) succeeded on runtime source `2ed2936`: strict build/typecheck/lint, 119 tests, 100-seed benchmark (2621 ms, all six counters zero), all 28 Web tests (4.6 minutes), desktop 1/1 and packaged 3/3 (41.1 seconds). Raw [CI browser](data/ci-browser.json), [seed benchmark](data/ci-seeds.json) and [packaged GPU](data/packaged-gpu.json) evidence are retained. The final source `0096e16` adds documentation/captured evidence only and its full CI also succeeded. No tests were removed and no deadlines changed: persistent promoted placement is now checked after reload, while the dedicated meeting test still verifies approach, synchronized seated activity and actual return.

The final WebGL software rerun passed 15/15 (3.7 minutes), including camera readiness and manual SVG → 3D restoration. Its 30-person scene/selection/week/navigation were 3606/618/240/174 ms; 100-person 3663/1163/308/179 ms. [Raw final WebGL measurements](data/software-webgl-final.json). The final driver run passed 15/15 (3.6 minutes), with 100-person 2398/1168/733/309 ms. [Raw final driver measurements](data/software-driver-final.json). CI separately covered that driver mode on Linux with the final camera/test changes.

Actual Windows CI portable artifact was downloaded and extracted locally, then the same three packaged tests passed here (45.7 seconds). `isPackaged: true`, app 0.2.4 and enabled native WebGL were checked. Selection, actual Carol → Bob handoff/review/return, advance, SQLite save, normal `app.close()`, restart, continue offline and replay passed without forced termination. [Native local GPU record](data/packaged-local-gpu.json), [actual handoff](screenshots/packaged-local-handoff.png). The executable is unsigned; its SHA-256 and exact runtime source are in [release metadata](data/release.json).

Site version 9 deployed successfully from `0096e16` to the existing public URL. All nine served assets match the fresh accepted output byte for byte, including scene and simulation worker. [Asset SHA-256 evidence](data/production-assets.json). The bundled Sites source/build workflow succeeded; its Windows Bash packaging path failed, so native tar packaged a fresh output directory (11 files), avoiding historical unreferenced output assets. No credentials are stored. Completed production interaction results follow below.

Detached Office projection, 100 repetitions per size: 100 employees median .061 / p95 .135 ms; 1000 employees .424 / 1.088 ms. Every fixture's simulation hash stayed unchanged. This is projection-only, not rendering: [raw measurements](data/projection.json).

## Actual production acceptance

The existing HTTPS Site was tested with installed Windows Chrome at 1586 × 992 (mobile 390 × 844), 27/27 passed in 5.3 minutes. This includes independent browser sessions, refresh persistence, loaded-client offline decisions, compensation/v2 compatibility, v3 career/manager interventions, exact replay, every Office scenario, manual fallback, WebGL loss/unavailability and both synchronized vignettes. Office tests assert no console/page errors. All production A–I plus mobile/100-person screenshots were manually inspected and now replace the candidate captures in the comparison document.

| Employees | Scene ms | Selection ms | Week ms | Navigation ms | JS heap MB | Renderer |
|---:|---:|---:|---:|---:|---:|---|
| 3 | 1311 | 185 | 117 | 167 | 19.5 | 3D |
| 12 | 1266 | 229 | 167 | 177 | 27.2 | 3D |
| 30 | 1377 | 188 | 136 | 164 | 27.6 | 3D |
| 40 | 1364 | 284 | 207 | 274 | 31.3 | 3D |
| 60 | 1292 | 279 | 234 | 230 | 55.2 | 3D |
| 100 | 2059 | 642 | 337 | 211 | 52.8 | 3D |
| 250 | 474 | 181 | 818 | 351 | 20.9 | SVG |
| 1000 | 596 | 321 | 1099 | 275 | 41.1 | SVG |

[Raw production measurements](data/production-browser.json). Network initial loading was separately recorded and varies; these scene values start after importing the fixture. The 30-person warm-up frame estimate was 67.4 ms; 100-person 119.9 ms. These are not steady-state FPS. Nine deployed files matched local bytes; hosting-injected HTML was checked for the accepted entry asset references.

Progress isolation is per browser profile/storage, with refresh persistence. This Phase does not add accounts or cross-device cloud synchronization. Clearing browser storage removes that browser's save unless exported first.

## Environmental and visual limits

C: had less than 1 GB free; an earlier run hit ENOSPC while writing traces/screenshots. QA output and process-local TEMP/TMP now use F:. No user files were deleted. The previously observed local Electron `app.close()` stall did not recur in this actual local packaged run; normal close/restart was independently proven here, without claiming the old failure's universal root cause is resolved.

Full 100-person architecture makes faces small; floor focus and search provide detail, and manual SVG remains available. The generated concept is substantially more detailed than the delivered low-poly assets. Shared materials, selective lights, instanced static furniture and bounded event participants preserve the existing strategy. No simulation/domain/narrative logic, schema 2 or v1/v2/v3 replay semantics changed.

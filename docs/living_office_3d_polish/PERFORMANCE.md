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

Private run 37184697674 passed Windows build, development Electron and all three actual packaged tests (version 0.2.4, `isPackaged: true`), including real handoff, week advance, save, normal close, restart, continue and exact replay. Linux Web passed 27/28; the founders workflow exhausted its aggregate 60-second budget near the final export. That failed trace is retained outside the repository. The final input-gap and camera-readiness changes require a fresh complete CI acceptance before production release.

Final CI and production measurements will be appended after execution. The old website is not counted as acceptance of 0.2.4.

## Environmental and visual limits

C: had less than 1 GB free; an earlier run hit ENOSPC while writing traces/screenshots. QA output and process-local TEMP/TMP now use F:. No user files were deleted. A previous local Electron `app.close()` stall is not assumed fixed because Windows CI passes: this machine needs separate proof.

Full 100-person architecture makes faces small; floor focus and search provide detail, and manual SVG remains available. The generated concept is substantially more detailed than the delivered low-poly assets. Shared materials, selective lights, instanced static furniture and bounded event participants preserve the existing strategy. No simulation/domain/narrative logic, schema 2 or v1/v2/v3 replay semantics changed.

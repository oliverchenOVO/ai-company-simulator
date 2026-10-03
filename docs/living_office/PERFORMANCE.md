# Living Office performance

Local hosted-equivalent Google Chrome, 1586×992, Windows, same application build, six capitalized synthetic worlds. Normal product target 3–100. Numbers are observations, not a fragile FPS gate; CPU/background workload and browser cache affect timing. Cold page/create flow 400 ms. Scene time is Office navigation through meaningful content plus two animation frames; save import/validation/replay is timed separately. Week includes worker execution, persistence and refreshed UI. Navigation is People → Office. Browser heap is Chromium usedJSHeapSize, process-wide and affected by garbage collection, not retained feature memory or peak memory.

| Employees | Import ms | Scene ms | Week ms | Navigation ms | Browser heap MiB | Drawn characters |
|---|---:|---:|---:|---:|---:|---:|
| 3 | 100 | 418 | 81 | 132 | 5.7 | 3 |
| 12 | 106 | 112 | 79 | 148 | 7.2 | 12 |
| 40 | 136 | 98 | 76 | 127 | 12.9 | 40 |
| 100 | 128 | 170 | 155 | 216 | 21.4 | 100 |
| 250 | 282 | 75 | 239 | 107 | 21.1 | 1 |
| 1000 | 1299 | 96 | 701 | 197 | 32.7 | 1 |

Up to 100: all employees have individual vector seats. Larger tiers draw the focused floor only (1–8 positions); every other floor still shows actual counts and remains selectable, every person remains in the complete pure projection/search. No invisible employee is treated as absent from company truth. No future authoritative cohort system was introduced. CSS animations are disabled beyond normal range, mobile and reduced motion. Floor compression limits visual density; all normal-range scenes are navigable. SVG has no Three.js draw-call counter or WebGL requirement. No per-frame React reconciliation.

Pure projection median / p95 (100 repetitions): 3 people 0.013 / 0.045 ms; 100 people 0.124 / 2.119 ms; 1000 people 0.871 / 17.917 ms. Measured Node ending heap 15.1–36.5 MiB includes the simulation and temporary test allocations. All projection worlds keep their exact authoritative hash. Raw results: data/projection.json and data/browser-hosted-local.json.

100-seed × five-year authoritative baseline including independent replay: 10082 ms; crashes, NaN, infinity, corruption, invariant violations and replay mismatches all zero (data/seeds.json). Historical v1/v2/v3 goldens are unchanged. Phase 2.5's 1000-person ten-year result is historical evidence, not rerun or claimed as new here; this presentation-only phase measures its new view at 1000 and week advancement instead.

Lazy Office JS 20.78 kB / gzip 7.83 kB, scoped CSS 7.72 / gzip 2.26 kB. Existing application initially loads without the Office renderer. No new runtime packages, GPU resources, remote asset requests or ongoing timers. The SVG normal-range scene contains repeated primitives; sophisticated rigs, shadows and free orbit are intentionally absent. A future renderer should preserve semantic projection and benchmark these same flows before adding detail.

## Actual production Chrome

Same deployed 0.2.2 code, 1586×992, full 15-case suite passed. Initial page/create flow 1315 ms includes network. No controlled performance-regression claim versus local runs; different network/cache/background load. Raw data/browser-production.json is synthetic measurement evidence.

| Employees | Scene ms | Week ms | Navigation ms | Browser heap MiB | Drawn characters |
|---|---:|---:|---:|---:|---:|
| 3 | 469 | 97 | 140 | 12.5 | 3 |
| 12 | 116 | 87 | 150 | 11.9 | 12 |
| 40 | 143 | 180 | 287 | 8.7 | 40 |
| 100 | 286 | 694 | 344 | 22.6 | 100 |
| 250 | 93 | 234 | 138 | 33.1 | 1 |
| 1000 | 152 | 872 | 247 | 37.3 | 1 |

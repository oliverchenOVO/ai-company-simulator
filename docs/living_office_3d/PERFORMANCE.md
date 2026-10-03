# Living Office 3D performance

App 0.2.3; Windows / Node 24.13 / installed Chrome. Measurements are observations on this workstation under normal desktop load, not hardware-independent CI FPS guarantees. Raw local measurements: [browser-local.json](data/browser-local.json). Pure adapter and pose sampling: [scene-projection.json](data/scene-projection.json). Existing semantic projection and independent 100-seed/5-year integrity run: [semantic-projection.json](data/semantic-projection.json), [seeds.json](data/seeds.json).

| People | Renderer | Scene ready ms | Select ms | Week ms | Navigate ms | JS heap MB | Mean frame interval ms | Draw calls | Triangles |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 3D | 803 | 217 | 137 | 184 | 20.0 | 7.3 | 144 | 28,198 |
| 12 | 3D | 380 | 206 | 185 | 168 | 31.3 | 6.9 | 321 | 47,136 |
| 30 | 3D | 1,173 | 291 | 183 | 221 | 45.5 | 14.0 | 667 | 84,840 |
| 40 | 3D | 1,285 | 361 | 293 | 244 | 41.1 | 16.1 | 856 | 104,608 |
| 60 | 3D | 1,606 | 400 | 237 | 249 | 42.7 | 22.6 | 1,240 | 153,120 |
| 100 | 3D | 2,489 | 568 | 336 | 335 | 70.2 | 55.8 | 2,010 | 241,636 |
| 250 | Focus SVG | 103 | 120 | 291 | 170 | 102.3 | — | — | — |
| 1,000 | Focus SVG | 174 | 265 | 832 | 254 | 43.9 | — | — | — |

Scene readiness requires a real WebGL draw, not just an inserted canvas. Selection includes search, click and inspector assertion. Import/deserialization is recorded separately. First company load was 674 ms. Frame intervals are sampled for approximately 1.2 seconds immediately after scene initialization; they include warm-up and compositor pacing, and are not sustained FPS. Heap is Chrome's JS heap, not total process RAM or VRAM; GC explains non-monotonic values. Draw statistics are the first ready frame after navigation, excluding the shadow pass. Selection/raycast, reduced motion and graphics failure are behavioral gates; numerical timings are reported without brittle FPS assertions.

Pure adapter plus one pose sample per employee, median/p95 ms: 3 .006/.033; 12 .009/.030; 30 .020/.074; 60 .025/.064; 100 .046/.123; 250 .109/.232; 1,000 .220/.458. Every repetition reconstructed the same base placement and kept the world hash unchanged. The 100-seed/1,826-day run took 24,024 ms with zero crashes, NaN, infinity, corrupt states, invariant violations or independent replay mismatches.

The lazy OfficeScene chunk is approximately 902 kB minified / 245 kB gzip, primarily Three.js and R3F. It loads only when desktop Office needs 3D. No remote models, textures, fonts or HDRI. Local generated labels are at most 512×128. Root assets, worker and finance chart remain separate chunks. The Vite 500 kB chunk advisory remains visible rather than being silenced.

Shared geometry/materials, instanced static furniture/walls, one selective 2,048² directional shadow map, simple tiny spheres and one-segment bevels bound cost. Compared with the initial full-fidelity geometry run, the 30-person scene fell from 146,064 to 84,840 rendered triangles (~42%). Frame poses update refs, not React state; diagnostics publish every 30 frames. No simulation work runs in render frames.

1–40 has full characters and restrained ID-selected ambient walks; 41–100 keeps every individual and disables ambient walks. The measured 100-person view is usable but noticeably less fluid (~56 ms observed interval). Manual simplified view remains available. Above 100, mobile ≤700 px, initial WebGL failure and context loss use the retained focused SVG. This is an explicit fidelity policy, not deletion of people or simulation entities. Reduced motion uses final poses and demand rendering.

Production and packaged evidence is recorded in VISUAL_ACCEPTANCE.md and the release report after those gates complete. Human retention validation is unrelated and remains pending.

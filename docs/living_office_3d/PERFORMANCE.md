# Living Office 3D performance

App 0.2.3; Windows / Node 24.13 / installed Chrome. Measurements are observations on this workstation under normal desktop load, not hardware-independent CI FPS guarantees. Final hosted-equivalent measurements: [browser-hosted-local.json](data/browser-hosted-local.json). Earlier desktop 27-case acceptance: [browser-local.json](data/browser-local.json). Pure adapter and pose sampling: [scene-projection.json](data/scene-projection.json). Existing semantic projection and independent 100-seed/5-year integrity run: [semantic-projection.json](data/semantic-projection.json), [seeds.json](data/seeds.json).

| People | Renderer | Scene ready ms | Select ms | Week ms | Navigate ms | JS heap MB | Mean frame interval ms | Draw calls | Triangles |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 3 | 3D | 758 | 163 | 108 | 139 | 19.0 | 48.8 | 144 | 28198 |
| 12 | 3D | 829 | 179 | 124 | 158 | 20.1 | 53.7 | 321 | 47136 |
| 30 | 3D | 1947 | 220 | 149 | 193 | 29.0 | 100.8 | 667 | 84840 |
| 40 | 3D | 2088 | 251 | 209 | 182 | 27.6 | 108.2 | 856 | 104608 |
| 60 | 3D | 2363 | 316 | 258 | 216 | 39.2 | 132.1 | 1240 | 153120 |
| 100 | 3D | 3408 | 367 | 362 | 259 | 48.9 | 190.1 | 2010 | 241636 |
| 250 | Focus SVG | 425 | 140 | 318 | 180 | 14.3 |  |  |  |
| 1000 | Focus SVG | 489 | 312 | 1134 | 220 | 38.5 |  |  |  |

Scene readiness requires a real WebGL draw, not just an inserted canvas. Selection includes search, click and inspector assertion. Import/deserialization is recorded separately. Each scale now starts in a fresh browser context; initial load is recorded per case. Frame intervals are sampled for approximately 1.2 seconds immediately after scene initialization; they include warm-up and compositor pacing, and are not sustained FPS. Heap is Chrome's JS heap, not total process RAM or VRAM; GC explains non-monotonic values. Draw statistics are the first ready frame after navigation, excluding the shadow pass. Selection/raycast, reduced motion and graphics failure are behavioral gates; numerical timings are reported without brittle FPS assertions.

Pure adapter plus one pose sample per employee, median/p95 ms: 3 0.01/0.225; 12 0.025/0.286; 30 0.047/0.407; 60 0.056/0.176; 100 0.089/0.979; 250 0.175/0.588; 1000 0.347/0.92. Every repetition reconstructed the same base placement and kept the world hash unchanged. The 100-seed/1,826-day run took 24,024 ms with zero crashes, NaN, infinity, corrupt states, invariant violations or independent replay mismatches.

The lazy OfficeScene chunk is approximately 902 kB minified / 245 kB gzip, primarily Three.js and R3F. It loads only when desktop Office needs 3D. No remote models, textures, fonts or HDRI. Local generated labels are at most 512×128. Root assets, worker and finance chart remain separate chunks. The Vite 500 kB chunk advisory remains visible rather than being silenced.

Shared geometry/materials, instanced static furniture/walls, one selective 2,048² directional shadow map, simple tiny spheres and one-segment bevels bound cost. Compared with the initial full-fidelity geometry run, the 30-person scene fell from 146,064 to 84,840 rendered triangles (~42%). Frame poses update refs, not React state; diagnostics publish every 250 ms. No simulation work runs in render frames.

Normal motion uses demand rendering with a single post-frame timer (33 ms normal / 125 ms software). These are maximum scheduling rates, not promised FPS. Scheduling after a completed draw leaves a real gap for input/cleanup instead of accumulating interval work; reduced motion removes the timer. Initial slow-software measurements exposed stale completion diagnostics under the former 30-frame publication cadence, now replaced by elapsed time. 1–40 has full characters and restrained ID-selected ambient walks; 41–100 keeps every individual and disables ambient walks. The measured 100-person view is usable but noticeably less fluid (~190 ms observed warm-up interval). Manual simplified view remains available. Above 100, mobile ≤700 px, initial WebGL failure and context loss use the retained focused SVG. This is an explicit fidelity policy, not deletion of people or simulation entities. Reduced motion uses final poses and demand rendering.

Production and packaged evidence is recorded in VISUAL_ACCEPTANCE.md and the release report after those gates complete. Human retention validation is unrelated and remains pending.

Controlled software WebGL results are preserved separately in browser-software.json. The final post-frame runtime passed all 13 Office cases with a clean exit, including all eight sizes and actual 0.75 DPR. At 100 people it observed 2,675 ms selection, 1,155 ms week advancement and 791.5 ms warm-up frame interval; this remains a slow-device limit, not a normal-GPU claim. The renderer detects SwiftShader/llvmpipe and uses 0.75 pixel ratio plus 1,024² shadows, retaining every individual and real raycast. The Canvas DPR prop follows capability so React cannot restore a larger ratio. Normal hardware remains DPR 1–1.5 and 2,048² shadows. Manual simplified view remains available.

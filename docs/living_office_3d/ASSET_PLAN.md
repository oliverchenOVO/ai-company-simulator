# Asset plan — Phase 2.6B

Internal procedural geometry, distributed under the repository's existing terms. No external models, fonts, HDRI, textures or runtime network assets. Three.js and React Three Fiber retain their MIT licenses. No Blender/Unity runtime is necessary for this modular scene.

| Family | Format | Approximate budget | Reuse |
|---|---|---|---|
| Building | TSX box meshes, locally generated label textures | 300 triangles/floor | slab, walls, elevator |
| Furniture | TSX box/cylinder primitives | 100–600 triangles/item | desks, monitors, chairs, shelves |
| Human | Shared procedural articulated family | under 1,500 triangles | ID-derived existing appearance, joints animated via refs |
| Plants | low-poly leaves / stems | under 500 triangles | same silhouette, varied placement |
| Labels | locally generated canvas texture | max 512 × 128 | floor, selected name; disposed on unmount |

Scale: 1 unit = approximately 1 metre. Building width 18m, depth 7m, floor pitch 3.6m; human standing height 1.72m; desk top 0.78m, desk width 1.6m staff / 1.9m management / 2.4m executive. Sitting bodies shorten leg posture without shrinking the entire person.

Animation targets: idle, typing, walking, talking, presenting, reading/document. Pure presentation clock, no simulation RNG. Public-event handoff / arrival / departure / floor-change waypoints. Reduced motion holds authoritative workstation poses.

Budget: desktop full individuals ≤100, restrained motion ≤40; larger companies and mobile use existing focused SVG. One directional shadow map; small props do not cast shadows. Shared primitive geometry/material cache, no expensive postprocessing. GLB is unnecessary for internally parameterized primitives; adopt local GLB only if a future asset genuinely needs authored topology/rigs.

Fallback: responsive mobile, explicit low-performance control, failed WebGL/context loss, or >100 active employees. SVG remains a presentation fallback only. Accessible employee controls and search are independent of WebGL.

# Rendering decision — Phase 2.6

Choose locally generated SVG 2.5D, with HTML controls and CSS transform animations. The office is a permanent real view; SVG is geometry, not a screenshot.

| Aspect | Three.js / R3F | SVG / HTML 2.5D |
|---|---|---|
| Performance | GPU batching, requires WebGL/context recovery; shadows add cost | Small bounded floor scenes, no frame-wide React updates; simplify motion and focus floors |
| Electron / browser | GPU/driver differences, canvas semantic fallback needed | Existing Chromium path, no GPU-only assumptions |
| Assets | Procedural meshes possible, extra renderer/rig tooling | Internal modular polygon furniture and human silhouettes, no runtime assets |
| Testing | Picking/context mocks plus semantic fallback | Accessible SVG entities + pure projection + real Chrome tests |
| Responsive | Orthographic camera plus separate mobile UI | Focused floor on mobile, whole-building overview on desktop |
| Quality | Rich depth and lighting, larger maintenance surface | Fixed architectural cutaway with shallow depth, restrained shading and consistent assets |
| Maintenance | New dependency, camera/material/resource disposal lifecycle | Existing React/Vite stack, lazy feature module and scoped stylesheet |

The constrained camera, stylized figures, simple waypoints and repeated props do not require free 3D. Keep a renderer-neutral semantic layout so a later renderer can replace SVG without changing worlds. No Three.js dependency or remote assets. No Unity runtime/Blender pipeline is needed for this release.

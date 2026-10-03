# 3D architecture

CompanyView → existing projectOffice → pure projectOfficeScene → LivingOfficeScene. No world/domain imports in rendering, no command dispatch, no hidden risk scores. Existing identity, role, team, manager, vacancies and bounded public cue queue remain authoritative to presentation.

The adapter converts semantic floors/slots to metre-based coordinates and semantic navigation points. Renderer selection routes back to existing UI state / People / Teams / Timeline. Camera, animation clocks and quality controls are local transient state; they are excluded from saves, hashes and replay.

Primary desktop renderer: React Three Fiber 9 (React 19) and Three.js. No drei dependency is needed: constrained camera, primitive assets and labels are small local components. SVG retained behind mobile/large-company/graphics failure fallback. A React error boundary and context-loss handler isolate rendering failures from management.

References: [R3F compatibility](https://r3f.docs.pmnd.rs/), [Canvas fallback](https://r3f.docs.pmnd.rs/api/canvas), [frame-loop performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three renderer](https://threejs.org/docs/pages/WebGLRenderer.html).

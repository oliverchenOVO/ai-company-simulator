# Assets and licensing

All floor/wall/elevator surfaces, desks, chairs, monitors, keyboards, plants, shelves, sofa, tables, screen/planning board and people are original internal SVG primitives in assets.tsx and the renderer. They ship as local compiled code. The design concept is a local generated reference, not a runtime image, texture, model or portrait. No third-party model/texture/font dependency or unresolved license was introduced. System fonts remain inherited.

Existing lucide-react icons remain ISC licensed (see installed package license and lockfile); React, Vite and existing framework dependencies retain their existing licenses. No remote CDN URLs, Blender exports, Unity assets, rigs or asset-download pipeline were introduced. Offline Electron and already-loaded browser use the same local asset module. Cosmetic variations are deterministic palette/silhouette combinations; no hundreds of unique employee files.

# Visual acceptance — 0.2.3 / Phase 2.6B

The released 3D scene has been manually compared with the accepted Phase 2.6 SVG screenshots and the existing architectural reference. Actual production Chrome passed 25/25 with clean exit; all nine deployed asset files match the accepted staging bytes. Platform evidence is recorded in PHASE2_6B_REPORT.md.

## Screenshot scenes

Evidence stays outside Git in `C:\Users\oliver\.codex\artifacts\foundry-phase2-6b-qa\`, with separate final `hosted-paced-release` and `production` runs. A–G from both final runs were manually inspected. Each browser test uses a fresh independent profile. Synthetic company fixtures are labeled in the UI and are not real playtest feedback.

| Scene | File | What is inspected |
|---|---|---|
| A — 3-person garage | startup-desktop.png | three actual founder placements, warm executive lounge/boardroom, manager workspace, staff clusters, continuous elevator |
| B — 12-person company | company-12.png | fuller working clusters, room depth and predictable expanded staff floors |
| C — 30-person organization | company-30.png | all actual individuals, six floors, legible hierarchy, constrained full-building camera |
| D — overload | management-heavy.png | Bob's real 11 reports, papers/marker, selected reporting paths and explanatory inspector |
| E — career concern | concerns-desktop.png | public concern markers and real colleague inspector; no hidden numerical risk |
| F — promotion | post-promotion.png | Carol's actual Senior management path and relocated management workstation, persistent identity |
| G — departure | departure-vacancy.png | actual terminated employee's retained labeled vacant desk; no extra active employee |
| Mobile | office-mobile.png | one-floor SVG, readable external controls, no horizontal page overflow, reduced motion |
| Windows | packaged-office.png | actual app.isPackaged WebGL rendering, normal selection and restart workflow |

## Visual comparison ledger

1. The SVG baseline occupies a small interior diagram inside a bordered card. The replacement fills the main content with an architectural object, with a compact single-row toolbar and a narrow inspector. Integrated slab labels replace a separate empty metadata column.
2. Floors have substantial front edges, actual side/back-wall thickness, perspective and occlusion. Chairs, desks, shelves, the lounge and boardroom are volumetric; they are not textured flat panels. The elevator is a continuous teal/metal architectural core.
3. Executive timber/planks, the sofa/bookshelf/artwork and generous meeting table distinguish the top floor. Four larger manager stations, shared planning walls and a smaller meeting area distinguish management. Staff floors have denser paired desk/monitor clusters, cabinets, printers and water stations. Empty furniture is unused capacity, never fake employees.
4. Neutral PBR finishes, soft key/fill lighting, warm executive illumination and selective contact shadows give readable depth. The initial dark ground horizon was removed in favor of a restrained shadow receiver. Tiny props do not all cast expensive shadows.
5. Employees have actual head/hair, torso, articulated arms and upper/lower legs, shoes, ID-derived palettes and glasses/bun/skirt variants. They sit at desk height and stand/walk at human scale. Only the selected person has a large nameplate and ring. Clicked 3D head raycasts resolve to the actual employee; keyboard/search equivalents remain available.
6. Real promotions now retain the previous observed floor, walk to/from the elevator, then stage an optional bounded table-side presentation. A colleague follows waypoints to a real chair instead of teleporting. Handoffs visit the actual manager floor and carry a folder; neutral acknowledgement asserts no invented decision result.
7. The inspector uses actual names, roles, level, team, manager, reports, concerns and semantic workplace. The reference's illustrated portrait and narrative labels are not copied as fictional biographies. Existing deterministic portraits reuse the same identity mapping.

The result clearly exceeds the flat SVG's spatial richness and reads as a stylized operating office. It deliberately uses lightweight low-poly figures and restrained materials; it does not claim photorealistic parity with the richer concept illustration. The 30-person full-building view is the primary showcase; 100-person fidelity remains individual but less fluid. Full-building view scales to growth, while floor/search focus makes individuals readable.

## Behavioral evidence and boundaries

All original 99 unit tests and original semantic projection cases remain. Added pure adapter/pose tests cover deterministic coordinates, non-mutation, reduced motion, actual old-save/replay reconstruction, arrivals/departures, floor transfer, actual-manager handoff and continuous meeting movement. Browser tests prove real draw initialization, founder raycast, external keyboard controls, hire/promotion, manager reassignment, overlays, original world/hash after presentation, persistence/replay, mobile, independent contexts and loaded offline operation.

Both deliberate initial WebGL unavailability and actual WEBGL_lose_context fall back to SVG while management continues. Development diagnostics are expected only for these intentional fault injections. Normal Office workflows collect console/page errors and require none. No WebGL dependency is introduced into simulation tests.

Regular Playwright with installed real Chrome is used because the dedicated Browser plugin/skill is unavailable in this session. It tests actual rendered pixels and browser behavior, rather than relying on tool screenshots alone. Windows test launches the actual packaged executable with a fresh SQLite profile; a development Electron launch cannot satisfy that gate.

Human retention validation remains **pending, zero participants**. No Phase 3 work is authorized or implemented. Visual acceptance does not establish retention balance or replace human playtesting.

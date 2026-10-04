# 0.2.3 visual baseline — Phase 2.6C

Before any runtime change, source `56bdc35` / actual Site version 8 was captured with installed Windows Chrome, 1586×992, deterministic existing Office fixtures. All 13 Office workflows passed with clean exit (1.9 min), including original world/hash, replay, all eight sizes and fallback assertions. Browser plugin not available; repository Playwright was used. Screenshots live outside Git: `C:\Users\oliver\.codex\artifacts\foundry-phase2-6c-qa\baseline\`. All A–G were inspected individually. Raw measurements: [baseline-browser.json](data/baseline-browser.json). These synthetic scenarios are not human feedback.

## A — Garage Startup / startup-desktop.png

Composition: three floors fill the main height but lower slab meets the footer; the default inspector consumes space without an employee selected. Room identity: top wood and lounge help, middle and bottom share pale finishes. Character readability: Alice/Bob/Carol are recognizable mostly through labels, heads barely clear chairs/screens. Lighting: very even, low contrast. Materials: fabric, paint, desk plastic and flooring all look similarly matte. Depth: genuine but washed out. Furniture scale: plausible, chair backs hide torsos. Scene density: much unused capacity, appropriate for three people; empty boardroom is visually dead. UI framing: toolbars and always-visible guide compete with building. Animation opportunity: distinct founder silhouettes, desk posture and a restrained onboarding pause.

## B — 12 employees / company-12.png

Composition: four-floor expansion remains coherent, top picker touches roof. Room identity: identical white walls and generic screens flatten hierarchy. Character readability: hair/head variation is too small at this scale. Lighting: large undifferentiated areas. Materials: stronger wood/fabric/carpet distinction needed. Depth: shadow separation works but details are muted. Furniture scale: desks and chair clearances are credible. Scene density: believable staff clusters but generic meeting/manager areas. UI framing: bottom accessible list is useful but visually loud. Animation opportunity: most people should keep working; a few idle/reading shifts suffice.

## C — 30 employees / company-30.png

Composition: tall six-floor building occupies only about half the canvas width; top floor overlaps picker, considerable lateral negative space. Room identity: staff floors repeat, executive/manager hierarchy weak without labels. Character readability: interchangeable small markers at full-building scale. Lighting: flat and gray; directional ground shadow dominates scene details. Materials: little contrast between pale surfaces. Depth: real but weaker than it could be. Furniture scale: consistent; tabletop and chairs lack finish distinctions. Scene density: all actual individuals are present, good growth signal. UI framing: empty inspector competes with architecture. Animation opportunity: related event participants can animate rooms without adding fake people. This baseline is not a strong portfolio cover.

## D — Management overload / management-heavy.png

Composition: selected management framing keeps context, footer clips lower floors by design. Room identity: manager's workspace needs a recognizable planning backdrop. Character readability: Bob's clothing and hair blend into surfaces. Lighting: desk papers lack contrast. Materials: clutter reads as stacked blocks. Depth: reporting lines cross the middle of occupied rooms. Furniture scale: manager desk is larger but subtle. Scene density: actual eleven reports correctly express pressure. UI framing: inspector has correct load/count but long report list dominates. Animation opportunity: real public manager change can trigger neutral document review; overload alone must not invent meetings or angry behavior.

## E — Concern / concerns-desktop.png

Composition: staff focus shows nearby colleagues but clips upper floors intentionally. Room identity: generic staff background. Character readability: selected label works; posture and clothing still weak. Lighting: highlights are readable but flat. Materials: same pale plastic as other levels. Depth: chair/monitor occlusion remains. Furniture scale: good workstation spacing. Scene density: three actual staff on this floor; spare seats are capacity. UI framing: qualitative concerns are accurate; no hidden risk is exposed. Animation opportunity: mild reading/idle posture only, no exaggerated sadness or new world meaning.

## F — Post-promotion / post-promotion.png

Composition: management floor emphasized while preserving adjacent floors. Room identity: moving into management is semantically correct but visual reward small. Character readability: Carol's selected label is clear, body still generic. Lighting: no distinct arrival highlight. Materials: new desk barely differs from old staff workstation. Depth: elevator exists but generic solid block. Furniture scale: usable positions, meeting table edges need careful paths. Scene density: actual two managers shown; meeting area returns empty. UI framing: real Senior/management state and event link are correct. Animation opportunity: bounded transfer, brief accent, and supported populated meeting with explicit related employees.

## G — Vacancy / departure-vacancy.png

Composition: selected vacant desk in focused staff floor, screenshot scrolls past toolbar. Room identity: stock staff desks. Character readability: departed body is correctly gone. Lighting: empty desk not visually differentiated. Materials: monitor remains bright; stationery still looks occupied. Depth: genuine chair/desk geometry. Furniture scale: correct. Scene density: vacancy remains and active count drops, no fake employee. UI framing: accurate inspector and timeline link. Animation opportunity: visibly leave, power down personal workstation and retain a quiet empty desk; no emotional outcome invented.

## Decisions before implementation

Preserve CompanyView/OfficeProjection meaning, all 112 tests, v1/v2/v3 and save schema 2. Strengthen room palettes and material response, bounded accent lighting/contact shadows, founder identity, articulated desk poses, event-driven handoff/meeting participation and smoother corridor movement. Keep fallback/mobile strategy. Improve actual camera bounds and inspector framing. Use shared geometry/materials and instanced static props, avoid remote asset packs and additional postprocessing. Final A–I and a genuinely useful 30-person showcase are required; more props alone are insufficient.

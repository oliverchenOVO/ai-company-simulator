# Art direction — Phase 2.6C

[Full-screen reference](reference/office-concept.png) was generated with built-in Image Gen from the freshly captured 0.2.3 startup before implementation. Prompt: preserve the full existing FOUNDRY screen, three actual founders, existing navigation and real controls; improve achievable stylized 3D room/material/lighting/human presence, warmer timber executive, blue-gray manager planning floor, practical pale staff clusters, restrained cloth/metal/glass/screen variation; no invented data, new product feature, photoreal texture pack or neon. Reference is design-only, never a substitute for real geometry. Generated image copied into this repository; no runtime image dependency.

## Locked direction

Same CompanyView → OfficeProjection → local geometry. Open architectural cutaway; executive workstation/lounge left, boardroom right; managers left/planning/meeting right; staff denser paired desks; elevator is central vertical anchor. Preserve the existing navigation, typography and actual inspector fields. No new marketing sections, statistics or biographies. White application chrome, pale cool-neutral canvas, teal controls and slate navigation remain.

Executive palette: honey walnut `#a87447`, warm wall `#e9dfcc`, deep teal fabric `#325d60`, restrained brass `#bca575`. Management: slate-blue floor `#637b89`, planning wall `#b6c4c7`, neutral wood desks. Staff: bright limestone `#e0e5df`, white desk surfaces, graphite chairs. Elevator: brushed silver frames with teal inset and restrained warm indicator. Vary paint (.85 roughness), cloth (.95), timber (.5), metal (.3 roughness/.65 metalness), screen (.35) and glass (translucent local shared geometry), rather than one plastic surface.

Use tiny locally generated repeatable grain/cloth patterns, not remote textures. All repeated props share geometry/materials and are batched, including mapped materials. Slender beveled slabs, wall trim, screen blocks, task lights and book/storage details support hierarchy. Large objects cast/receive selective shadows; tiny props do not. Bound actual accent lights independently of company size, preserve software .75 DPR/1024 shadows and manual/SVG fallback.

## People and composition

One shared articulated body with rounded jacket/torso, collar, clearer hair volume and shoes. Founder ID presets remain presentation-only and never rewrite OfficeProjection appearance: Alice navy suit/cream collar/dark bob, Bob blue cardigan/glasses, Carol jade jacket/bun. Generic identity is derived deterministically from employee ID, not world RNG. Apply the same style to 3D and inspector portrait. Selected person uses a restrained nameplate/ring; camera retains floor context. Unselected guide is integrated quietly, not a competing card. Floor controls should not falsely highlight the staff floor in full-building mode.

Fit the real cutaway bounds with deliberate top/bottom clearance, avoiding excessive margins and accidental roof/foot clipping. Keep restrained perspective and limited zoom/focus. Notifications stay readable but compact on Office; error messages and management controls remain usable. On small native desktop windows, camera initializes before the first ready frame and the scene remains within its canvas. Mobile keeps existing SVG strategy.

## Motion signatures

Real hire: elevator orientation pause → clear corridor approach → seated workstation. Departure: workstation → corridor → elevator → empty desk with dimmed screen. Promotion: actual observed old/new floor transfer, brief emphasis, then supported management-room presentation. Handoff: actual employee/current manager only, folder, turn/neutral review/return. Meeting: bounded one-room occupancy, two to five actual eligible related people, seated listeners facing a screen/table and one presenter; never a fabricated calendar or decision result. Most people remain working. Participant conflict, no appropriate participants or unsupported cues means skip, not invent.

Final A–I must be actual rendered scenes. The 30-person full-building screenshot must materially improve on baseline and be suitable for a project cover. Preserve all original regressions, no new simulation version, retention or save schema.

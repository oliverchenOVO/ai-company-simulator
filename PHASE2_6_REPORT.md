# FOUNDRY Phase 2.6 — Living Office

## Acceptance status

Implemented and accepted locally; Windows packaged and actual hosted production gates are pending at this checkpoint. App 0.2.2. Simulation v1/v2/v3 remain authoritative; no v4, retention/economy change or Phase 3 development. **Human retention validation remains pending. Living Office does not substitute for human playtesting of retention.** No participants, sessions or feedback were fabricated.

## Visual scope and rendering technology

Permanent primary navigation: 辦公室, retaining the dashboard and all management screens. Live architectural cutaway with executive, management and expandable staff levels, continuous elevator motif, executive desk/sofa/shelf/board table, shared management workstations and meeting corner, denser modular staff desks/screens/plants/printer. Actual employees have lightweight stylized silhouettes with cosmetic identity. The view updates after real commands and time advancement; it is not an image, disposable mockup or separate simulated world.

[RENDERING_DECISION.md](docs/living_office/RENDERING_DECISION.md) compares Three.js/R3F with SVG 2.5D on compatibility, assets, performance, quality, testing and maintenance. Choose the simplest constrained architectural renderer: local SVG primitives, HTML controls and CSS animations. No WebGL/GPU-only assumption, 3D engine dependency, remote models, fonts or textures. Original internal assets and existing icon license are documented in [ASSETS.md](docs/living_office/ASSETS.md).

## Architecture boundary

Office receives **CompanyView only**. No Action prop, simulation instance, hidden psychology, RNG, command dispatch, direct WorldState mutation or authoritative office state. Pure projection owns detached arrays. Ambient motion and interaction change presentation state only. Selection links to existing People, Teams and Timeline; actions remain their original application transaction path. Global one-day/week controls stay available while Office is visible.

Frozen-view tests and real browser export-before/after comparison verify that selection, overlays and detail navigation do not change world or hash. Existing simulation/domain/narrative equations and released fixtures have no diff. Only app-version metadata changes in persistence; save schema remains 2. Layout reconstructs from validated old saves and independent replay without migration. No LLM enters the loop.

## Floor / layout rules

[LAYOUT_PROJECTION.md](docs/living_office/LAYOUT_PROJECTION.md): CEO executive; CTO, manager track or actual active reports management; other contributors staff. Founder startup projects Alice/Bob/Carol into the three layers. Rooms accommodate four management positions; staff groups by actual team and direct manager into up to four people per zone, two zones per floor. Floor expansion follows these capacities, not speculative exact 8/20/40 thresholds. No rent, property, construction or economic capacity rule.

Same observed organization → same semantic desks. Pure time steps do not shuffle unchanged desks. Reorganization and insertion of groups can shift later deterministic floor partitions. Accepted hires appear; rejected candidates do not. Management promotion relocates but does not create reports or skill. Actual departure produces a named empty seat (up to 16 recent vacancies / 30 simulation days). Former informal managers may fall back to staff after authoritative reports are reassigned; role/track are preserved where available.

## Identity, activity and mappings

[PRESENTATION_STATE.md](docs/living_office/PRESENTATION_STATE.md): fixed ID hash selects hair, palette, clothing, accessory and cosmetic animation phase. Same appearance after navigation, reload, save/load, promotion and replay. Reusable human geometry; no individual portrait inventory or role stereotypes.

| Simulation / public observation | Visual projection |
|---|---|
| Active entity | Named seat and stylized person |
| Actual team / manager | Cluster and selectable context; selected/overlay reporting route |
| Manager track promotion | Highlight, brief acknowledgement, management floor |
| Hire | Arrival waypoint and added seat |
| Departure | Empty desk and real event link |
| Career/support/condition concern | Restrained marker plus exact qualitative text |
| Management overload | Documents + ! marker + visible load label and real report count |
| Team transfer / manager change | Regroup / brief movement or document-discussion motif; observed team stability in context |
| Recent organizational events | Meeting-area activity label and bounded event vignette |

Default working/reading is quiet illustrative activity, not newly asserted work output. Recent public event cues expire after seven days, newest per person, capped eight with departure/hire/promotion priority. CSS walks use simple local waypoints and finite animations, not pathfinding/elevator scheduling. Reopening may restage a recent presentation, never repeat a world command. No calendar, proposal success/rejection, fabricated agreement, humiliation or unsupported relationship outcome. Full document handoff/manager reaction and populated meeting choreography remain future visual polish.

## Interaction and accessibility

Normal / 匯報 / 關切 overlays; selected employee identity/status, team, manager, actual reports and event links. Clicking team shows its real organization context. Reset view and floor focus keep camera constrained. Selection follows a promoted employee's actual new floor. SVG targets accept keyboard Enter/Space with accessible labels; status is text plus symbol, never color alone. Existing textual People/Teams remain fallback. Small startup overview fits the three founders; selecting a floor expands detail. Mobile 390×844 uses one floor, horizontally navigable architectural detail, readable person buttons and normal management controls. Reduced-motion disables decorative activity while keeping all information.

## Performance

[PERFORMANCE.md](docs/living_office/PERFORMANCE.md) and committed synthetic raw measurements. Pure projection median 3 / 100 / 1000 people: 0.013 / 0.124 / 0.871 ms. Hosted-equivalent Chrome scene 100 people 170 ms; week 155 ms; navigation 216 ms; observed browser heap 21.4 MiB. These are host-dependent observations, not an FPS gate. <=100 draws individuals; 101–250 disables motion and focuses floors; larger robustness fallback draws selected floor only with full floor counts and complete searchable identities (no future cohort truth). 1000-person fallback scene 96 ms, week 701 ms, browser heap 32.7 MiB. SVG draw calls not applicable. Lazy feature JS 20.78 kB, CSS 7.72 kB; no frame-by-frame React state.

100 seeds × five years including replay: 10082 ms, all six integrity counters zero. Prior Phase 2.5 1000-person ten-year result remains historical evidence; not rerun or claimed as new. Normal-range scene and explicit large fallback are measured in new real browser workflows.

## Tests / E2E / rendered acceptance

99 tests / 13 files pass, preserving all 82 old tests and all immutable v1/v2/v3 fixtures/goldens. 17 meaningful new tests cover identity, floor roles/capacities, team/report grouping, real promotion/management/transfer/hire/rejection/departure, qualitative concern boundary, frozen non-mutation, save/load/replay, tick stability, cue expiry/limits, fidelity identity coverage and vacancy bounds/expiry.

Lint/typecheck, desktop/Electron and hosted build pass. Local Web/Electron 17/17 (3.4 minutes); hosted-equivalent Google Chrome 15/15 (53.7 seconds). New complete flow verifies founders → Alice keyboard selection/detail → week → hire → manager promotion → floor → save/refresh → identical appearance → exported hash/replay. Controlled concern, overload, vacancy, reduced-motion/mobile/offline and 3–1000 measurement flows pass. Original compensation/organization, independent-session, offline, financial and desktop restart flows remain.

[TESTING.md](docs/living_office/TESTING.md) records page identity, meaningful content, no framework overlay, console/page-error checks, interactions, screenshot evidence, design ledger and commands. Browser plugin not available; regular installed Playwright Chrome used. Screenshots and traces stay outside Git; no human/credential data. Concept and latest screenshot inspected together using view_image; primitive vector art is an intentional user-requested deviation from the richer illustration, not a pixel-identical asset claim. Desktop 1440×900 / 1586×992 and mobile verified. Initial clipped three-floor overview and selection-following were fixed; a scenario-name assumption in a test was corrected to observed identity rather than weakened assertions.

## Windows

Pending completion of actual portable rebuild and three packaged flows, including create → Office → select → week → save → actual process restart → continue → replay. Original two packaged assertions remain. Unsigned portable release retains existing project signing/configuration; no new GPU assumption.

## Hosted production

Pending archive-backed same-Site publication and actual production Chrome 15-case acceptance. Preserve Site ID, public audience, stable URL and private Git source. Existing player saves use the same schema/rules. Browser profiles remain independent and refresh-persistent; cross-device/account sync is not part of this phase.

## Git milestones

- b4ac93c: visual architecture and renderer comparison.
- 5f86410: deterministic projection, 16 initial semantic tests and measured baseline.
- 4bf138a: modular cutaway assets, identity, event activity, overlays, focus and context.
- 3fb59f5: correct real focal identity and meaningful vacancy expiry/bounds coverage (17 Office tests).
- 38b6557: Office Web/Chrome, measured rendering and actual packaged restart coverage.
- 6b7ba5f: app 0.2.2 metadata, unchanged world versions/save schema.
- Acceptance/documentation commits record final measured release gates separately.

Private repository remains oliverchenOVO/ai-company-simulator. No public repository/source release. Final source/deployment/clean-pushed/CI evidence will be recorded after publication.

## Known limitations and next visual iteration

Fixed 2.5D geometry has simpler depth/materials than true 3D. Startup nameplates are small; selection expands the person/floor, mobile uses textual choices. Large buildings use scrolling/focus. Historical informal-manager vacancy cannot perfectly retain pre-departure responsibility without reconstructing more reporting history. Recent activities may restage on navigation; camera/overlay preferences reset. No complex rigs, actual elevator schedule, full manager document response, live meeting attendance or floor-economic gameplay. Mobile is a simplified floor experience, not desktop free camera.

Next visual iteration: optional clearer cross-floor selected reporting routes, modest meeting/handoff choreography backed by exact public events and presentation preferences outside world saves, measured against the same normal-range/offline gates. **Human retention validation remains pending.** Collect 3–5 independent player sessions when available; this visual feature cannot declare Phase 2.5 complete. Do not automatically begin Phase 3 or tune retention rules.

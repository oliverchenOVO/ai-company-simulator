# Office testing and rendered QA

Browser plugin not available; regular Playwright with installed Google Chrome follows the existing project workflow. The flow under test is create Garage → Office → founders → Alice keyboard selection → existing detail → return → week → accepted hire → management promotion → new floor → save/refresh → identical appearance → exported hash and replay. Additional controlled concern/overload/vacancy/reduced-motion/mobile/offline flow and 3/12/40/100/250/1000 measurements cover presentation boundaries.

99 unit tests / 13 files pass, including all 82 preexisting tests. The 17 new Office assertions cover seeded visual identity, semantic roles/layout/capacity/team/report grouping, promotion relocation, actual management/transfer, genuine departure vacancy, accepted versus rejected hires, qualitative concerns only, deep-frozen projection non-mutation, tick-only stability, validated save/restore/replay, bounded recent cues, full large-company identity coverage, bounded/expired vacancies and released v1/v2/v3 files. Originals/goldens/compensation regression standards are untouched.

Local Web/Electron 17/17; hosted-equivalent Chrome 15/15. Packaged and production results are recorded in PHASE2_6_REPORT.md after those gates complete. Original scenarios and assertions remain; no screenshot is a sole acceptance method. Actual packaged test launches win-unpacked app.isPackaged and checks Office create/select/week/save/process restart/continue/replay; original two packaged flows remain.

Commands: pnpm lint; pnpm typecheck; pnpm test; pnpm benchmark:office; pnpm benchmark -- --out=docs/living_office/data; pnpm build; pnpm test:e2e; pnpm build:site; node node_modules/@playwright/test/cli.js test --config playwright.hosted-local.config.ts; pnpm package:win; pnpm test:packaged; pnpm test:hosted. Direct Node entrypoints equivalent to the existing scripts were also used to avoid repeating the host package-manager wrapper's install step.

| Check | Evidence / result |
|---|---|
| Page identity | Real FOUNDRY title and intended local/production base URL |
| Meaningful screen | Actual founders, floors, controls and context assertions |
| Framework overlays | None in inspected screenshots; successful real workflows |
| Console / page errors | New Office flows assert empty error arrays |
| Interactions | Real create, hire, promotion, vacancy, detail links, refresh and hash verification |
| Responsive / motion | 390×844: focused floor, readable textual people buttons, no body overflow; reduced motion animationName none |
| Screenshots | startup, 12 people, 100 people, management-heavy, concerns, promotion, vacancy, mobile outside Git |

Design inspection used view_image on the generated reference and latest screenshots in the same QA pass. Concept file: C:/Users/oliver/.codex/generated_images/01a0fdf2-ddb8-7892-9143-a63447550a1d/exec-5eaaa96d-e7ef-4193-abd1-2b5e4483c4ce.png. Evidence directory: C:/Users/oliver/.codex/artifacts/foundry-phase2-6-qa. Desktop 1440×900 and 1586×992 plus mobile inspected. The generated image native size is 1586×992, matching the hosted desktop screenshot viewport. This is structural/style fidelity with intentional primitive-asset deviations, not a claim of photorealistic/pixel-identical reconstruction.

| Comparison point | Concept → implementation / decision |
|---|---|
| Layout | Stacked executive/management/staff, teal elevator, right context preserved; small-company overview compacted so all founders fit first screen |
| Palette | Navy rail, teal selection, cool neutral interiors retained |
| Typography | Existing system font and Traditional Chinese controls retained; tiny floor nameplates supplemented by selection panel and mobile names |
| Copy | 辦公室, subtitle and reset retained; overlay names translated to 日常/匯報/關切; actual company name/seed facts replace illustrated sample copy |
| Assets | Rich rendered illustration/portrait translated to original reusable vector geometry as explicitly requested; no generated raster world or fake people |
| Containers | Existing app chrome preserved; scene + compact contextual panel, no unrelated dashboard replacement |
| Responsive | Mobile focused floor with horizontal architectural detail and complete textual choices, rather than shrinking entire tower |
| Motion | Bounded real-event vignettes and quiet seeded ambient work; no invented meeting outcome, reduced-motion alternative |

Mismatch repairs: initial three-floor first view clipped the staff floor; compact overview fixes it. Selection now follows actual promotion floor, while explicit floor selection clears person focus. Team context is independently selectable. A test incorrectly named a scenario manager; it now reads actual public managerName and focal employee ID. No tests deleted or standards lowered. Weekly summary remains functional and can be closed via its existing control for scene inspection. Human understanding and retention playtesting remain unverified.

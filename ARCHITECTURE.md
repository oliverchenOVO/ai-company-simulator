# Phase 1 architecture

## Ownership and boundaries

`packages/domain` contains Zod schemas and inferred TypeScript types. `packages/shared` provides canonical JSON, SHA-256, simulation dates and contextual RandomSource streams. `packages/simulation` owns the world and all commands/systems; it depends on no Electron, React, network or LLM runtime. The CLI runs it under Node. Query projections render deterministic templates from `packages/narrative` and return detached player-observable data. A snapshot is also detached; mutating returned values cannot mutate the world.

`packages/application` accepts a strictly validated request union and coordinates a single Simulation with a SaveRepository. Candidate commands run on a private copy, persist successfully, then replace the current simulation. Failed commands/storage writes retain the prior accepted state. All worker/IPC requests are serialized. CreateCompany is recorded as the initial scenario command, followed by player command records at their pre-execution tick.

Desktop: React → narrow preload bridge → validated IPC → ApplicationSession → Simulation → SQLite. Renderer Node integration is off, sandbox and context isolation are on. External navigation/popups are blocked. The application never accepts filesystem paths from the renderer. Only fixed autosave/manual slots are exposed. Browser: React → dedicated Web Worker → the same ApplicationSession/Simulation → IndexedDB. This keeps calculation off the browser UI thread. Zustand stores page/selection choices only; React holds projections, never authoritative world entities.

`packages/persistence` uses real SQLite through sql.js/WASM for desktop portability (avoids native ABI rebuilds), and IndexedDB for the web adapter. Both validate the same save envelope. SQLite saves structured snapshot JSON plus ordered command/event rows. Snapshot/log updates are transactional and file replacement uses a same-directory temporary image; an in-memory pre-write image restores a failed save. Browser transactions resolve only after commit.

## Queries and narrative

CompanyView contains observable finance/product metrics, employee roles/pay/qualitative conditions, teams, customer status, visible events and template messages. Exact stress, burnout, loyalty, exit intent, resentment, memories and private job-search events are excluded. The templates never run inside the world-truth update and never change state. Unknown visible events fail explicitly rather than inventing narration. Debug information is available via CLI `--debug` or the desktop `--debug-simulation` argument; there is no normal gameplay debug page.

Employee/customer lists render 25 rows per page; event/inbox lists also paginate. The finance chart is code-split with React.lazy. No whole-world rerender occurs during intermediate simulation ticks. Directed colleague relationships use a sparse graph with bounded initial degree, rather than a full O(N²) graph.

## Deferred interfaces

NarrativeProvider permits future text providers without authority over simulation. Save schema and simulation version are separate; changing equations requires intentional golden-fixture changes and a compatible old replay strategy or explicit save migration. No LLM, online account backend, multiplayer, investment round, multinational subsidiary or 3D engine is added in Phase 1. Unity/Blender would only be considered when a future visual-world requirement justifies them.

## Phase 2 organization / behavior v3

The same engine now has explicitly gated organization, career and collaboration systems. New games use v3. Historical v1/v2 worlds never receive new organizational fields; restoration preserves their recorded behavior and exact golden hashes. Career/team state is authoritative and version-specific. organizationIndex derives team membership, report counts and sparse ties once per tick; no score graph is duplicated. Causal templates and qualitative projections remain outside truth. See docs/phase2 for model/compatibility evidence.

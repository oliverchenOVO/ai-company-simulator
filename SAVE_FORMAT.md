# Save format v1

Envelope: `{manifest,world}`. Manifest fields: schemaVersion=1, appVersion=0.1.0, seed, tick, ISO simulation date and SHA-256 stateHash. World contains simulationVersion=1, initial scenario config, full entity snapshot, ordered immutable historical event values and complete command records. Historical salary rates, bounded memories, exit stages and counters are retained.

Validation: migrate supported envelope → Zod → metadata consistency → canonical SHA-256 → simulation invariants → initial scenario and ordered command/event/cause validation. Unsupported future versions, tampered state or dangling history are errors, never silently reset saves. A legacy v0 manifest migration adds application metadata without changing world truth; unit tests exercise it. Any future world migration must explicitly preserve/translate the command history and document replay compatibility.

SQLite tables: `saves(slot PRIMARY KEY, manifest JSON, snapshot JSON)`, `commands(slot,sequence,record JSON)`, `events(slot,sequence,record JSON)`. Commands/events are separated from snapshot JSON and ordered by sequence. Transactional replacement deletes only the target slot. Exporting sql.js resets connection pragmas, so save re-enables foreign keys and explicitly deletes dependent rows; a regression test overwrites slots and verifies isolation. Durable image replacement uses a same-directory .tmp file. Failed writes restore the old in-memory image; the application accepts no corresponding command.

Browser adapter uses IndexedDB `foundry-company-saves` database v1, `saves` object store. Storage is isolated by browser origin/profile. It is local persistence, not authenticated account sync. Browsers may evict storage under quota policies; Settings export creates a portable JSON backup.

Slots: autosave after creation and every accepted player command; manual only when Save is clicked. Loading manual also atomically replaces autosave. Refresh/restart resumes autosave. A manual checkpoint remains independent. All I/O is outside the simulation loop.

Replay recreates the initial scenario/seed then re-executes records after CreateCompany in their exact command order. The pre-command tick sequence is verified and AdvanceTime spans are retained. Hash includes logs as well as world quantities. The browser-export E2E validates the saved world under Node and compares independently replayed SHA-256. Import additionally replays before acceptance. Hashes are integrity checks, not a cryptographic signature or anti-cheat mechanism.

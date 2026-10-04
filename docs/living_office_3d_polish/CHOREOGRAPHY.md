# Choreography contract

The authoritative simulation, `projectOffice`, RNG and save schema remain unchanged. `planChoreography` consumes only the existing public presentation queue and actual projected people. No calendar, new meetings, hidden thoughts, congratulations, invented outcomes or simulation commands are produced.

- Maximum one meeting and one document handoff at once. A meeting contains one real promoted manager and 1–4 actual active related colleagues on the same floor. Missing, unrelated, occupied and vacant participants are excluded. If no listener qualifies, the meeting is skipped.
- A handoff requires an actual active manager. Both participants are reserved, so the same person cannot join another vignette. Cross-floor travel uses the existing elevator anchor; its brief transit is hidden.
- Meeting: approach at 8–11 presentation seconds, populated discussion at 11–19, return at 19–22. Listeners use unique actual chair coordinates and seated poses; the leader remains standing.
- Handoff: local 0–12 seconds, cross-floor 0–18 seconds. The real manager remains seated while reviewing. A carried document is a neutral prop, without any generated message or result.
- Cue-ID clocks are shared by all participants. Unrelated queue changes do not reset an existing clock. Clocks are renderer-only and removed when the cue leaves the queue; revisiting the view may present the real recent event again.
- Reduced motion returns directly to real workstations. Walking follows side lanes and the front aisle, with smooth start/stop and distance-driven gait. No pathfinding or persisted animation state is introduced.
- A floor focus limits rendered rooms and visible people to that physical level, including a visiting colleague after elevator transit. Accessible employee selection still exposes the real roster.

Verification: pure participant, identity, eligibility, occupied/vacant, expiry, reduced-motion, save/load/replay and world-nonmutation tests; actual Chrome meeting and handoff tests verify synchronized poses, return, unchanged exported world/hash and replay. Final performance and screenshots are recorded separately after the visual acceptance pass.

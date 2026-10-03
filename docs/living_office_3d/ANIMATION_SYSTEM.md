# Animation system

Shared articulated human family: torso, pivoted head, two shoulder pivots, leg group, shoes and folder. useFrame updates refs; no React state per frame. Existing employee-ID appearance supplies skin, hair, shirt, glasses and phase. No authoritative random calls.

sampleMotion is pure and tested. Rest is typing or reading. A small ID-selected subset visits the printer on a 45-second presentation cycle; above 40 staff ambient walks stop. Real bounded Office cues drive arrival (elevator→desk), departure (desk→elevator→hidden), discussion (carry folder→actual manager, including cross-floor elevator hide/appear→return in at most 18 seconds). Managers briefly review documents without asserting praise or rejection. Floor-change retains previous local placement, approaches the old elevator, hides, emerges on the projected destination floor. Fresh loading reconstructs current state; it does not manufacture historical simulation events.

Idle is the neutral rig; typing, walking, talking and reading use joint poses. Meeting participants use existing real organization cues. Most people stay at work. Cues expire with the existing seven-day / eight-person bounded queue; transient playback cannot enter saves or replay. Reduced motion returns final workstation pose immediately and uses demand rendering. Vacancies remain empty.

Selection ring and architectural labels are renderer state. Textual controls always remain outside canvas. No synthesized meeting calendar, document outcome, elevator scheduling, productivity score or decision feedback.

Promotion floor transfer finishes at 8 seconds before a separate 8–18 second meeting vignette. The presenter stands beside the table; one existing same-floor colleague follows corridor waypoints to a chair and returns. No participant teleports into a tabletop. Previous placements are a bounded UI-only cache (at most 100 people), cleared for a new company; refresh restores final placement, never animation history.

# Management model (simulation v3)

Derived daily from leadership (45%), relevant domain skill (15%), directional trust/respect/resentment (25%) and manager stress (15%). Capacity is (3 + leadership/15) reduced gradually by stress, floor 2. Attention is min(1, capacity/direct reports). Support retains a 45% floor under overload; no automatic resignation. Actual reporting links, including cross-team assignments, determine load. Overload/recovery events are emitted only on crossings.

Support changes stress, satisfaction, manager trust and retention gradually. Manager time consumes up to 65% of individual work; every report takes 6.5%, a management track adds 15%. Team coordination bounds the work multiplier to 0.85–1.15. Sparse relationship/team/report indexes are transient and rebuilt O(N+E) once per tick.

Historical v1/v2 paths retain original equations and update order. First milestone keeps new-game default v2 until career commands and UI are ready. Tests cover overload without instant departure, measurable work differences, exact replay and actual v2 hosted export.

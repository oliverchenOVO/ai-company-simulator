# Performance acceptance

100 seeds × 5 years: 2573 ms, all integrity counters 0; each seed independently replayed and restored.

1000 employees × 3652 days: 105975 ms, including independent replay, schema/finite scan and restore verification. Actual active employees 1000; relationships 1998; events 4877; memories 3849; observed ending heap 142 MiB. All crashes, NaN, Infinity, corruption, invariant failures and replay mismatches 0. Hash 800102637f6597f01d58009c96b374963582a125401ac6496a848a2e907295c4.

Initial unreleased v3 run: 238921 ms, 52164 events, 11945 memories. Profiled episode-calibrated run: 122424 ms; 4878 events, 3850 memories. Profile attributed most CPU time to invariant traversal/allocation; finite checks were retained while diagnostic strings are only built on failures. Final model additionally makes real leadership responsibility attainable. Timings include varying concurrent host workload and packaging, so these are observations, not a controlled speedup claim. Original v2 full-replay stress was approximately 32144 ms: v3 costs more validation and organizational work. No arbitrary CI performance threshold was introduced.

Processing uses transient O(N+E) membership/report/tie indexes. Active sorting remains O(N log N). No all-to-all relationship generation; final graph stays close to 2N, with no automatic edge growth after initialization in the stress scenario. Per-employee memories remain capped at 24. Events are actual crossings/actions and calendar history, not daily score logging. Generic unresolved concerns no longer repeat every month without a new episode/action.

1000-person UI validation still renders 25 employee rows. Worker navigation and a week advance are measured separately in E2E output, not conflated with this full ten-year/replay workload. The targeted Teams manager editor renders one roster selector rather than one selector per team, avoiding a T×N option expansion. Projection indexes are derived, not extra world authority.

Limit: append-only full history and transactional world snapshots grow with game duration. Very long games with many manual reorganizations may accumulate historical edges; pruning/cohorts are future work. This phase verifies the stated ten-year stress and 3–100-person gameplay, not infinite-history performance.

# Performance and history growth

100 seeds × five years with independent replay: 3267 ms. 1000 employees × ten years including independent replay: 126067 ms. All six integrity counters are 0 in both runs. Stress hash 800102637f6597f01d58009c96b374963582a125401ac6496a848a2e907295c4 matches the released Phase 2 reference exactly.

Actual stress world: 1000 active people, 1998 relationships, 4877 events, 3849 memories; observed ending heap 119 MiB. Reference runtime 105975 ms vs current 126067 ms was measured under differing concurrent audit/build workload; no exact timing parity or controlled speedup/regression claim is made. Counts/hash are unchanged and no core quadratic regression was introduced.

Diagnostic benchmarks are more expensive than the baseline because they take weekly detached snapshots and process long histories plus independently replay each complete command history. Normal production paths do not import scripts/retention. Fresh events are bucketed once and management/tie indexes are derived in O(N+E). No new all-to-all graph, full renewal cycle or history rewrite was added. A redundant full production projection at non-decision weeks was removed from the diagnostic runner; this changes no decisions or world rules.

## Actual save/history observations

| Horizon / policy | Max events | Max commands | Max memories | Max relationships | Max save bytes | Median load ms |
|---|---:|---:|---:|---:|---:|---:|
| 1826 / passive | 323 | 262 | 7 | 4 | 122966 | 1.27 |
| 1826 / conservative | 358 | 270 | 16 | 10 | 136797 | 6.957 |
| 1826 / aggressive | 29 | 19 | 4 | 10 | 18645 | 1.263 |
| 1826 / employee-first | 41 | 34 | 2 | 4 | 18474 | 1.151 |
| 1826 / product-first | 36 | 25 | 4 | 6 | 18140 | 1.15 |
| 1826 / lean | 337 | 265 | 5 | 4 | 126084 | 6.563 |
| 1826 / management-first | 363 | 272 | 19 | 11 | 139652 | 9.299 |
| 1826 / career-development | 358 | 273 | 17 | 10 | 136797 | 8.692 |
| 1826 / ignore-concerns | 358 | 270 | 16 | 10 | 136797 | 9.237 |
| 1826 / salary-only | 358 | 271 | 16 | 10 | 136797 | 7.3 |
| 1826 / promotion-first | 359 | 272 | 17 | 10 | 137836 | 7.939 |
| 1826 / manager-first | 358 | 270 | 16 | 10 | 136797 | 14.36 |
| 1826 / balanced-retention | 359 | 272 | 17 | 10 | 137836 | 7.602 |
| 3652 / conservative | 737 | 531 | 19 | 10 | 270375 | 15.838 |
| 3652 / lean | 695 | 526 | 5 | 4 | 252224 | 13.241 |
| 3652 / management-first | 737 | 533 | 21 | 11 | 271114 | 14.332 |
| 3652 / career-development | 736 | 534 | 20 | 10 | 270270 | 22.191 |

Controlled max save bytes 413628, events 1088, commands 786. Raw rows also record finance history length, transaction/command growth, post-run heap and actual validated JSON load time (not replay time). Salary history is retained in saves. All memory counts remain bounded per employee; historical employees/events/commands are intentionally retained.

Append-only history and transactional snapshots still grow with duration and manual decisions; weekly diagnostic stepping adds more commands than one long AdvanceTime. This is a cost observation, not evidence requiring a major architecture rewrite. No hidden telemetry is sent to a server. Final 1000-person UI check rendered 25 rows, navigation during simulation 145 ms, week and navigation 1225 ms; measured under concurrent local workload.


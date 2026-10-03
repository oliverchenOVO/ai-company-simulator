# Retention pacing audit

Released simulation v3, unchanged equations. 35 controlled runs (five seeds × seven scenarios), 90 matched branches; horizon 3652 days; runtime 242262 ms, failures 0. Raw evidence: data/controlled.json. Normal-policy evidence: STRATEGY_BENCHMARK.md.

## Measurement and limits

Developer-only retentionFactors recomputes the post-tick compensation, burnout, dissatisfaction, loyalty and organizational target using the production helper. Weekly career processing follows psychology, so a post-tick target is not falsely labelled the exact target used earlier that day. World state is detached and never mutated. Indexes are O(N+E), fresh events are bucketed by employee, and diagnostic fields never enter CompanyView policy inputs.

State samples occur every seven days, aligned to weekly resignation evaluation. Intent ≥20 is an analytic mild-risk cutoff matching the low-stage reset boundary, not a public probability. Intent >55 is the actual search threshold. Evaluation is counted at aligned searching/departure ticks; public event dates are exact. First exposed person-level signal can be a qualitative manager/health state as well as a warning event. It records information available to a player, not when a real player noticed it. Sampled threshold/resolution times have up to six days uncertainty. Concern episodes combine current public employee-level signals; they are not solely career-warning durations. Event history plus goal traces identifies career-specific persistence.

## Pipeline explanation

v3 updates stress and burnout, smooths satisfaction, updates loyalty/company trust, then smooths exit intent toward a bounded target. A non-CEO intent >30 can emit a public concern (episode/action bounded). Concerned intent >55 enters private search. Searching people receive weekly deterministic contextual draws at intent/100 × 0.08; once searching they remain eligible even below 55 until intent drops below 20. The random draw is downstream: increasing it would not help an employee who never searches.

Career frustration contributes at most 30 to the target directly, plus its influence on satisfaction. Under sustainable work, adequate compensation and support, stress/burnout reach low levels and ties buffer risk. At high satisfaction loyalty can rise despite persistent career frustration. Company trust is affected by goals but is not a separate direct exit-target term. These interactions, rather than a missing RNG opportunity, explain stable unresolved warnings below search.

## Controlled scenario findings

| Scenario | Resignations (all people) | Focal resigned /5 | Focal sampled peak intent range | Focal sampled peak stress range | Longest open concern days |
|---|---:|---:|---:|---:|---:|
| career-stagnation | 0 | 0 | 0.004–29.990 | 15.000–15.000 | 3519 |
| poor-manager | 0 | 0 | 3.512–34.918 | 15.000–15.000 | 3652 |
| underpayment | 0 | 0 | 1.890–33.290 | 15.000–15.000 | 3519 |
| team-instability | 0 | 0 | 4.814–34.574 | 15.000–15.000 | 3519 |
| combined-moderate | 0 | 0 | 4.456–38.704 | 15.000–15.000 | 3533 |
| combined-pressure | 55 | 5 | 55.903–73.063 | 55.447–88.636 | 0 |
| sustained-growth | 15 | 5 | 76.989–99.991 | 100.000–100.000 | 0 |

Capitalized NT$100m origins isolate organization from bankruptcy; this is not a redesigned Garage economy. All scenarios use real commands and generated employees; hidden state is never injected. Focal employee identity is held at employee-5 across scenarios. Four of the five seeds generate advancement goals; benchmark-010 is the recorded mastery negative control, not falsely called ambitious career stagnation. Additional hires create actual load under the weak CTO in manager/mixed cases. Underpayment is halfway between the candidate minimum and expectation, safely accepted.

A: sustainable stagnation with unchanged adequate pay; B: weak overloaded manager, adequate pay, sustainable work; C: legally modest underpayment, sustainable work; D: balanced work plus actual transfers every 14 days. E combined-moderate uses balanced (not growth) work, modest mismatch, weak managers and 28-day manager changes. Combined-pressure is separate: 14-day transfers can progressively deplete stability and create high stress; departures there do not establish that moderate problems suffice. Sustained-growth is the explicit pressure positive control. Initial values are generated, not artificially set to exit thresholds.

Controlled resignations: 70. Available-signal lead time range 210–1176 days; missing public leads 0. Zero-positive-cause departures 0. A long warning window is an opportunity, not proof anyone understood it. Pressure cases show real public warning records before departure, but some warnings remain open for years in retained/mild-risk cases. Both findings matter.

Actual person-specific public warning-event lead time is **110–742 days**, with 0 missing warning events; serious-warning lead is **110–719 days**. This differs from the first available qualitative signal, which may already expose weak support before a dated warning event. All raw people records retain first sampled hidden risk, first public signal, first serious warning and departure separately.

The 13-policy five-year cohort has 4,640 eligible employee instances across independent worlds: 1,029 public concern entries, 7 generic retention concern entries, and 0 high-intent/search/evaluation/departure entries. All four required ten-year policy cohorts also have 0 evaluation entries. Thus neither an insufficient five-year horizon nor a conservative downstream random draw explains these cases. Intent smoothing can converge, but its target remains below search; goal concern thresholds are crossed and observable. These policies mostly keep small, adequately supported rosters, while aggressive economic failures terminate early. No blanket assertion is made that every larger or badly managed company must have the same result.

## Matched interventions (728 days after day 182)

| Seed / scenario / action | Focal outcome | Final intent | Career frustration | Post-branch work | Last contract salary NT$ | Final manager trust | Team coordination | Team ties |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| career-3 / career-stagnation / ignore | active | 29.990 | 100.000 | 521.040 | 35530.80 | 71.720 | 80.619 | 50.000 |
| career-3 / career-stagnation / salary | active | 29.990 | 100.000 | 521.113 | 39083.88 | 71.720 | 80.619 | 50.000 |
| career-3 / career-stagnation / promotion | active | 5.367 | 0.000 | 537.316 | 35530.80 | 72.177 | 80.785 | 50.000 |
| career-3 / career-stagnation / manager | active | 29.990 | 100.000 | 521.040 | 35530.80 | 71.720 | 80.619 | 50.000 |
| career-3 / career-stagnation / transfer | active | 27.723 | 100.000 | 525.382 | 35530.80 | 71.720 | 83.985 | 69.276 |
| career-3 / career-stagnation / management-promotion | active | 5.367 | 0.000 | 456.686 | 35530.80 | 72.177 | 80.785 | 50.000 |
| career-3 / poor-manager / ignore | active | 33.389 | 100.000 | 488.170 | 35530.80 | 39.905 | 70.119 | 50.000 |
| career-3 / poor-manager / salary | active | 33.389 | 100.000 | 488.248 | 39083.88 | 39.905 | 70.119 | 50.000 |
| career-3 / poor-manager / promotion | active | 7.871 | 0.000 | 505.316 | 35530.80 | 40.228 | 70.231 | 50.000 |
| career-3 / poor-manager / manager | active | 29.990 | 100.000 | 517.857 | 35530.80 | 69.828 | 80.488 | 50.000 |
| career-3 / poor-manager / transfer | active | 28.501 | 100.000 | 499.352 | 35530.80 | 70.610 | 70.767 | 62.772 |
| career-3 / poor-manager / management-promotion | active | 7.871 | 0.000 | 429.589 | 35530.80 | 40.228 | 70.231 | 50.000 |
| career-3 / combined-moderate / ignore | active | 36.956 | 100.000 | 611.265 | 33185.77 | 51.617 | 73.080 | 50.000 |
| career-3 / combined-moderate / salary | active | 31.479 | 100.000 | 621.341 | 39083.88 | 51.617 | 73.080 | 50.000 |
| career-3 / combined-moderate / promotion | active | 9.739 | 0.000 | 634.247 | 33185.77 | 51.781 | 73.139 | 50.000 |
| career-3 / combined-moderate / manager | active | 36.844 | 100.000 | 610.872 | 33185.77 | 51.691 | 73.713 | 50.000 |
| career-3 / combined-moderate / transfer | active | 35.512 | 100.000 | 592.538 | 33185.77 | 52.295 | 69.339 | 62.971 |
| career-3 / combined-moderate / management-promotion | active | 9.739 | 0.000 | 538.762 | 33185.77 | 51.781 | 73.139 | 50.000 |
| benchmark-010 / career-stagnation / ignore | active | 0.004 | 0.000 | 502.392 | 34144.56 | 72.793 | 80.977 | 50.000 |
| benchmark-010 / career-stagnation / salary | active | 0.004 | 0.000 | 502.461 | 37559.02 | 72.793 | 80.977 | 50.000 |
| benchmark-010 / career-stagnation / promotion | active | 5.348 | 0.000 | 491.118 | 34144.56 | 73.290 | 81.144 | 50.000 |
| benchmark-010 / career-stagnation / manager | active | 0.004 | 0.000 | 502.392 | 34144.56 | 72.793 | 80.977 | 50.000 |
| benchmark-010 / career-stagnation / transfer | active | 0.004 | 0.000 | 506.422 | 34144.56 | 72.793 | 84.308 | 69.567 |
| benchmark-010 / career-stagnation / management-promotion | active | 5.348 | 0.000 | 417.371 | 34144.56 | 73.290 | 81.144 | 50.000 |
| benchmark-010 / poor-manager / ignore | active | 2.794 | 0.000 | 471.562 | 34144.56 | 38.972 | 69.810 | 50.000 |
| benchmark-010 / poor-manager / salary | active | 2.794 | 0.000 | 471.674 | 37559.02 | 38.972 | 69.810 | 50.000 |
| benchmark-010 / poor-manager / promotion | active | 8.076 | 0.000 | 460.383 | 34144.56 | 39.295 | 69.923 | 50.000 |
| benchmark-010 / poor-manager / manager | active | 0.010 | 0.000 | 500.412 | 34144.56 | 70.776 | 80.838 | 50.000 |
| benchmark-010 / poor-manager / transfer | active | 0.010 | 0.000 | 481.869 | 34144.56 | 71.549 | 70.534 | 62.551 |
| benchmark-010 / poor-manager / management-promotion | active | 8.076 | 0.000 | 391.126 | 34144.56 | 39.295 | 69.923 | 50.000 |
| benchmark-010 / combined-moderate / ignore | active | 3.499 | 0.000 | 589.522 | 32847.07 | 45.876 | 71.344 | 50.000 |
| benchmark-010 / combined-moderate / salary | active | 1.599 | 0.000 | 594.736 | 37559.02 | 45.876 | 71.344 | 50.000 |
| benchmark-010 / combined-moderate / promotion | active | 8.608 | 0.000 | 575.962 | 32847.07 | 46.043 | 71.401 | 50.000 |
| benchmark-010 / combined-moderate / manager | active | 2.938 | 0.000 | 589.708 | 32847.07 | 46.009 | 71.713 | 50.000 |
| benchmark-010 / combined-moderate / transfer | active | 1.439 | 0.000 | 574.519 | 32847.07 | 45.890 | 68.908 | 62.746 |
| benchmark-010 / combined-moderate / management-promotion | active | 8.608 | 0.000 | 489.520 | 32847.07 | 46.043 | 71.401 | 50.000 |

Each branch starts at the same hash, retains its actual commands, and independently replays/restores. Empty interventionCommands identifies a true no-op (e.g. already with the CEO); no-op branches are not described as successful interventions. Last contract salary is a monthly commitment, not cumulative salary expense or pay after departure. Final cash, product, team output and supporting traces remain in raw rows. Ongoing manager/transfer actions continue equally in all matched branches, so a one-time manager assignment may be overridden later; this tests a limited intervention in continuing conditions, not a permanent structural cure.

Specialist promotion resolves advancement goals in the stagnation branch while salary-only does not. A mastery employee can gain unmet pay expectations from a promotion instead of gaining a career remedy. Management-track promotion reduces individual allocation without automatically assigning reports or raising leadership skills. Management capacity formula remains unchanged by title; stress may subsequently change derived capacity. Measured work/cash/team consequences are branch-specific and should not be described as a universal management bonus.

## Concern fatigue, escalation and renewal

CareerConcernRaised and CareerGoalBlocked crossings are visible without monthly repeats in untouched stagnant runs. Repeated fresh decisions can legitimately create new generic concern episodes; this is not blanket suppression. A warning escalating to blocked career progress can still stay below search for the whole ten years. Promotion can resolve the career component gradually, while other manager/health concerns may remain. Completed primary advancement goals remain complete and do not regenerate: late career gameplay can become inert. A renewal mechanism is a candidate for later evidence-backed v4 or Phase 3 scope, not implemented automatically.

## Decision

**FURTHER PHASE 2.5 ITERATION REQUIRED.** Departures are possible and causal under pressure, but normal/mild mixed-risk warning cadence and completed-goal inertia remain concerns. Human comprehension is unverified. Do not declare readiness merely because controlled pressure can trigger resignations. Retain v3 and document calibration candidates; do not increase probability or target a fixed resignation rate.

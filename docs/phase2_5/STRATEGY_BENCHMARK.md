# Strategy and retention funnel evidence

All 100 shared seeds are benchmark-001…100. Original eight decision policies are retained; five retention policies are added. All policies receive only production CompanyView. New policies share Conservative finances, with visible concern responses; their financial guard may prevent intervention. Ignore concerns means no extra retention action, not ignoring financial warnings. No diagnostic truth informs policy choices.

Decisions use a uniform 14-day schedule with seven-day diagnostic samples. This differs from the old benchmark's checkpoint-adjusted decision dates; compare policies within this experiment, not as an exact reproduction of old strategy hashes. Each actual command history independently replays/restores. Bankrupt games stop; effective horizon is their final tick, not a fictional ten-year continuation.

## 1826 days

100 seeds per policy; runtime 997238 ms including diagnostics and independent replay; integrity failures 0.

| Policy | Survive /100 | Final headcount median | Resignations | Promotions | Overloads | Career concerns | Median tenure days | Survivor median cash NT$ | Survivor median MRR NT$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| passive | 2 | 3.0 | 0 | 0 | 0 | 36 | 182.0 | 9984414.275 | 455156.0 |
| conservative | 100 | 4.0 | 0 | 0 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| aggressive | 0 | 6.0 | 0 | 0 | 0 | 0 | 91.0 | None | None |
| employee-first | 0 | 3.0 | 0 | 0 | 0 | 36 | 182.0 | None | None |
| product-first | 0 | 4.0 | 0 | 0 | 0 | 3 | 126.0 | None | None |
| lean | 69 | 2.0 | 0 | 0 | 0 | 36 | 122.5 | 8593074.28 | 343384 |
| management-first | 100 | 4.0 | 0 | 99 | 0 | 91 | 1154 | 7253020.055 | 358740.5 |
| career-development | 100 | 4.0 | 0 | 61 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| ignore-concerns | 100 | 4.0 | 0 | 0 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| salary-only | 100 | 4.0 | 0 | 0 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| promotion-first | 100 | 4.0 | 0 | 117 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| manager-first | 100 | 4.0 | 0 | 0 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |
| balanced-retention | 100 | 4.0 | 0 | 117 | 0 | 125 | 1154 | 7253020.055 | 358740.5 |

| Policy | Eligible created | Intent ≥20 | Public concerns | Retention concerns | Serious warnings | Intent >55 | Evaluated people | Evaluations | Resigned |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| passive | 200 | 0 | 36 | 0 | 0 | 0 | 0 | 0 | 0 |
| conservative | 405 | 117 | 119 | 2 | 117 | 0 | 0 | 0 | 0 |
| aggressive | 500 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| employee-first | 200 | 0 | 36 | 0 | 0 | 0 | 0 | 0 | 0 |
| product-first | 300 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| lean | 200 | 25 | 36 | 0 | 35 | 0 | 0 | 0 | 0 |
| management-first | 405 | 83 | 85 | 0 | 83 | 0 | 0 | 0 | 0 |
| career-development | 405 | 58 | 119 | 0 | 58 | 0 | 0 | 0 | 0 |
| ignore-concerns | 405 | 117 | 119 | 2 | 117 | 0 | 0 | 0 | 0 |
| salary-only | 405 | 117 | 119 | 1 | 117 | 0 | 0 | 0 | 0 |
| promotion-first | 405 | 0 | 119 | 0 | 0 | 0 | 0 | 0 | 0 |
| manager-first | 405 | 117 | 119 | 2 | 117 | 0 | 0 | 0 | 0 |
| balanced-retention | 405 | 0 | 119 | 0 | 0 | 0 | 0 | 0 | 0 |

Hidden and public concern columns are overlapping sets, not a strictly nested funnel: a visible career or manager signal can precede intent ≥20. CEO is excluded from eligible people. Serious warning includes CareerGoalBlocked and EmployeeConcernRaised; Retention concerns counts actual EmployeeConcernRaised. All tenure medians include eligible retained and departed employees at their final observed date. Survivor cash/MRR medians exclude failed companies and cannot establish universal optimality.

## 3652 days

100 seeds per policy; runtime 1403269 ms including diagnostics and independent replay; integrity failures 0.

| Policy | Survive /100 | Final headcount median | Resignations | Promotions | Overloads | Career concerns | Median tenure days | Survivor median cash NT$ | Survivor median MRR NT$ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| conservative | 100 | 4.0 | 0 | 0 | 0 | 125 | 2980 | 24248840.18 | 441761.5 |
| lean | 69 | 2.0 | 0 | 0 | 0 | 36 | 122.5 | 27595841.14 | 421763 |
| management-first | 100 | 4.0 | 0 | 99 | 0 | 91 | 2980 | 24248840.18 | 441761.5 |
| career-development | 100 | 4.0 | 0 | 61 | 0 | 125 | 2980 | 24248840.18 | 441761.5 |

| Policy | Eligible created | Intent ≥20 | Public concerns | Retention concerns | Serious warnings | Intent >55 | Evaluated people | Evaluations | Resigned |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| conservative | 405 | 117 | 119 | 2 | 117 | 0 | 0 | 0 | 0 |
| lean | 200 | 25 | 36 | 0 | 35 | 0 | 0 | 0 | 0 |
| management-first | 405 | 83 | 85 | 0 | 83 | 0 | 0 | 0 | 0 |
| career-development | 405 | 58 | 119 | 0 | 58 | 0 | 0 | 0 | 0 |

Hidden and public concern columns are overlapping sets, not a strictly nested funnel: a visible career or manager signal can precede intent ≥20. CEO is excluded from eligible people. Serious warning includes CareerGoalBlocked and EmployeeConcernRaised; Retention concerns counts actual EmployeeConcernRaised. All tenure medians include eligible retained and departed employees at their final observed date. Survivor cash/MRR medians exclude failed companies and cannot establish universal optimality.

## Costs, stress and team state

Raw rows retain product progress/quality/debt, final teams, stress/instability sample counts, warning episodes, event types by year, tenure, save/load and final payroll-relevant salary state. Strategy outcomes alone do not prove a causal management advantage; use matched branches for that. Qualitative-only policies may take no manager action if available public support is adequate. No resignation quota was optimized.

# Simulation model v1

## Clock and ordering

Scenario date is 2026-01-01, tick 0. One AdvanceTime day increments UTC tick/date and executes this fixed order: psychology → work → relationships (tick divisible by 7) → product milestones → customers → market (tick divisible by 7) → finance. Finance closes the previous calendar month on day 1. Week cadence is relative to scenario tick, not weekday. The final day-1 step books the preceding month's active-day intervals. After bankruptcy the clock can still advance/replay, but operating systems stop. Normal UI time controls stop at bankruptcy.

Active employee order is stable by ID. Customer/relationship processing order is explicit. All randomness uses `random(seed, system, entity, tick, operation)`: SHA-256-derived Mulberry32 streams. Recruitment traits use stable identity contexts; resignation and churn use per-entity/date streams. Market/acquisition have independent contexts. No Math.random, real clock, network callback or async completion decides truth.

## Equations

All psychology/skills/personality/product/relationship scores are bounded [0,100]. Changing state quantities is rounded to 0.001; money is safe integer NT cents.

- Underpayment: clamp(1 − salary / max(1, expectedSalary), 0, 1).
- Memory effect: sum(sentiment × importance/100 × exp(−decayRate × age)). Keep at most 24 memories; importance ≥90 memories have zero decay.
- Daily stress delta: (workload − 0.9) × 1.8 + underpayment × 0.7 − 0.35.
- Burnout delta: (stress − 65)/100 if stress >65; otherwise −0.15.
- Satisfaction target: 78 − 0.23×stress − 0.25×burnout − 45×underpayment + 0.04×memoryEffect; approach by 2.5% per day.
- Loyalty delta: (satisfaction −60)×0.005. Company/manager trust and confidence approach their respective satisfaction/trust/performance targets at fixed rates.
- Exit target: 50×underpayment + 0.45×burnout + 1.2×max(0,65−satisfaction) + 0.35×max(0,50−loyalty); approach by 5% per day.
- Concern threshold >30, at most once every 30 days. Seeking stage >55 after concern. Searching non-CEO employees may resign weekly with probability exitIntent/100×0.08. The resignation event stores normalized structured cause weights and relevant event references. The CEO cannot resign or fire themselves.
- Work output: relevantSkill/100 × (0.55 + satisfaction/200) × (1 − burnout/150) × min(workload,1.15). Terminated/resigned employees produce no work. Strategy workload: balanced 1.0, growth 1.4, sustainable 0.8.
- Product progress per relevant employee: output×0.7 for features, output×0.32 otherwise. Quality gain: output×0.1 for quality, output×0.006 otherwise; excessive workload imposes a small penalty. Debt increases with feature output and decreases with quality/debt work. Milestones at 25/50/75/100%; launch at 100%.
- Directed relationships evolve weekly with same-team contact, individual stress and target performance. Trust crossing below35 emits a strained relationship event. There are no arbitrary fabricated conflict messages.
- Customer satisfaction approaches quality −0.2×debt +20 by 3% daily. Weekly churn probability: 0.006 + max(0,60−satisfaction)/500. A churn event classifies product experience or customer budget.
- Weekly acquisition after launch: clamp(0.12 + salesPower/300 + demand/500 + growthBonus,0,0.9). CEO/sales receive full sales contribution, others 10%. Seeded customer MRR is NT$2,500–6,500 or enterprise NT$12,000–22,000. Enterprise probability is 10%.
- Weekly demand change: integer random [−3,3] plus 5% movement toward60.

## Accounting

At month end, salaryHistory partitions each employee's time into rate intervals. Each interval overlaps [monthStartTick, monthEndTick), employment [hiredAt,leftAt), and its next rate boundary. Sum rate×activeDays/monthDays, round once per employee to cents. Hires, fires, resignations and same-day rate replacement are included correctly. Customer revenue similarly prorates acquisition/churn intervals. Cash += accruedRevenue − accruedPayroll − operatingCost. Initial payroll NT$95,000 and operating cost NT$10,000 yield NT$105,000 forecast burn.

Displayed MRR is the sum of active contracts, not a fabricated daily receipt. Forecast net burn = current payroll + operating cost − current MRR. Runway = max(0,cash/burn); null denotes non-positive net burn. Cash ≤0 after a financial close emits CompanyBankrupt and stops operations. No artificial bailouts.

## Hash and invariants

Canonical JSON sorts object keys recursively, rejects NaN/Infinity/undefined and preserves ordered arrays. Entities are keyed by stable ID; insertion order does not affect hashes. Ordered events, commands and memories carry semantics and are included. UI choices and narrative text are absent from WorldState. SHA-256 is synchronous and identical in Node/browser through the same portable implementation.

Development/test simulation checks each active tick: finite quantities, safe money, nonnegative salaries/revenue, unique entity IDs, valid references, single team membership by the scalar teamId model, no self manager, active manager references, valid employment dates, monotonic clock/date, and bounded psychology/relationships/products. Load adds complete Zod schema and command/event/cause history validation.

Benchmark dates include leap days: 1,826 days reach 2031-01-01; 3,652 reach 2036-01-01. Financial failure is an outcome, not numerical instability. The passive benchmark has no player interventions. The stress scenario explicitly uses 1,000 employees and NT$10 billion initial capital to sustain ten years of operating workload; the normal new-company flow always uses the contractual 3 employees/NT$500,000.


## Phase1.5B behavior versions

Application0.1.1 reads save envelope schema1 with simulationVersion1 or2. New games default to2; historical saves and command histories remain1 and replay with1. No migration rewrites employee expectations. Version1 retains salary-derived hiring expectation; version2 uses independent role/skill/personality expectation and deterministic offer acceptance. Shared systems are unchanged. Original golden.json is retained; golden-v2.json independently covers new behavior. See docs/phase1_5b/COMPATIBILITY.md and COMPENSATION_MODEL.md.

## Phase 2 scheduler (v3)

Daily order: organization index/support and team stability/coordination → psychology/retention → career (ticks divisible by 7) → work → event-anchored collaboration (weekly) → historical relationship system (no-op in v3) → product → customers → market (weekly) → calendar finance. Organization/career/collaboration are no-ops in v1/v2; original equation ordering is preserved. No separate monthly career randomness is added. Annual golden checkpoints use actual organizational histories.

V3 extends existing compensation/stress retention with career frustration, management support, stability, role fit and bounded team affinity. Unresolved generic retention concern is emitted once per episode (or after a subsequent management action); exit intent below 20 resets the settled episode. Career concerns have their own meaningful crossings at 20/55. This prevents monthly repetition without hiding a new worsening stage. Important interventions run through PromoteEmployee, AssignManager, AssignTeamManager and ChangeEmployeeRole. V1/v2 reject them. No LLM, cloud sync or Phase 3 subsystem was introduced.

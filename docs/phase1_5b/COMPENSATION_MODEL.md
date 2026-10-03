# Compensation model — proposed before implementation

Phase 1.5B changes compensation only. No changes to starting cash, monthly costs, acquisition, product or psychology coefficients.

## Independent recruitment anchor

Money remains integer NT cents. Role anchors are game design values, not real labor-market claims: CEO25k (founder stipend), CTO40k, Engineer30k, Designer30k, Sales30k, Operations28k. Relevant skills use existing productivity role mapping. Expectation = rounded cents of role anchor × (8,000 + round(skill×40)) /10,000 × (9,500 + round(ambition×10)) /10,000. Existing generated ordinary candidates have relevant skills65–90 (CTO engineering), ambition25–85; resulting role-relative expectation about1.034–1.201×anchor. Preference derives from personality already deterministically generated from seed/entity identity, without additional RNG consumption. Role and skill differences remain meaningful; the offer is never an input.

Minimum acceptable offer = ceiling(expected cents × (9,500 − round(riskTolerance×10))/10,000), using existing risk tolerance25–85 (86.5–92.5% of expectation). Accept iff offer >= minimum. Expectation and minimum are shown as legitimate recruitment guidance, with relevant skill. There is no probability roll, universal wage floor or negotiation game. Safe integer input and BigInt intermediate products prevent overflow/drift; rounding is half-up to a cent.

## Command semantics

HireEmployee remains one authoritative offer command. Same seed/current nextEntity/current tick produces identical candidate before and after preview; observation never consumes identity or RNG. Accepted actual salary equals offer; independent expectation persists. Rejection consumes one candidate identity, records a normal HireOfferRejected event and command, adds no employee/payroll/relationships and charges no fee. Repeated attempts cannot obtain a NT$1 candidate since every role anchor is positive. Invalid command is still a validation error and consumes nothing. Autosave durability applies to both accepted and rejected offers.

## Existing employees and salary history

Initial founding team has explicit contractual compensation commitments25k/40k/30k (additional stress-fixture staff30k), retaining the existing scenario. These commitments are not offers from the player. New hires use the independent anchor. Expectations remain fixed throughout Phase1.5B; no tick inflation, skill progression, promotions or review system. Existing bounded underpayment = clamp(1−actual/expected,0,1) continues driving stress, satisfaction and exit intent. Raises/cuts change actual salary/history/memory only; overpayment saturates at zero dissatisfaction. Zero salary cuts remain possible and will be separately probed for replacement/cut exploitation before claiming Phase2 readiness.

## Versions and boundaries

Choose simulation version preservation over migration: v1 retains exact salary-derived expectation/unconditional hire and original hashes. New default games use v2; restore/replay always select the recorded meta.simulationVersion. Only changed behavior branches; no duplicate engine. Save envelope schema1 remains unchanged; application0.1.1 supports world versions1/2. No world migration and no rewriting original fixtures. Unknown behavior versions fail validation. New v2 goldens are separate, old golden.json untouched and explicitly tested under v1. Extreme0/1/low offers reject; maximum legal offer100,000,000 cents can accept without changing expectation; above limit, unsafe, NaN/Infinity reject transactionally.

## Expected effect and validation plan

Close NT$1 hiring advantage at domain level; reasonable offers may accept with bounded underpayment tradeoffs. Run original tests with their original v1 semantics, new v2 model/replay/save/golden tests, six shared-seed strategies, derived salary bands, original exploit and immediate post-hire cut probe, matched no/one/multiple-hire branches. Record outcomes without broad economy tuning. Any remaining exploit blocks Phase2 recommendation.

## Evidence-backed amendment: salary proposal integrity

Initial candidate-only implementation found a second path:100 shared seeds, accepted fair offer followed immediately byNT$1 cut produced55 survivors vs0 for mid-band hires. Original evidence is compensation-before-cut-guard.json. V2 now treats a below-acceptance salary cut to a non-founder as a proposal: deterministic SalaryOfferRejected, original salary/history unchanged. Minimum uses the employee fixed expectation and existing risk tolerance with the same integer rounding as hiring. Legal cuts within acceptance range still generate SalaryChanged memory and sustained bounded underpayment. FounderCEO stipend reductions remain voluntary and cannot be used for ordinary recruits (HireEmployee excludesCEO). V1 cut behavior is preserved. This is the same compensation-consent defect, not a change to payroll, productivity or customer economics.

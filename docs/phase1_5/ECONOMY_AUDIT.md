# Existing economic equations — Phase1.5

Authoritative source: packages/simulation/src/systems.ts, scenario.ts and simulation.ts. Money is integer NT cents; values below use NT dollars. No equation changed.

|Mechanic|Current equation / behavior|Effective consequence|
|---|---|---|
|Initial capital|500,000|Same real-game configuration for every valid policy|
|Initial payroll|CEO25k + CTO40k + Engineer30k =95k|Operating10k gives105k monthly burn before revenue|
|Runway|cash / (payroll + operating cost − active-contract MRR), null when net burn≤0|Initial4.762months; current rates can hide already-earned payroll obligations|
|Monthly settlement|sum each salary rate × active calendar days/month days +10k cost; revenue from each contract × effective active days/month days|Raises/cuts/hires/firing/churn are prorated; cash changes at month boundary, not each workday|
|Bankruptcy|cash≤0 immediately after close|Stops operations; clock can replay forward; frozen contracts/roster do not mean continued service|
|Hiring fee|0|New payroll accrues immediately; higher headcount has no guaranteed proportional revenue|
|Salary expectation|initial offered salary, except0 uses30k fallback|NT$1 offers become NT$1 expectations: demonstrated pathological exploit; see cheap-offer-probe.json|
|Workload|sustainable0.8 / balanced1 / growth1.4|Work productivity caps its multiplier at1.15; stress still reflects full workload|
|Work productivity|role skill/100 × (0.55+satisfaction/200) × (1−burnout/150) × min(workload,1.15)|Qualitative worker health affects output; hidden scores are diagnostics only|
|Progress|non-Sales/non-Operations output ×0.7(features) or0.32(quality/debt), capped100|Fast launch trades debt; no second product/version after100|
|Quality|output ×0.1(quality) or0.006(other) − max(0,workload−1.1)×0.03 per producing employee|Sustained growth with many pressured low-output workers can harm experience|
|Debt|output ×−0.25(debt),0.018(features),−0.005(quality), bounded0…100|Quality and debt change customer experience; team assignment has no direct output multiplier|
|Acquisition|ONE weekly trial after launch: clamp(0.12+salesPower/300+demand/500+growthBonus0.15,0,0.9)|Capacity cap is one new contract per week for the whole company|
|Sales power|sum sales skill; CEO/Sales weight1, others0.1; active only|Extra engineers mainly accelerate launch, add little acquisition probability; Sales deserves a separate future policy study|
|Customer prices|90% uniform2,500…6,500;10% uniform12,000…22,000|Theoretical per-acquisition mean5,750; individual enterprise timing creates large seed variation|
|Customer satisfaction|EMA0.03 toward clamp(quality−0.2×debt+20)|Lagging experience can provide warning time; raw values are hidden from player|
|Weekly churn|0.006+max(0,60−satisfaction)/500|External/base churn persists even for happy clients; conditional product-experience risk rises below60|
|Resignation|non-CEO, staged concern/search, weekly seeded chance based on hidden intent|Salary cuts/workload can cause observable concern before departure; no invented recruiter or promotion system|

Theoretical customer-value mean is an equation calculation, not an observed human-play result. Acquisition probabilities and random thresholds are developer documentation only. Player UI shows qualitative statuses, real financial quantities and conditional accounting forecasts.

Measured causal probes:35k hire advances launch14days but spends96,041 more cash byday90;10k CTO raise costs30k over90days; sustainable vs growth launch79 vs56; quality-first unlaunched at90 vs features launch64. These explain why aggressive engineer hiring fails in this sample. This does not establish that all Sales-led or lower-cost growth policies fail.

The salary-offer exploit is unresolved. A future change must distinguish negotiated offer from market/role expectations with explicit new/legacy replay behavior. Do not guess a wage minimum, silently reinterpret old saves, or tune passive survival to50%.

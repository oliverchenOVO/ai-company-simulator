# Phase1.5 strategy benchmark

Policies review the production CompanyView every14 days. All commands are real player commands. No policy receives WorldState, private psychology, exact exit intent or random thresholds. Same seeds benchmark-001…100, NT$500,000, three founding employees. Monthly checkpoints at days90/181/365/730; day1826 includes the2028 leap day. Terminal checkpoint values carry forward frozen shutdown state, explicitly tagged terminalCarryForward. Diagnostic fields are post-run only. Every session independently replays its complete command history and round-trips a validated save.

- passive: advance only.
- conservative: sustainable workload; founder salary NT$10,000 from day0; features until launch, then quality; if runway<3 after launch, dismiss highest-paid non-founder while more than one remains; recruit an Engineer at NT$35,000 only when cash>NT$1m and runway>12, up to4 people.
- aggressive: growth workload, features until launch then quality; recruit Engineers at NT$35,000, up to6, while cash>NT$150k and runway>1.5.
- employee-first: sustainable workload; no cuts/recruitment; features then quality; observable distressed non-founders receive at most two10% raises if runway>3.
- product-first: balanced workload; one early Engineer if initial runway>4; features then quality.
- lean (sensitivity extension): sustainable, dismiss CTO at day0, retain founder salary NT$25,000 and Engineer salary NT$30,000; features then quality; no further recruitment. This tests a distinct cost path without founder pay deferral. It is a measured policy, not a product feature.

## 730 days — 100 seeds per policy

Runtime 48508ms; replay/restore mismatches 0. Six policies,600 sessions. Percentiles below are P10 / P50 / P90; NT dollars. No single combined score is used. Bankruptcy timing is conditional on failure; other columns include frozen terminal sessions. Surviving contracts and active roster in a stopped company are frozen bookkeeping, not continuing operations.

|Policy|Survive|Bankruptcy day|Cash|MRR|Payroll|Cumulative booked revenue|People|Customers|Runway (finite only)|
|---|---:|---|---|---|---|---|---|---|---|
|passive|3/100|151 / 181 / 181|-69,909 / -40,430 / -3,326|16,026 / 37,860 / 63,989|95,000 / 95,000 / 95,000|19,346 / 79,111 / 127,598|3 / 3 / 3|4 / 7 / 11|0 / 0 / 0|
|conservative|100/100|—|915,532 / 1,223,661 / 1,551,601|148,031 / 184,135 / 238,492|40,000 / 110,000 / 110,000|1,723,869 / 2,206,743 / 2,691,046|2 / 4 / 4|27 / 33 / 39|—|
|aggressive|0/100|90 / 90 / 90|-70,801 / -60,124 / -37,312|14,237 / 28,577 / 43,303|200,000 / 200,000 / 200,000|11,780 / 22,457 / 45,268|6 / 6 / 6|3 / 5 / 6|0 / 0 / 0|
|employee-first|0/100|151 / 181 / 181|-70,009 / -27,550 / -5,187|12,155 / 32,462 / 54,361|95,000 / 95,000 / 95,000|11,156 / 59,013 / 102,450|3 / 3 / 3|2 / 6 / 9|0 / 0 / 0|
|product-first|0/100|120 / 120 / 120|-53,248 / -32,474 / -9,535|13,920 / 27,466 / 49,948|130,000 / 130,000 / 130,000|14,764 / 29,443 / 57,102|4 / 4 / 4|3 / 5 / 7|0 / 0 / 0|
|lean|73/100|273 / 273 / 334|-13,454 / 797,327 / 1,413,705|35,273 / 169,380 / 224,716|55,000 / 55,000 / 55,000|79,024 / 1,857,327 / 2,473,705|2 / 2 / 2|8 / 30 / 36|0 / 0 / 0|

|Policy|Resignations total|Churn total|Launch day P10/50/90|Major events P10/50/90|Warnings P10/50/90|Longest important-event gap P10/50/90|
|---|---:|---:|---|---|---|---|
|passive|0|67|62 / 66 / 71|6 / 6 / 8|3 / 4 / 4|65 / 110 / 119|
|conservative|0|1000|80 / 85 / 91|13 / 16 / 20|1 / 1 / 1|119 / 183 / 280|
|aggressive|0|11|35 / 36 / 38|6 / 6 / 6|2 / 2 / 2|49 / 53 / 55|
|employee-first|0|25|77 / 82 / 88|6 / 6 / 7|3 / 4 / 4|61 / 76 / 101|
|product-first|0|21|47 / 50 / 54|6 / 6 / 7|3 / 3 / 3|54 / 69 / 74|
|lean|0|695|114 / 123 / 131|8 / 14 / 18|0 / 2 / 5|112 / 175 / 252|

|Policy|3mo survive|6mo survive|12mo survive|24mo survive|Stable employee share mean at3/6/12/24mo|
|---|---|---|---|---|---|
|passive|100/100|9/100|3/100|3/100|100.0% / 100.0% / 100.0% / 100.0%|
|conservative|100/100|100/100|100/100|100/100|100.0% / 100.0% / 100.0% / 100.0%|
|aggressive|0/100|0/100|0/100|0/100|100.0% / 100.0% / 100.0% / 100.0%|
|employee-first|100/100|3/100|0/100|0/100|100.0% / 100.0% / 100.0% / 100.0%|
|product-first|100/100|0/100|0/100|0/100|100.0% / 100.0% / 100.0% / 100.0%|
|lean|100/100|100/100|74/100|73/100|100.0% / 100.0% / 100.0% / 100.0%|

## 1826 days — 100 seeds per policy

Runtime 202601ms; replay/restore mismatches 0. Six policies,600 sessions. Percentiles below are P10 / P50 / P90; NT dollars. No single combined score is used. Bankruptcy timing is conditional on failure; other columns include frozen terminal sessions. Surviving contracts and active roster in a stopped company are frozen bookkeeping, not continuing operations.

|Policy|Survive|Bankruptcy day|Cash|MRR|Payroll|Cumulative booked revenue|People|Customers|Runway (finite only)|
|---|---:|---|---|---|---|---|---|---|---|
|passive|3/100|151 / 181 / 181|-69,909 / -40,430 / -3,326|16,026 / 37,860 / 63,989|95,000 / 95,000 / 95,000|19,346 / 79,111 / 127,598|3 / 3 / 3|4 / 7 / 11|0 / 0 / 0|
|conservative|100/100|—|5,343,232 / 7,256,831 / 9,031,340|297,641 / 360,706 / 412,261|110,000 / 110,000 / 110,000|10,412,299 / 12,486,228 / 14,414,007|4 / 4 / 4|54 / 63 / 71|—|
|aggressive|0/100|90 / 90 / 90|-70,801 / -60,124 / -37,312|14,237 / 28,577 / 43,303|200,000 / 200,000 / 200,000|11,780 / 22,457 / 45,268|6 / 6 / 6|3 / 5 / 6|0 / 0 / 0|
|employee-first|0/100|151 / 181 / 181|-70,009 / -27,550 / -5,187|12,155 / 32,462 / 54,361|95,000 / 95,000 / 95,000|11,156 / 59,013 / 102,450|3 / 3 / 3|2 / 6 / 9|0 / 0 / 0|
|product-first|0/100|120 / 120 / 120|-53,248 / -32,474 / -9,535|13,920 / 27,466 / 49,948|130,000 / 130,000 / 130,000|14,764 / 29,443 / 57,102|4 / 4 / 4|3 / 5 / 7|0 / 0 / 0|
|lean|73/100|273 / 273 / 334|-13,454 / 7,626,402 / 10,617,176|35,273 / 323,997 / 393,244|55,000 / 55,000 / 55,000|79,024 / 11,026,402 / 14,017,176|2 / 2 / 2|8 / 56 / 67|0 / 0 / 0|

|Policy|Resignations total|Churn total|Launch day P10/50/90|Major events P10/50/90|Warnings P10/50/90|Longest important-event gap P10/50/90|
|---|---:|---:|---|---|---|---|
|passive|0|197|62 / 66 / 71|6 / 6 / 8|3 / 4 / 4|65 / 110 / 119|
|conservative|0|5661|80 / 85 / 91|55 / 62 / 72|1 / 1 / 1|133 / 190 / 280|
|aggressive|0|11|35 / 36 / 38|6 / 6 / 6|2 / 2 / 2|49 / 53 / 55|
|employee-first|0|25|77 / 82 / 88|6 / 6 / 7|3 / 4 / 4|61 / 76 / 101|
|product-first|0|21|47 / 50 / 54|6 / 6 / 7|3 / 3 / 3|54 / 69 / 74|
|lean|0|4019|114 / 123 / 131|8 / 57 / 68|0 / 2 / 5|115 / 175 / 252|

## Interpretation and limitations

Conservative survives100/100; lean73/100; passive3/100; the sampled aggressive, employee-first and product-first policies0/100 at both horizons. Conservative dominates survival within this set, a potential design concern; this does not establish global optimality. Lean demonstrates a second viable, riskier path without reducing CEO salary. Aggressive hiring does not outperform conservative here. More engineers accelerate launch but recurring cost can outpace the single weekly customer-acquisition opportunity. Acquisition pace, rather than development capacity alone, limits early hiring returns. Employee stability alone cannot pay payroll. Salary raises above already-met expectations have modest production effects and real cash costs. No normal policy session produced resignation before insolvency; employee drama was investigated separately with actual underpayment and post-survival workload commands.

“Recovery events” in raw rows count transitions from runway<3 to>=3 between policy observations while alive. These can be temporary changes between monthly closes; passive has such transitions too. They must NOT be interpreted as intervention success. The controlled financial and employee branches provide the causal recovery evidence. FailureFactors allow multiple contributing classifications. Hiring exposure is association, not proof that any hire alone caused failure; independent branch comparisons isolate a decision. Monthly MRR is not booked revenue. Numeric runway percentiles exclude self-sufficient/null values and round for table readability; raw JSON retains exact values and per-seed outcomes. Health summaries are qualitative categories, not hidden scores; bankrupt rosters are frozen, so “healthy” does not mean an operational firm. No human study has validated the10-second urgency target.

Raw evidence: data/strategies-730.json, strategies-1826.json, decision-branches.json, warning-traces.json and representative validated saves. Counterfactual CLI: pnpm exec tsx scripts/counterfactual.ts input.json output.json; input {save,a:[commands],b:[commands],days}. Omniscient diagnostic output stays developer-only.

## Pathological offer probe — a release concern

Ten shared seeds benchmark-001…010, same aggressive policy but each new offer is NT$1/month. 9/10 survive2years, compared with0/10 at NT$35,000. This is a deliberately pathological legal-input sensitivity, not a recommended strategy and not combined with the normal strategy ranking. New expectations initialize to the offered wage (NT$1), so low offered wages are treated as meeting expectations. This supports a concrete balance exploit, not “active management mastery.” No salary minimum or expectation equation was changed: choosing market expectations/minimum offers and replay-version behavior needs explicit evidence-backed iteration. Raw: data/cheap-offer-probe.json.

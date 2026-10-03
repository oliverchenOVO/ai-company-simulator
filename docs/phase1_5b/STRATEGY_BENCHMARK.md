# Strategy benchmark — compensation v2

100 identical shared seeds benchmark-001…100 per policy, real commands, production CompanyView only. Same six14-day policies as Phase1.5.2-year730days and5-year1826days. Founder voluntary stipend10k, base35k hires, no hidden psychology policy input. Bankruptcy metrics carry forward frozen terminal states; finalMRR/payroll of bankrupt companies are not ongoing operations. Distributions below are min/P25/median/P75/max; revenue is actual cumulative booked cash, MRR is current contracts. Raw checkpoints90/181/365/730 include health/warnings/recoveries/events.

## 730 days

Runtime 25,663ms; independent replay and validated save round-trip mismatches0.

|Policy|v1 survivors|v2 survivors|Cash NT$ distribution|MRR NT$ distribution|Total hires/rejections|
|---|---:|---:|---|---|---|
|passive|3/100|3/100|-82,120.34 / -57,837.98 / -39,833.50 / -13,844.45 / 1,590,936.24|6,413.00 / 31,623.00 / 37,904.00 / 51,508.00 / 283,082.00|0/0|
|conservative|100/100|100/100|667,166.34 / 1,079,409.26 / 1,236,916.22 / 1,380,546.01 / 2,117,002.62|108,566.00 / 167,385.00 / 184,568.00 / 210,644.00 / 272,742.00|149/0|
|lean|73/100|73/100|-42,299.66 / -1,348.96 / 814,559.69 / 1,198,493.06 / 2,364,436.29|11,332.00 / 72,734.00 / 169,935.00 / 202,370.00 / 285,150.00|0/0|
|aggressive|0/100|0/100|-76,336.75 / -64,076.42 / -59,955.20 / -46,364.99 / -1,361.24|6,952.00 / 20,532.00 / 28,665.00 / 37,767.00 / 72,476.00|300/0|
|employee-first|0/100|0/100|-84,526.98 / -59,214.44 / -26,942.72 / -9,262.24 / -873.40|4,081.00 / 18,278.00 / 32,876.00 / 43,484.00 / 86,254.00|0/0|
|product-first|0/100|0/100|-95,587.44 / -40,675.58 / -32,239.84 / -20,451.35 / -1,918.01|2,655.00 / 20,332.00 / 27,801.00 / 39,168.00 / 81,363.00|100/0|

passive: bankruptcy day 151.00 / 181.00 / 181.00 / 181.00 / 212.00; launch day 60.00 / 64.00 / 66.00 / 69.00 / 73.00; payroll 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00; booked revenue 7,178.18 / 60,310.91 / 79,412.45 / 105,871.26 / 3,610,936.24; customers 2.00 / 6.00 / 8.00 / 9.00 / 44.00; active staff 3.00 / 3.00 / 3.00 / 3.00 / 3.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

conservative: bankruptcy day —; launch day 77.00 / 83.00 / 85.00 / 88.00 / 93.00; payroll 10,000.00 / 40,000.00 / 110,000.00 / 110,000.00 / 115,000.00; booked revenue 1,141,426.16 / 1,935,162.24 / 2,219,781.33 / 2,443,212.68 / 3,486,314.45; customers 22.00 / 30.00 / 33.00 / 35.00 / 45.00; active staff 1.00 / 2.00 / 4.00 / 4.00 / 4.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

lean: bankruptcy day 243.00 / 273.00 / 273.00 / 334.00 / 396.00; launch day 113.00 / 117.00 / 123.00 / 128.00 / 132.00; payroll 55,000.00 / 55,000.00 / 55,000.00 / 55,000.00 / 55,000.00; booked revenue 18,651.04 / 276,513.03 / 1,874,559.69 / 2,258,493.06 / 3,424,436.29; customers 3.00 / 14.00 / 30.00 / 33.00 / 42.00; active staff 2.00 / 2.00 / 2.00 / 2.00 / 2.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

aggressive: bankruptcy day 90.00 / 90.00 / 90.00 / 90.00 / 90.00; launch day 34.00 / 36.00 / 36.00 / 37.00 / 39.00; payroll 200,000.00 / 200,000.00 / 200,000.00 / 200,000.00 / 200,000.00; booked revenue 6,243.90 / 18,504.23 / 22,625.45 / 36,215.66 / 81,219.41; customers 2.00 / 4.00 / 5.00 / 6.00 / 7.00; active staff 6.00 / 6.00 / 6.00 / 6.00 / 6.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

employee-first: bankruptcy day 151.00 / 151.00 / 181.00 / 181.00 / 212.00; launch day 75.00 / 80.00 / 82.00 / 85.00 / 90.00; payroll 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00; booked revenue 3,260.20 / 18,481.47 / 59,990.87 / 77,543.94 / 229,456.26; customers 1.00 / 4.00 / 6.00 / 7.00 / 11.00; active staff 3.00 / 3.00 / 3.00 / 3.00 / 3.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

product-first: bankruptcy day 120.00 / 120.00 / 120.00 / 120.00 / 151.00; launch day 45.00 / 49.00 / 50.00 / 52.00 / 56.00; payroll 130,000.00 / 130,000.00 / 130,000.00 / 130,000.00 / 130,000.00; booked revenue 88.50 / 21,792.12 / 29,634.49 / 46,370.10 / 180,238.67; customers 1.00 / 4.00 / 5.00 / 6.00 / 11.00; active staff 4.00 / 4.00 / 4.00 / 4.00 / 4.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

Table rows and diagnostic distributions intentionally retain frozen failure outcomes; compare surviving strata in raw data rather than reading high-MRR bankruptcy as recovery.
## 1826 days

Runtime 89,508ms; independent replay and validated save round-trip mismatches0.

|Policy|v1 survivors|v2 survivors|Cash NT$ distribution|MRR NT$ distribution|Total hires/rejections|
|---|---:|---:|---|---|---|
|passive|3/100|3/100|-82,120.34 / -57,837.98 / -39,833.50 / -13,844.45 / 12,371,099.38|6,413.00 / 31,623.00 / 37,904.00 / 51,508.00 / 522,279.00|0/0|
|conservative|100/100|100/100|4,566,712.55 / 6,437,578.85 / 7,265,484.57 / 8,100,565.26 / 10,732,379.34|243,711.00 / 326,572.00 / 362,411.00 / 385,681.00 / 479,002.00|204/0|
|lean|73/100|73/100|-42,299.66 / -1,348.96 / 7,715,938.85 / 9,369,139.94 / 12,907,074.72|11,332.00 / 72,734.00 / 325,850.00 / 354,707.00 / 476,404.00|0/0|
|aggressive|0/100|0/100|-76,336.75 / -64,076.42 / -59,955.20 / -46,364.99 / -1,361.24|6,952.00 / 20,532.00 / 28,665.00 / 37,767.00 / 72,476.00|300/0|
|employee-first|0/100|0/100|-84,526.98 / -59,214.44 / -26,942.72 / -9,262.24 / -873.40|4,081.00 / 18,278.00 / 32,876.00 / 43,484.00 / 86,254.00|0/0|
|product-first|0/100|0/100|-95,587.44 / -40,675.58 / -32,239.84 / -20,451.35 / -1,918.01|2,655.00 / 20,332.00 / 27,801.00 / 39,168.00 / 81,363.00|100/0|

passive: bankruptcy day 151.00 / 181.00 / 181.00 / 181.00 / 212.00; launch day 60.00 / 64.00 / 66.00 / 69.00 / 73.00; payroll 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00; booked revenue 7,178.18 / 60,310.91 / 79,412.45 / 105,871.26 / 18,171,099.38; customers 2.00 / 6.00 / 8.00 / 9.00 / 76.00; active staff 3.00 / 3.00 / 3.00 / 3.00 / 3.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

conservative: bankruptcy day —; launch day 77.00 / 83.00 / 85.00 / 88.00 / 93.00; payroll 110,000.00 / 110,000.00 / 110,000.00 / 110,000.00 / 115,000.00; booked revenue 9,054,207.17 / 11,612,440.40 / 12,499,807.63 / 13,503,618.35 / 16,050,766.43; customers 47.00 / 59.00 / 63.00 / 67.00 / 80.00; active staff 4.00 / 4.00 / 4.00 / 4.00 / 4.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

lean: bankruptcy day 243.00 / 273.00 / 273.00 / 334.00 / 396.00; launch day 113.00 / 117.00 / 123.00 / 128.00 / 132.00; payroll 55,000.00 / 55,000.00 / 55,000.00 / 55,000.00 / 55,000.00; booked revenue 18,651.04 / 276,513.03 / 11,115,938.85 / 12,769,139.94 / 16,307,074.72; customers 3.00 / 14.00 / 57.00 / 61.00 / 80.00; active staff 2.00 / 2.00 / 2.00 / 2.00 / 2.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

aggressive: bankruptcy day 90.00 / 90.00 / 90.00 / 90.00 / 90.00; launch day 34.00 / 36.00 / 36.00 / 37.00 / 39.00; payroll 200,000.00 / 200,000.00 / 200,000.00 / 200,000.00 / 200,000.00; booked revenue 6,243.90 / 18,504.23 / 22,625.45 / 36,215.66 / 81,219.41; customers 2.00 / 4.00 / 5.00 / 6.00 / 7.00; active staff 6.00 / 6.00 / 6.00 / 6.00 / 6.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

employee-first: bankruptcy day 151.00 / 151.00 / 181.00 / 181.00 / 212.00; launch day 75.00 / 80.00 / 82.00 / 85.00 / 90.00; payroll 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00; booked revenue 3,260.20 / 18,481.47 / 59,990.87 / 77,543.94 / 229,456.26; customers 1.00 / 4.00 / 6.00 / 7.00 / 11.00; active staff 3.00 / 3.00 / 3.00 / 3.00 / 3.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

product-first: bankruptcy day 120.00 / 120.00 / 120.00 / 120.00 / 151.00; launch day 45.00 / 49.00 / 50.00 / 52.00 / 56.00; payroll 130,000.00 / 130,000.00 / 130,000.00 / 130,000.00 / 130,000.00; booked revenue 88.50 / 21,792.12 / 29,634.49 / 46,370.10 / 180,238.67; customers 1.00 / 4.00 / 5.00 / 6.00 / 11.00; active staff 4.00 / 4.00 / 4.00 / 4.00 / 4.00; resignations 0.00 / 0.00 / 0.00 / 0.00 / 0.00.

Table rows and diagnostic distributions intentionally retain frozen failure outcomes; compare surviving strata in raw data rather than reading high-MRR bankruptcy as recovery.
## Salary search / exploit controls

Derived low=min candidate acceptance, mid=independent expectation, high=1.2×expectation; same aggressive decisions,730days/100seeds each. Absurd offers and post-hire-cuts are diagnostic only, not valid strategies. Rejection consumes candidate identity; shared global nextEntity also affects later customer IDs/churn draws, so rejected-offer versus no-offer trajectories can differ without hired labor.

|Band|Survived|Accepted/rejected hires|Median launch day|Payroll distribution|Final cash distribution|Resignations total|
|---|---:|---|---:|---|---|---:|
|low|0/100|300/0|36.0|180,893.87 / 183,745.13 / 184,899.30 / 185,806.54 / 189,521.94|-156,697.53 / -30,539.32 / -23,714.08 / -17,540.69 / -1,096.75|0|
|mid|0/100|300/0|36.0|190,470.20 / 194,309.48 / 195,487.64 / 196,360.04 / 198,977.12|-119,851.28 / -52,860.18 / -47,166.14 / -37,035.01 / -8,793.17|0|
|high|0/100|300/0|36.0|209,564.24 / 214,171.38 / 215,585.17 / 216,632.04 / 219,772.54|-123,267.80 / -103,734.88 / -97,778.41 / -88,197.66 / -43,484.65|0|
|absurd|21/100|0/1501|58.0|25,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00|-64,569.58 / -32,977.20 / -16,748.99 / -1,428.62 / 3,548,184.38|41|
|post-hire-cut|0/100|300/0|36.0|190,470.20 / 194,309.48 / 195,487.64 / 196,360.04 / 198,977.12|-119,851.28 / -52,860.18 / -47,166.14 / -37,035.01 / -8,793.17|0|
|growth-no-hire|20/100|0/0|58.0|25,000.00 / 95,000.00 / 95,000.00 / 95,000.00 / 95,000.00|-82,120.34 / -37,246.44 / -20,912.76 / -3,957.65 / 3,008,260.44|39|

All4,000 matrix offers (100seeds×5roles×8bands) validated and independently replayed.0/1/verylow/below threshold reject, threshold/expectation/high/max accept. Candidate expectation does not depend on actual offer. Initial post-hire-cut probe55/100 survivors becomes0/100 after consent guard, with salary maintained. Raw eventCounts include SalaryOfferRejected; accepted/rejected columns above count recruitment only. All salary exploit probes here use100cents=NT$1. V1 original10seed NT$1 control remains9survivors. All financial values in raw offers are cents.

Conservative still dominates sampled survival but hires204 times across100five-year sessions; this is not a globally optimal no-hiring proof. Lean73% and conservative100% are distinct viable paths. Aggressive early expansion still has no survivors at reasonable salaries, and changing salary band alone does not rescue it. Established sales hiring has positive matched cash effect in3/5 representative branches, below. No normalization toward equal survival, no broad economy tuning.

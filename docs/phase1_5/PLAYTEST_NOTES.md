# Phase1.5 gameplay-style sessions

Operator: Codex through actual Playwright-controlled Chrome UI, not human participant research. Each starts at2026-01-01, NT$500,000, CEO/CTO/Engineer, Atlas, seed stated below. Native browser plugin unavailable; existing Playwright/Chrome workflow used. All actions pass through normal UI→Worker→application→simulation→IndexedDB, then a real export download. Before and after UX sessions are recorded separately. No direct world mutation, hidden-information policy or headless command injection was used for these sessions.

## conservative — benchmark-001

Founder salary reduced to10k and sustainable atday0. Atday84 dismiss CTO and switch to quality. Tradeoff: slower launch but lower payroll. Survived12months. This layoff timing is a curated UI decision, not the benchmark policy.

Result: day371; cash NT$332,359; bankrupt=false; browser errors0.

Decisions: {"decision":"salary","name":"Alice Chen","value":10000}; {"decision":"strategy","value":"sustainable"}; {"decision":"fire","name":"Bob Lin"}; {"decision":"product quality"}.

Significant event evidence (actual saved events):

- 2026-03-24, day82, ProductLaunched, {"productId":"product-1","name":"Atlas"}.
- 2026-03-26, day84, EmployeeFired, {"employeeId":"employee-2","name":"Bob Lin"}.

Observed UX: original week advancement only changed figures; no consolidated summary. Recruitment disclosed salary but did not preview company payroll/runway. Runway assumed current rates, while historical earned payroll remained due; the upcoming close was unclear. Product labels explained speed/quality tradeoff reasonably. Employee history listed titles, requiring another search for causes. After focused changes, weekly summary, held-contract month-close forecast, cost previews, qualitative warnings, linked employee events and priority filtering address these specific gaps. No claim that a human player found every issue within10 seconds.

Full dated observations and command histories: data/ui-playthroughs/conservative.notes.json and .save.json.

## aggressive — benchmark-001

Growth with two immediate35k engineers; quality atday56. Product launch improves, but payroll exceeds early contracts; shutdown atday90, observed afterweek13/day91. No employee-health drama before cash failure.

Result: day91; cash NT$-5,761; bankrupt=true; browser errors0.

Decisions: {"decision":"strategy","value":"growth"}; {"decision":"hire","name":"Growth Engineer","salary":35000}; {"decision":"hire","name":"Second Engineer","salary":35000}; {"decision":"product quality"}.

Significant event evidence (actual saved events):

- 2026-02-01, day31, RunwayWarning, {"months":1.857}.
- 2026-02-06, day36, ProductLaunched, {"productId":"product-1","name":"Atlas"}.
- 2026-03-01, day59, RunwayWarning, {"months":0.925}.
- 2026-04-01, day90, CompanyBankrupt, {"cash":-576087}.

Observed UX: original week advancement only changed figures; no consolidated summary. Recruitment disclosed salary but did not preview company payroll/runway. Runway assumed current rates, while historical earned payroll remained due; the upcoming close was unclear. Product labels explained speed/quality tradeoff reasonably. Employee history listed titles, requiring another search for causes. After focused changes, weekly summary, held-contract month-close forecast, cost previews, qualitative warnings, linked employee events and priority filtering address these specific gaps. No claim that a human player found every issue within10 seconds.

Full dated observations and command histories: data/ui-playthroughs/aggressive.notes.json and .save.json.

## poor-decisions-recovery — benchmark-002

Immediate35k hire, CTO salary cut to0 and growth. Atday56 dismiss extra hire, founder salary0, restore CTO40k, sustainable and quality. Survived12months. Recovery increases retention cost while founder bears a significant compensation sacrifice; zero founder pay is legal but not free of dissatisfaction.

Result: day371; cash NT$338,505; bankrupt=false; browser errors0.

Decisions: {"decision":"hire","name":"Early Engineer","salary":35000}; {"decision":"salary","name":"Bob Lin","value":0}; {"decision":"strategy","value":"growth"}; {"decision":"fire","name":"Early Engineer"}; {"decision":"salary","name":"Alice Chen","value":0}; {"decision":"salary","name":"Bob Lin","value":40000}; {"decision":"strategy","value":"sustainable"}; {"decision":"product quality"}.

Significant event evidence (actual saved events):

- 2026-01-31, day30, EmployeeConcernRaised, {"employeeId":"employee-2","name":"Bob Lin","concern":"compensation"}.
- 2026-02-19, day49, ProductLaunched, {"productId":"product-1","name":"Atlas"}.
- 2026-02-26, day56, EmployeeFired, {"employeeId":"employee-4","name":"Early Engineer"}.
- 2026-03-02, day60, EmployeeConcernRaised, {"employeeId":"employee-2","name":"Bob Lin","concern":"workload"}.
- 2026-04-01, day90, EmployeeConcernRaised, {"employeeId":"employee-2","name":"Bob Lin","concern":"workload"}.

Observed UX: original week advancement only changed figures; no consolidated summary. Recruitment disclosed salary but did not preview company payroll/runway. Runway assumed current rates, while historical earned payroll remained due; the upcoming close was unclear. Product labels explained speed/quality tradeoff reasonably. Employee history listed titles, requiring another search for causes. After focused changes, weekly summary, held-contract month-close forecast, cost previews, qualitative warnings, linked employee events and priority filtering address these specific gaps. No claim that a human player found every issue within10 seconds.

Full dated observations and command histories: data/ui-playthroughs/poor-decisions-recovery.notes.json and .save.json.

## employee-stability — benchmark-003

Sustainable without payroll cuts, quality atday84. Staff remain stable but slow launch and unchanged payroll exhaust cash atday151, observed atday154. Retention alone is insufficient.

Result: day154; cash NT$-6,416; bankrupt=true; browser errors0.

Decisions: {"decision":"strategy","value":"sustainable"}; {"decision":"product quality"}.

Significant event evidence (actual saved events):

- 2026-03-01, day59, RunwayWarning, {"months":2.762}.
- 2026-03-23, day81, ProductLaunched, {"productId":"product-1","name":"Atlas"}.
- 2026-04-01, day90, RunwayWarning, {"months":1.762}.
- 2026-05-01, day120, RunwayWarning, {"months":0.911}.
- 2026-06-01, day151, CompanyBankrupt, {"cash":-641629}.

Observed UX: original week advancement only changed figures; no consolidated summary. Recruitment disclosed salary but did not preview company payroll/runway. Runway assumed current rates, while historical earned payroll remained due; the upcoming close was unclear. Product labels explained speed/quality tradeoff reasonably. Employee history listed titles, requiring another search for causes. After focused changes, weekly summary, held-contract month-close forecast, cost previews, qualitative warnings, linked employee events and priority filtering address these specific gaps. No claim that a human player found every issue within10 seconds.

Full dated observations and command histories: data/ui-playthroughs/employee-stability.notes.json and .save.json.

## After-change reproduction

All four sessions were repeated through the same actual UI controls; every final save hash matches its before-change counterpart. Full notes: data/ui-playthroughs-after/. Each has0 console/page errors. Summaries and forecasts are display-only. These sessions document concrete agent-operated play, not human learnability or a measured10-second response time. A local replay attempt timed out during browser/server lifecycle contention; an overlapping E2E run then lost its shared preview server. These failures were retained and resolved by closing only owned stale test processes and rerunning sequentially; final acceptance retains every original assertion.

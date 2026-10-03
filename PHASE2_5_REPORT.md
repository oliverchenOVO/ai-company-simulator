# FOUNDRY Phase 2.5 — Human Validation & Retention Calibration

## Executive summary and gate

**FURTHER PHASE 2.5 ITERATION REQUIRED.** Diagnostics, controlled evidence, a human session package and targeted explanation fixes are implemented. Human comprehension is unverified (0 participants), and career/moderate-risk concerns can persist for years without entering search. Do not begin Phase 3 automatically.

App 0.2.1 retains simulation v3. No retention equation, probability, salary anchor, economy, goal renewal or historical behavior was changed. No v4, LLM, recruiter, external-offer, Slack/Email or broad Phase 3 system was added. The owner requested diagnostics and a test package first because participants are unavailable.

## Human validation

Actual participants: **0**. No real session duration, decisions, feedback or quotes exist. [HUMAN_PLAYTEST.md](docs/phase2_5/HUMAN_PLAYTEST.md) provides the independent 30–45 minute/default-Garage protocol, all 14 qualitative questions, anonymous observation form, categorization and privacy guidance. Automated browser tests are not human validation.

## Retention findings

[RETENTION_AUDIT.md](docs/phase2_5/RETENTION_AUDIT.md) measures compensation, stress, burnout, career frustration, manager/team/tie support, trust, exit intent, public signals and weekly evaluations. The instrument is developer-only, pure and detached; policies still receive only production CompanyView. State samples are seven days apart; public event dates are exact and sampled onset/resolution dates have up to six days uncertainty. Funnel columns overlap and must not be interpreted as a strictly nested probability funnel.

Thirty-five controlled ten-year runs and 90 matched 728-day branches passed replay/restore/invariants. Across controlled worlds: 70 departures, all with public warning history and positive machine-readable causes. Actual warning-event lead times are 110–742 days; exposed-signal lead times are 210–1176 days. These differ because a qualitative manager/health signal can be available before a warning event. The five career, weak-manager, modest-underpayment, instability and combined-moderate cases did not produce departures; the distinct combined-pressure and sustained-growth controls did. Four focal seeds pursue advancement; the mastery seed remains a reported negative control. Some open concerns last over 3500 days.

This narrows the issue to upstream target/search entry and persistent-warning meaning. Stable pay, sustainable work and relationship buffering keep stress/burnout low; frustration directly contributes at most 30, while search requires intent above 55. Company trust has no separate direct exit-target term. Increasing downstream resignation probability would not fix a cohort that never searches.

Matched intervention results differ: career-3 specialist promotion clears the advancement component whereas a raise leaves frustration at 100. Manager support changes gradually and work changes materially. Management promotion reduces individual work without creating skill or assigning reports. Some manager/transfer actions are later overwritten by continuing controlled reorganizations; no-op branches are explicitly identified. Promotion can create unmet pay expectations for a mastery employee. Completed goals remain inert instead of renewing automatically. See [STORY_AUDIT.md](docs/phase2_5/STORY_AUDIT.md) for actual dates, command IDs, events, causal links and outcomes.

## Strategy and long-horizon evidence

The original eight policies plus five retention-sensitive policies run on 100 shared seeds for five years. Policies never inspect exact hidden state. Conservative-derived retention policies share financial controls, so absence of actions or departures does not establish a universally best organization strategy. Early economic failure and surviving companies are analyzed separately. [STRATEGY_BENCHMARK.md](docs/phase2_5/STRATEGY_BENCHMARK.md) includes the measured funnel, tenure, promotions, overloads, cash/MRR and actual event counts.

Required Conservative, Lean, Management-first and Career-development ten-year benchmark is complete: 100 shared seeds per policy, 0 integrity failures, 0 high-intent people, 0 resignation evaluations and 0 departures. Survival is respectively 100%, 69%, 100%, 100%. The five-year 13-policy run also has 0 integrity failures: 4,640 eligible employee instances across independent worlds, 1,029 public concerns and 7 generic retention concerns, with 0 search/evaluation/departure entries. Ten years does not resolve the upstream plateau. Diagnostic runtimes were 997238 ms (five-year/13 policies) and 1403269 ms (ten-year/four policies), including weekly snapshots and replay.

These retained-policy cohorts rarely exceed four people and never overload a manager; they do not represent bad management at larger normal headcounts. Strong finances/stable pay reduce risk, while failed policies often collapse before career concerns mature. The diagnostic runner uses a uniform 14-day decision schedule, unlike the previous benchmark's checkpoint-adjusted dates; comparisons are within this experiment, not retrospective identical-hash claims.

## Changes and compatibility

[RETENTION_CHANGES.md](docs/phase2_5/RETENTION_CHANGES.md) records the no-equation-change decision and every explanation change. Generic concern copy no longer asserts workload causation without evidence. Track-specific promotion text explains individual-time costs, responsibility requirements and expectations. Known organization factors in Why use Chinese labels while preserving positive recorded causes and actual links. No hidden numeric truth or artificial risk escalation is shown.

All v1/v2/v3 goldens remain unchanged. Real hosted 0.2.0 v3 export was captured on 2026-10-03 through create → week → specialist promotion → UI replay → export; hash `68da846913942934055d1fb0e095607ed1ff25b0f7d37d0893d604ffb999cfc5` is fixed by a new compatibility test. Existing real v1/v2 saves and compensation exploit assertions are retained. Save schema remains 2; app metadata moves to 0.2.1 without upgrading worlds. A future calibration must introduce v4 and separate goldens if deterministic outcomes change.

## Verification

82 tests in 12 files pass, including all original 72 assertions. Lint, typecheck, desktop build and hosted build pass. Local Web/Electron: 14/14. Hosted-equivalent Google Chrome: 12/12. Actual packaged Windows: 2/2, including released v3 import → organization intervention → advance → SQLite save → process restart → continue → replay. Portable wrapper generated; actual testing launched the packaged executable in win-unpacked.

100 seeds × five years including replay: 3267 ms. 1000 employees × ten years including independent replay: 126067 ms under concurrent audit/build workload; all six integrity counters 0, 1998 relationships, 4877 events, 3849 memories, ending heap 119 MiB. Stress hash matches Phase 2 exactly. [PERFORMANCE.md](docs/phase2_5/PERFORMANCE.md) records save size, history/command growth and validated JSON load timings. No major history rewrite or graph expansion was performed.

Windows portable SHA-256: `1CF7AB3537391CBF694B80F758E56C6025CBAC45E8DCC3ED977D53BC8B8A2F8B`.

## Rendered QA

Browser plugin not available; existing Playwright Google Chrome workflow used. Tested: controlled warning import → Why/history inspection → track preview → promotion and manager assignment → save/refresh → replay; separate controlled v3 departure → positive causes and public warning history. Desktop 1440×900/1586×992 and mobile 390×844 organization layouts pass. Page identity, meaningful content, framework-overlay absence, console/page-error assertions, screenshots and interactions passed. Screenshots remain outside Git in the Phase 2.5 local QA folder; they are automated evidence. Human comprehension remains untested.

## Windows / hosted release

Windows 0.2.1 build and actual packaged acceptance are complete. Existing Site publication and actual production Chrome acceptance: pending final publication at this checkpoint. Preserve the current Site URL/audience and private source repository. Do not substitute another browser and call Chrome passed.

## Git

- `3b70403`: developer-only retention pipeline, controlled/policy tooling, real v3 compatibility fixture and meaningful retention regression tests; accurate generic concern copy.
- `b785e38`: weekly funnel counts checked against an independent daily trace, with unchanged departure dates and bounded onset uncertainty.
- `1d9e93d`: selection-specific promotion explanations, translated causal factors, 0.2.1 metadata and rendered/packaged compatibility tests.
- Benchmark evidence, human protocol and final acceptance documentation are committed as separate focused milestones after the remaining long run/release gates.

Existing origin `oliverchenOVO/ai-company-simulator` is private. Committed raw evidence is entirely synthetic; no personal participant data, credentials or local screenshots are committed. [Private CI 37122175713](https://github.com/oliverchenOVO/ai-company-simulator/actions/runs/37122175713), source b785e38, passed both validate and windows-package, including the 82-test suite and actual packaged acceptance. Final clean/pushed state and production evidence are recorded after release gates.

## Next step

Use the prepared protocol with 3–5 independent players, then review chronic warning interpretation and completed-goal inertness. Propose a minimal falsifiable v4 retention rule only when evidence supports it, preserve v3, and compare strong retention, moderate compounding, meaningful warning windows and costly interventions. Do not tune to a resignation quota, broadly rebalance the economy or implement the next major Phase. This phase cannot answer the real-player comprehension question until participants exist.

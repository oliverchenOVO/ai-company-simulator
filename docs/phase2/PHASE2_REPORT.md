# FOUNDRY Phase 2 acceptance report

## Executive summary

**PHASE 2 COMPLETE.** Version 0.2.0 implements the defined Phase 2 organization simulation, with new games on simulation v3 and historical v1/v2 worlds retaining their exact rules. Local and production acceptance are complete; publication and private CI are recorded below. Human testing and departure pacing remain explicit limitations. No Phase 3 implementation was started. No LLM determines simulation truth.

## Management quality

Leadership, domain skill, directional relationships, stress and actual reporting capacity determine support. Overload and recovery are gradual; management consumes individual contribution time. Individual and team manager commands reject invalid reporting graphs atomically. See [MANAGEMENT_MODEL.md](MANAGEMENT_MODEL.md).

## Career system

Persistent levels, specialist/manager tracks, structured goals, promotion readiness and bounded causal memories support actual decisions. Promotion changes expectations without automatically changing salary; leadership goals require real reports. The current model maintains one primary goal and does not regenerate successive goal cycles. See [CAREER_MODEL.md](CAREER_MODEL.md).

## Team consequences and relationships

Hiring, departure, transfer, role and manager changes affect team stability and coordination; coordination affects real work. Directional sparse ties react to collaboration, pressure and existing peers' promotion expectations. Reporting, qualitative team state and career views link to recorded causal history. The reporting UI is a functional paginated table. See [TEAM_MODEL.md](TEAM_MODEL.md) and [RELATIONSHIP_MODEL.md](RELATIONSHIP_MODEL.md).

## Retention

Career frustration, management support, team stability, role fit and strong ties supplement the existing compensation and burnout factors. Matched counterfactuals show both benefits and tradeoffs: career-matched promotion can help, while management promotion reduces individual output and does not help every goal. Normal policy benchmarks recorded zero resignations across all eight strategies; departure pacing therefore remains a balance limitation, not proof of realistic retention. See [COUNTERFACTUALS.md](COUNTERFACTUALS.md).

## Story audit and strategy benchmark

[STORY_AUDIT.md](STORY_AUDIT.md) traces actual events, choices and subsequent consequences; no invented dialogue or human feedback is used. [STRATEGY_BENCHMARK.md](STRATEGY_BENCHMARK.md) records eight observable-information policies on the same 100 seeds at two and five years, with zero replay/restore mismatches. Conservative, management-first and career-development survive all seeds; lean survives 69%, passive 2%, the other policies 0%. Survival cash medians alone do not establish a universally best policy. Twenty-eight matched branches have zero integrity failures.

## Human playtest

External human participants: **0**. Automated audits are not human playtests. [PLAYTEST_NOTES.md](PLAYTEST_NOTES.md) provides the proposed 3–5 participant protocol and unanswered interpretation questions. Human comprehension and enjoyment remain unverified.

## Compatibility

Save schema 2 preserves existing worlds; schemas 1/2 and explicit envelope migration are supported without silent simulation upgrades. Real 0.1.0 and hosted 0.1.1 exports restore and replay. All historical golden assertions remain; unreleased v3 goldens cover years 1/3/5 and explicitly record concern episode, attainable leadership and causal command-link calibrations. See [COMPATIBILITY.md](COMPATIBILITY.md).

## Tests and performance

Final local validation: 72 tests in 11 files; lint, typecheck, desktop build and hosted build pass. Web/Electron suite: 12/12; hosted-equivalent Chrome suite: 10/10; actual packaged Windows SQLite restart, continued play and replay: 1/1. The portable artifact was generated; the packaged executable inside win-unpacked was used for the actual smoke test.

100 seeds × five years: 2573 ms. 1000 employees × ten years including independent replay: 105975 ms, 1998 relationships, 4877 events, 3849 memories, observed ending heap 142 MiB. All six integrity counters are zero. Final UI 1000-person check: 25 rendered rows, navigation during simulation 68 ms, week plus navigation 350 ms. Hardware workload affects timing; these are observations, not a controlled speedup claim. Full history and transaction snapshots still grow with duration. See [PERFORMANCE.md](PERFORMANCE.md).

Windows portable SHA-256: `6AED3E916D7E983EE7ECB0B8226031BE2141BFB3A405082DE3B34E848707AE9A`.

## Technical problems resolved

Unresolved concern episodes initially flooded long-game history; crossing/episode events now preserve causality with bounded memories. Invariant checking dominated profiling; allocation was reduced while full finite checks remain. Leadership aspirations now acknowledge real reporting responsibility independently of managerial effectiveness. Organization commands now identify their initiating command in history. Team manager editors avoid one full employee selector per team; career controls refresh after reporting/role changes. Local acceptance uses an isolated port because an unrelated app occupied 4173. No test was deleted, relaxed or replaced with hardcoded output.

## Git milestones

- `a39e171`: versioned management capacity and team coordination.
- `64fa96f`: persistent careers, promotion and causal decisions.
- `de6b7cf`: careers, reporting and organization UI.
- `d002541`: v3 golden evidence and bounded concern episodes.
- `cbc7a87`: attainable leadership responsibility.
- `9a1d6cb`: initiating command links and final v3 replay baseline.
- `dbcc404`: career control refresh, bounded team selectors and continued-play E2E.
- `ec0e6eb`: 28 counterfactual pairs, eight seeded strategies and raw evidence.
- `a494009`: model, story, balance and acceptance documentation; released source.
- Final documentation-only commit records production acceptance and CI without changing runtime assets. See Git history for its ID.

## Release evidence

## Windows / Hosted

Production: [FOUNDRY](https://foundry-company-simulator.oliverchenovo.chatgpt.site), Site version 5, released source `a4940098f661b6f8f0e6c12a8d34a4322f54bae5`, deployment `appgdep_6ac0e0be87e08191ba50d39474ab383e`, status succeeded on 2026-10-03. Actual production Google Chrome suite: **10/10 passed in 43.4 seconds**, including both organization layouts, v2 compatibility, replay, independent sessions and offline behavior; no assertion or browser substitution was needed.

The existing Site audience and URL are preserved. Browser saves use IndexedDB isolated by browser profile/origin, survive refresh, and are not server-shared worlds. Cross-device account synchronization is not implemented. Windows persistence uses SQLite and actual packaged restart/continue/replay acceptance passed. Portable artifact: `release/Foundry-Company-Simulator-0.2.0-Windows.exe`, 97,633,356 bytes, SHA-256 above.

Sites' bundled workflow encountered a Windows Bash path-escaping error. The fallback pushed the exact clean source and locally packaged seven fresh static files; every asset matched the already-tested hosted build byte-for-byte. Archive SHA-256: `b8babfb22be3924eaf8a2fcf8c0595201837398218afcd598d9fcc95bffb30a1`. No credentials were persisted or committed.

## Git

Existing origin remains private: `oliverchenOVO/ai-company-simulator`. All implementation and synthetic benchmark evidence is committed and pushed; no human/private QA records or credentials are included. Released source is also pushed to the Site's configured source repository. [Private CI run 37118225541](https://github.com/oliverchenOVO/ai-company-simulator/actions/runs/37118225541) passed both validate and windows-package jobs, including lint, typecheck, tests, benchmark, build, E2E, portable packaging and packaged smoke. Final documentation-only update is separately committed/pushed; clean working tree is verified after that commit.

## Recommendation and unfinished work

**Begin Phase 2.5 / Phase 3 planning**, with the proposed human sessions and a review of retention pacing, managerial tradeoffs and causal explanation readability first. This is a recommendation to plan, not authorization to implement the next Phase. Do not infer human acceptance from automated results. Goal renewal, indefinite-history optimization and a spatial office remain future decisions; none were added to this Phase.

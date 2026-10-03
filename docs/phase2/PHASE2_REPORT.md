# FOUNDRY Phase 2 acceptance report

## Executive summary

Version 0.2.0 implements the defined Phase 2 organization simulation, with new games on simulation v3 and historical v1/v2 worlds retaining their exact rules. Local acceptance is complete; production publication and private CI are recorded in the release evidence section below. No Phase 3 implementation was started. No LLM determines simulation truth.

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
- Subsequent focused commits finalize causal metadata, UI controls, policy/counterfactual evidence and acceptance documentation. See Git history for exact IDs.

## Release evidence

Production deployment, production acceptance and private CI: pending publication at this source checkpoint. The existing Site audience and URL are preserved; source is pushed only to the existing private GitHub repository and the Site's configured source repository.

## Recommendation and unfinished work

Accept the implemented Phase 2 technical milestone once release gates pass. Before choosing the next major Phase, run the proposed human sessions and review retention pacing, managerial tradeoffs and causal explanation readability. Do not infer human acceptance from automated results. Goal renewal, indefinite-history optimization and a spatial office remain future decisions; none were added to this Phase.

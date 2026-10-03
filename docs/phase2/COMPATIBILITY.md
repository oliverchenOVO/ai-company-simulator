# Compatibility

Simulation behavior and envelope schema are independent. Schema 2 writes new exports; decoder accepts schemas 1 and 2 unchanged, and explicitly migrates the v0 envelope to schema 1 without mutating its world. No world migration or implicit behavior upgrade occurs. Optional career/team structures are required in v3 and forbidden in v1/v2 by invariants.

Real v1 fixture is the original 0.1.0 browser export. Real v2 fixture was captured through the hosted 0.1.1 UI on 2026-10-03: create, advance a week, hire, export. Recorded hash 4d04dd6a2124b1fc62683f5de0baaf22459f8b511c52155681efbc1d2ce701e4. Both remain untouched and are restored and independently replayed.

Original v1/v2 golden hashes are retained. No regeneration of historical fixtures is authorized or required.

New games now default to v3. Leadership goals represent obtaining real reporting responsibility, which is attainable; managerial quality remains independently evaluated. The unreleased v3 golden baseline explicitly records this calibration. Historical fixtures were not changed.

The final unreleased v3 baseline also records initiating organization command IDs in causal history. Derived team reporting events point to the team change, and peer reactions point to promotion. This fixes explanation/replay metadata without changing numerical rules or random draws. Only new v3 goldens were regenerated explicitly; v1/v2 fixtures remain byte-identical.

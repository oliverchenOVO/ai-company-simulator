# Team consequences

Team authority adds stability, coordination, cumulative actual output, last personnel-change event and a qualitative condition marker. Daily stability recovers 0.35 points. Hiring costs 8, transfer 12 in both affected teams, firing 16, resignation 12, individual manager changes 8 and team leadership changes 15 once per team (not once per report). Scores clamp 0–100.

Coordination target combines actual managerial support, existing same-team directional ties, stability, role diversity (up to three complementary roles) and a logarithmic size cost. It smooths 3% per day. Coordination multiplies all individual work by 0.85–1.15; actual engineering/design work affects product progress, quality and debt through the existing work equations. Role expertise governs actual contribution, so reassignment can reduce fit/output. No random permanent team bonus.

Team warning/recovery only emits on a coordination crossing of 50. Hiring/firing/transfers retain their actual initiating events; stability links to those events. Team output is cumulative completed work, not a second productivity authority. Reporting links can cross teams; default team management is applied on transfer and can be overridden by AssignManager. AssignTeamManager intentionally reorganizes reporting within that team, including clearing the new manager's same-team reporting link to avoid a cycle; final whole-graph invariants reject any remaining cycle atomically.

The UI shows qualitative coordination/stability, role composition, management load and career concerns. Reporting rows paginate at 25 and select employee details. Hidden quality/stability values stay in CLI audit/save truth.

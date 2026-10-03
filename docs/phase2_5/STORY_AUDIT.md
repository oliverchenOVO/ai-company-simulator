# Actual employee story audit

These are actual machine-recorded stories, not fictional dialogue or inferred motives. Human stories: none (0 participants). All dates below are simulation dates/ticks. Raw command histories and causal links are in the named saves and controlled.json.

## career-3 / career-stagnation / Retention colleague

Commands: day 0 command-2 ChangeCompanyStrategy; day 0 command-5 AssignManager.

- 2026-01-01 / day 0: event-5 ManagerChanged; parent command-5; positive contributing factors management-change.
- 2026-05-14 / day 133: event-25 CareerConcernRaised; parent event-5; positive contributing factors career.
- 2026-09-17 / day 259: event-46 CareerGoalBlocked; parent event-5; positive contributing factors career.

Outcome: active; final intent diagnostic 29.990; first sampled hidden intent ≥20 day 329; first exposed person-level signal day 133; first serious warning day 259; departure day None; warning lead None days.
Player interpretation: actual warnings and the Why/history panel provide inspectable evidence. Human comprehension remains untested. Related prior events are not all asserted to be causes; private searching remains hidden.

## career-3 / combined-moderate / Retention colleague

Commands: day 0 command-2 ChangeCompanyStrategy; day 28 command-28 AssignManager; day 56 command-33 AssignManager; day 84 command-38 AssignManager; day 112 command-43 AssignManager; 131 relevant recorded commands total.

- 2026-01-29 / day 28: event-33 ManagerChanged; parent command-28; positive contributing factors management-change.
- 2026-02-26 / day 56: event-38 ManagerChanged; parent command-33; positive contributing factors management-change.
- 2026-03-26 / day 84: event-42 ManagerChanged; parent command-38; positive contributing factors management-change.
- 2035-09-29 / day 3558: event-1055 EmployeeConcernRaised; parent event-1054; positive contributing factors none recorded.
- 2035-10-29 / day 3588: event-1061 EmployeeConcernRaised; parent event-1060; positive contributing factors none recorded.
- 2035-11-28 / day 3618: event-1069 EmployeeConcernRaised; parent event-1068; positive contributing factors none recorded.
- 2035-12-28 / day 3648: event-1078 EmployeeConcernRaised; parent event-1075; positive contributing factors none recorded.

Outcome: active; final intent diagnostic 37.149; first sampled hidden intent ≥20 day 245; first exposed person-level signal day 0; first serious warning day 231; departure day None; warning lead None days.
Player interpretation: actual warnings and the Why/history panel provide inspectable evidence. Human comprehension remains untested. Related prior events are not all asserted to be causes; private searching remains hidden.

## career-3 / combined-pressure / Retention colleague

Commands: day 0 command-2 ChangeCompanyStrategy; day 14 command-26 MoveEmployeeToTeam; day 28 command-29 MoveEmployeeToTeam; day 42 command-32 MoveEmployeeToTeam; day 56 command-35 MoveEmployeeToTeam; 48 relevant recorded commands total.

- 2026-01-15 / day 14: event-29 EmployeeMoved; parent command-26; positive contributing factors none recorded.
- 2026-01-29 / day 28: event-34 EmployeeMoved; parent command-29; positive contributing factors none recorded.
- 2026-02-12 / day 42: event-38 EmployeeMoved; parent command-32; positive contributing factors none recorded.
- 2027-08-07 / day 583: event-224 EmployeeConcernRaised; parent event-219; positive contributing factors none recorded.
- 2027-09-06 / day 613: event-241 EmployeeConcernRaised; parent event-234; positive contributing factors none recorded.
- 2027-10-06 / day 643: event-251 EmployeeConcernRaised; parent event-246; positive contributing factors none recorded.
- 2027-11-04 / day 672: event-259 EmployeeResigned; parent event-255; positive contributing factors compensation, burnout, management, career, team-stability.

Outcome: resigned; final intent diagnostic 73.063; first sampled hidden intent ≥20 day 182; first exposed person-level signal day 0; first serious warning day 231; departure day 672; warning lead 672 days.
Player interpretation: actual warnings and the Why/history panel provide inspectable evidence. Human comprehension remains untested. Related prior events are not all asserted to be causes; private searching remains hidden.

## career-3 / sustained-growth / Retention colleague

Commands: day 0 command-2 ChangeCompanyStrategy; day 0 command-5 AssignManager.

- 2026-01-01 / day 0: event-5 ManagerChanged; parent command-5; positive contributing factors management-change.
- 2026-05-14 / day 133: event-29 CareerConcernRaised; parent event-5; positive contributing factors career.
- 2026-07-30 / day 210: event-43 EmployeeConcernRaised; parent event-5; positive contributing factors none recorded.
- 2026-09-17 / day 259: event-54 CareerGoalBlocked; parent event-5; positive contributing factors career.
- 2027-01-21 / day 385: event-84 EmployeeResigned; parent event-57; positive contributing factors burnout, management, career.

Outcome: resigned; final intent diagnostic 97.414; first sampled hidden intent ≥20 day 189; first exposed person-level signal day 112; first serious warning day 210; departure day 385; warning lead 273 days.
Player interpretation: actual warnings and the Why/history panel provide inspectable evidence. Human comprehension remains untested. Related prior events are not all asserted to be causes; private searching remains hidden.

## Matched career-3 stagnation / ignore

Day 182 commands: []. Same origin hash fff50669536c53174bde0c9acc437c9b3169af3e81526c9c962dcf9cdd9c9a60. Final career frustration 100; post-branch work 521.040; final monthly contract salary NT$35530.80; status active.
The actual traces distinguish career resolution from a raise, and specialist output from management time. No recovery event or dialogue is invented when the model only shows a changing goal/feedback state.

## Matched career-3 stagnation / salary

Day 182 commands: [{"type": "ChangeSalary", "employeeId": "employee-5", "salary": 3908388}]. Same origin hash fff50669536c53174bde0c9acc437c9b3169af3e81526c9c962dcf9cdd9c9a60. Final career frustration 100; post-branch work 521.113; final monthly contract salary NT$39083.88; status active.
The actual traces distinguish career resolution from a raise, and specialist output from management time. No recovery event or dialogue is invented when the model only shows a changing goal/feedback state.

## Matched career-3 stagnation / promotion

Day 182 commands: [{"type": "PromoteEmployee", "employeeId": "employee-5", "track": "specialist"}]. Same origin hash fff50669536c53174bde0c9acc437c9b3169af3e81526c9c962dcf9cdd9c9a60. Final career frustration 0; post-branch work 537.316; final monthly contract salary NT$35530.80; status active.
The actual traces distinguish career resolution from a raise, and specialist output from management time. No recovery event or dialogue is invented when the model only shows a changing goal/feedback state.

## Matched career-3 stagnation / management-promotion

Day 182 commands: [{"type": "PromoteEmployee", "employeeId": "employee-5", "track": "manager"}]. Same origin hash fff50669536c53174bde0c9acc437c9b3169af3e81526c9c962dcf9cdd9c9a60. Final career frustration 0; post-branch work 456.686; final monthly contract salary NT$35530.80; status active.
The actual traces distinguish career resolution from a raise, and specialist output from management time. No recovery event or dialogue is invented when the model only shows a changing goal/feedback state.

## Density

Raw eventCounts and eventsPerYear retain meaningful organization events for every controlled run and normal strategy. Stable untouched goals emit crossing events, not daily reminders. Active repeated reorganizations legitimately generate more action/concern history. The ten-year data does not prove a fixed ideal events/year; no event quota was introduced.

- conservative: 558 organization events across 100 actual runs, 0 resignations. Bankrupt histories are not padded with nonexistent years.
- lean: 220 organization events across 100 actual runs, 0 resignations. Bankrupt histories are not padded with nonexistent years.
- management-first: 736 organization events across 100 actual runs, 0 resignations. Bankrupt histories are not padded with nonexistent years.
- career-development: 558 organization events across 100 actual runs, 0 resignations. Bankrupt histories are not padded with nonexistent years.

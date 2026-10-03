# Actual Phase 2 stories

These are reconstructed event chains, not generated fiction. Raw events and state are in data/organization-branches.json and the named synthetic policy exports.

## career-3: career vs salary

day 0 EmployeeHired (event-4) → day 133 CareerConcernRaised (event-24) → day 180 EmployeePromoted (event-30)

## career-4: career vs salary

day 0 EmployeeHired (event-4) → day 133 CareerConcernRaised (event-26) → day 180 EmployeePromoted (event-33)

## benchmark-010: career vs salary

day 0 EmployeeHired (event-4) → day 42 CareerGoalProgressed (event-10) → day 180 EmployeePromoted (event-37)

career-3 and career-4 have advancement goals: accumulated unresolved progress produces a real career conversation, then a specialist promotion changes the goal and expectation. benchmark-010 pursues mastery, which had already progressed; the same promotion is not a universal retention fix. Matched diagnostics show the different outcomes, rather than inventing a resignation.

## Surviving normal Garage companies

### conservative, benchmark-001

Starts with normal NT$500,000, not injected branch capital.

day 126 CareerConcernRaised / Carol Wu (event-23) → day 245 CareerGoalBlocked / Carol Wu (event-40) → day 714 CareerConcernRaised / Policy hire 589 (event-120) → day 735 CareerConcernRaised / Policy hire 603 (event-124) → day 833 CareerGoalBlocked / Policy hire 589 (event-140) → day 868 CareerGoalBlocked / Policy hire 603 (event-149)

Final actual state: bankrupt=False; tick=1826. No departure is implied by a concern event.

### management-first, benchmark-001

Starts with normal NT$500,000, not injected branch capital.

day 126 CareerConcernRaised / Carol Wu (event-23) → day 245 CareerGoalBlocked / Carol Wu (event-40) → day 617 EmployeePromoted / Policy hire 603 (event-103) → day 617 ManagerChanged / Carol Wu (event-104) → day 714 CareerConcernRaised / Policy hire 589 (event-122) → day 833 CareerGoalBlocked / Policy hire 589 (event-141)

Final actual state: bankrupt=False; tick=1826. No departure is implied by a concern event.

### career-development, benchmark-001

Starts with normal NT$500,000, not injected branch capital.

day 126 CareerConcernRaised / Carol Wu (event-23) → day 245 CareerGoalBlocked / Carol Wu (event-40) → day 714 CareerConcernRaised / Policy hire 589 (event-120) → day 735 CareerConcernRaised / Policy hire 603 (event-124) → day 744 EmployeePromoted / Policy hire 603 (event-128) → day 833 CareerGoalBlocked / Policy hire 589 (event-141)

Final actual state: bankrupt=False; tick=1826. No departure is implied by a concern event.

## Story density and limits

Routine CareerGoalProgressed events are excluded from the density measure below. A signal means a career/manager/team/relationship concern or a real organizational decision, not necessarily interpersonal drama. Economic failure still often precedes organizational action in aggressive/product-first companies. There are no resignations in the eight normal Garage strategy benchmarks: Phase 2 does not claim to solve every late-retention pacing issue.

### 730 days: companies with an organizational signal by their terminal point

| Policy | Companies / 100 | Signals |
|---|---:|---:|
| passive | 36 | 36 |
| conservative | 48 | 102 |
| lean | 36 | 71 |
| aggressive | 0 | 0 |
| employee-first | 36 | 36 |
| product-first | 3 | 3 |
| management-first | 81 | 245 |
| career-development | 48 | 112 |
### 1826 days: companies with an organizational signal by their terminal point

| Policy | Companies / 100 | Signals |
|---|---:|---:|
| passive | 36 | 36 |
| conservative | 81 | 250 |
| lean | 36 | 71 |
| aggressive | 0 | 0 |
| employee-first | 36 | 36 |
| product-first | 3 | 3 |
| management-first | 100 | 379 |
| career-development | 81 | 252 |

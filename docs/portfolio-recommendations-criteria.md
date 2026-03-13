# Portfolio Recommendations — Selection Criteria

## Overview

The "Analyze Portfolio" feature produces one staffing recommendation per unassigned LCAT requirement across all active projects. Selection is fully deterministic — no AI/LLM is involved. The logic lives in `src/app/api/ai/recommendations/route.ts`.

---

## Step 1 — Project Eligibility

Only projects with the following statuses are considered:

| Status | Included |
|---|---|
| `preliminary` | Yes |
| `proposal_submitted` | Yes |
| `awarded` | Yes |
| `staffed` | No |
| `lost` | No |

---

## Step 2 — Requirement Eligibility

For each LCAT requirement on an eligible project, the requirement is skipped if:

- **Already fully staffed** — the number of existing assignments for that requirement is greater than or equal to `fteCount`.

---

## Step 3 — Employee Eligibility

An employee is eligible for a requirement if **all three** conditions are met:

1. **LCAT match** — the employee's assigned Labor Category exactly matches the requirement's LCAT.
2. **Not already assigned** — the employee does not have an existing assignment to this specific LCAT requirement on this project.
3. **Available** — `getCurrentAvailabilityFte > 0` (i.e., the employee has at least some capacity remaining beyond their current assignments, computed from a 40 hrs/week baseline).

Requirements with zero eligible employees are skipped — no recommendation is generated.

---

## Step 4 — Candidate Scoring

Eligible employees are scored using `matchEmployeesToRequirement()` from `src/lib/matching.ts`.

The score is composed of two equally weighted components:

| Component | Weight | Calculation |
|---|---|---|
| LCAT match | 50% | 50 points if the employee's LCAT matches; 0 otherwise (always true at this stage, since non-matching employees are filtered out in Step 3) |
| Skill coverage | 50% | `(matched skills / required skills) × 50` |

**Formula:**

```
overallScore = 50 + (matchedSkills / totalRequiredSkills) × 50
```

If a requirement has no required skills, skill coverage defaults to 100%, giving a score of 100.

**Tie-breaking:** When two candidates have equal `overallScore`, the one with higher availability FTE is ranked higher.

---

## Step 5 — Recommendation Selection

The top-ranked candidate (highest score, ties broken by availability) is selected as the recommendation for that requirement.

---

## Step 6 — Rationale Generation

The rationale string is generated from one of three templates depending on skill data:

| Condition | Rationale Template |
|---|---|
| No skills required | `"Highest availability {LCAT} at {avail}%."` |
| All required skills matched | `"Perfect skill match ({n}/{n}) with {avail}% availability."` |
| Partial skill match | `"Best available {LCAT} with {matched}/{total} required skills and {avail}% availability."` |

---

## Step 7 — Output Sort Order

The final list of recommendations is sorted by:

1. **Project priority** (ascending): `high` → `medium` → `low`
2. **Win probability** (descending) within each priority tier

---

## Data Sources

| Data | Source |
|---|---|
| Projects, requirements | `data/projects.json` |
| Employees, skills | `data/employees.json` |
| Assignments | `data/assignments.json` |
| LCATs | `data/lcats.json` |
| Availability computation | `src/lib/availability.ts` — rolling calculation against 40 hrs/week baseline |
| Scoring | `src/lib/matching.ts` — `matchEmployeesToRequirement()` |

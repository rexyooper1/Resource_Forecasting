# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# StaffCast - Engineering Labor Demand Planning

## Overview

StaffCast is an MVP SaaS application for engineering managers at engineering services firms. It solves the problem of inconsistent capture and tracking of labor demand for preliminary (not-yet-won) projects. BD Program Managers can enter structured labor needs, and the engineering manager gets aggregated future demand by Labor Category (LCAT), weighted by win probability, to make staffing decisions.

## Tech Stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- **Theme**: Dark mode with orange accent (`--primary: orange`)
- **Backend**: Next.js Server Actions + JSON file persistence (`/data/*.json`)
- **Charts**: Recharts
- **Dates**: date-fns
- **IDs**: uuid
- **Theme management**: next-themes
- **No auth** - single user with a role-switcher for demo purposes

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx      # Demand dashboard with charts
│   ├── demand/page.tsx         # Unassigned FTE demand by LCAT (pre-award projects)
│   ├── projects/
│   │   ├── page.tsx            # Project list with status filter tabs
│   │   ├── new/page.tsx        # New project form
│   │   └── [id]/page.tsx       # Project detail / edit + staffing panel
│   ├── employees/
│   │   ├── page.tsx            # Employee roster
│   │   ├── new/page.tsx        # Add employee form
│   │   └── [id]/page.tsx       # Employee detail with availability chart
│   ├── matching/page.tsx       # Skill matching view
│   └── settings/page.tsx       # LCAT & Skill configuration
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # sidebar.tsx + header.tsx
│   ├── dashboard/              # demand-chart, timeline-chart, staffing-gap-table, etc.
│   ├── demand/                 # unassigned-demand-tabs
│   ├── projects/               # project-form, project-staffing-panel, requirement-matching-card
│   ├── employees/              # employee-form, employee-availability-chart, employee-assignments-table
│   ├── matching/               # skill-match-table
│   └── settings/               # lcat-manager, skill-manager
├── lib/
│   ├── data.ts                 # JSON file read/write helpers (getProjects, getAssignments, etc.)
│   ├── matching.ts             # Skill matching scoring (50% LCAT + 50% skill coverage)
│   ├── availability.ts         # Employee availability computed from assignments (rolling 12 weeks)
│   ├── staffing.ts             # Project staffing fulfillment % calculations
│   ├── capacity.ts             # LCAT capacity vs demand gap analysis (6-month window)
│   ├── unassigned-demand.ts    # Unassigned FTE demand per project/LCAT
│   └── utils.ts                # cn() utility for Tailwind
├── actions/
│   ├── projects.ts             # Server actions for project CRUD
│   ├── employees.ts            # Server actions for employee CRUD
│   ├── assignments.ts          # Server actions for assignment CRUD
│   └── settings.ts             # Server actions for LCATs & skills
└── types/index.ts              # TypeScript interfaces
data/                           # JSON persistence (seed data included)
├── projects.json
├── employees.json
├── assignments.json
├── lcats.json
└── skills.json
```

## Data Models

- **Project** - name, client, status (`preliminary`|`proposal_submitted`|`awarded`|`staffed`|`lost`), winProbability (0-100), periodOfPerformance, lcatRequirements[]
- **LCATRequirement** - lcatId, fteCount, requiredSkills[]
- **Assignment** - employeeId, projectId, lcatRequirementId, hoursPerWeek, startDate, endDate
- **Employee** - name, lcatId, skills[] — **no static availability field**; availability is dynamically computed from assignments via `src/lib/availability.ts`
- **LCAT** - Labor Category (e.g., Mechanical Engineer, Electrical Engineer)
- **Skill** - Technical skill (e.g., SolidWorks, PCB Design)

## Key Features

### Dashboard (`/dashboard`)
- Summary cards: total preliminary projects, FTE demand, weighted FTE demand, awarded projects
- Demand-by-LCAT bar chart (raw vs weighted by win probability)
- 12-month demand timeline (stacked area chart by LCAT)
- Staffing gap table with capacity vs demand by LCAT

### Unassigned Demand (`/demand`)
- Shows unassigned FTE demand across pre-award projects (preliminary + proposal_submitted only)
- Tabbed view: by LCAT aggregate or by project breakdown

### Projects (`/projects`, `/projects/[id]`)
- Project list with status filter tabs
- Create/edit form with LCAT requirements builder, win probability slider, period of performance dates
- Project detail includes a staffing panel for assigning employees to LCAT requirements

### Employees (`/employees`, `/employees/[id]`)
- Employee roster; detail view shows 12-week rolling availability chart and assignment history
- Add/edit form with skill checkboxes

### Matching (`/matching`)
- Select a project to see employee matches per LCAT requirement
- Scoring: 50% LCAT match + 50% skill match percentage
- Skill gap highlighting

### Settings (`/settings`)
- CRUD management for Labor Categories and Skills

### Role Switcher
- Sidebar dropdown: BD Program Manager, Engineering Manager, Engineer
- Controls which nav items are visible (stored in localStorage)

## Architecture Notes

- **Data layer** (`src/lib/data.ts`): reads/writes JSON files in `/data/` using Node.js `fs` module. All CRUD goes through Server Actions with `revalidatePath()` for cache invalidation. No API routes.
- **Availability** is computed dynamically from `assignments.json` (40 hrs/week baseline minus assigned hours). Use `getCurrentAvailabilityFte(employeeId, assignments)` from `src/lib/availability.ts`.
- **Staffed status**: a project in `staffed` status is treated as awarded and fully staffed; it is excluded from unassigned demand calculations alongside `awarded` and `lost`.
- **Capacity calculations** (`src/lib/capacity.ts`): averages raw and probability-weighted demand over a 6-month rolling window per LCAT, compared against current availability FTE.
- All page-level components are Server Components that fetch data; interactive parts are Client Components.

## Build Notes

- `@radix-ui/react-badge` does not exist — badge is a simple `cva` component in `src/components/ui/badge.tsx`
- ESLint strict mode: no empty interfaces (use `type X = ...`), no unused vars
- Delete `.next/` cache if you encounter stale module resolution errors after major changes

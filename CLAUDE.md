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

## Project Structure

```
Engineering_manager_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (dark theme, sidebar)
│   │   ├── page.tsx                # Redirects to /dashboard
│   │   ├── globals.css             # Tailwind + shadcn/ui theme (orange)
│   │   ├── dashboard/page.tsx      # Demand dashboard with charts
│   │   ├── projects/
│   │   │   ├── page.tsx            # Project list
│   │   │   ├── new/page.tsx        # New project form
│   │   │   └── [id]/page.tsx       # Project detail / edit
│   │   ├── employees/
│   │   │   ├── page.tsx            # Employee roster
│   │   │   └── new/page.tsx        # Add/edit employee
│   │   ├── matching/page.tsx       # Skill matching view
│   │   └── settings/page.tsx       # LCAT & Skill configuration
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (16 components)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx         # Sidebar navigation + role switcher
│   │   │   └── header.tsx          # Page header
│   │   ├── projects/               # Project-related components
│   │   ├── dashboard/              # Dashboard chart components
│   │   ├── employees/              # Employee-related components
│   │   ├── matching/               # Skill matching components
│   │   └── settings/               # Settings management components
│   ├── lib/
│   │   ├── data.ts                 # JSON file read/write helpers
│   │   ├── utils.ts                # cn() utility for Tailwind
│   │   └── matching.ts             # Skill matching scoring logic
│   ├── actions/
│   │   ├── projects.ts             # Server actions for project CRUD
│   │   ├── employees.ts            # Server actions for employee CRUD
│   │   └── settings.ts             # Server actions for LCATs & skills
│   └── types/index.ts              # TypeScript interfaces
├── data/                           # JSON persistence (seed data included)
│   ├── projects.json               # 7 seed projects
│   ├── employees.json              # 12 seed employees
│   ├── lcats.json                  # 5 labor categories
│   └── skills.json                 # 15 skills
└── package.json
```

## Data Models

- **Project** - name, client, status (preliminary/proposal_submitted/awarded/lost), winProbability (0-100), period of performance, LCAT requirements
- **LCATRequirement** - lcatId, fteCount, requiredSkills[]
- **LCAT** - Labor Category (e.g., Mechanical Engineer, Electrical Engineer)
- **Skill** - Technical skill (e.g., SolidWorks, PCB Design)
- **Employee** - name, lcatId, skills[], availability (0.0-1.0 FTE)

## Key Features

### Dashboard (`/dashboard`)
- Summary cards: total preliminary projects, FTE demand, weighted FTE demand, awarded projects
- Demand-by-LCAT bar chart (raw vs weighted by win probability)
- 12-month demand timeline (stacked area chart by LCAT)
- Project pipeline breakdown by status

### Projects (`/projects`)
- Project list with status filter tabs (All, Preliminary, Proposal Submitted, Awarded, Lost)
- Create/edit form with LCAT requirements builder
- Win probability slider, period of performance dates

### Employees (`/employees`)
- Employee roster with LCAT, skills badges, availability indicators
- Add/edit form with skill checkboxes and availability slider

### Matching (`/matching`)
- Select a project to see employee matches per LCAT requirement
- Scoring: 50% LCAT match + 50% skill match percentage
- Skill gap highlighting (skills no employee has)

### Settings (`/settings`)
- CRUD management for Labor Categories and Skills
- Tabbed interface

### Role Switcher
- Sidebar dropdown: BD Program Manager, Engineering Manager, Engineer
- Controls which nav items are visible (stored in localStorage)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
```

## Architecture Notes

- **Data layer** (`src/lib/data.ts`): reads/writes JSON files in `/data/` using Node.js `fs` module
- **Server Actions** handle all mutations with `revalidatePath()` for cache invalidation
- **No API routes** - all data flows through Server Actions
- **Matching logic** (`src/lib/matching.ts`): scores employees against LCAT requirements using a 50/50 weighting of LCAT match and skill coverage percentage
- All page-level components are Server Components that fetch data; interactive parts are Client Components

## Build Notes

- `create-next-app@14` rejects directory names with capital letters - use temp directory workaround
- `@radix-ui/react-badge` does not exist as a package - badge is a simple `cva` component
- ESLint strict mode: no empty interfaces (use `type X = ...`), no unused vars
- Delete `.next/` cache if you encounter stale module resolution errors after major changes

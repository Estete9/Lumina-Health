# Lumina Health — Practice Management & Clinical Analysis Platform

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Origin Repository:** [https://github.com/Estete9/Lumina-Health.git](https://github.com/Estete9/Lumina-Health.git)

## Project Vision & Architecture

Lumina Health is a secure, practitioner-first clinical management tool designed specifically for clinical psychologists. The platform streamlines the management of patient rosters, structured session notes, intake diagnostic profiling, and appointment schedules.

### Strict UI / Service Layer Abstraction

Lumina Health enforces a strict architectural boundary between the UI and backend data services. React UI components are completely decoupled from database logic and queries. Instead, the UI layer strictly consumes typed API modules located within the `lib/services/*` directory, ensuring maintainability, security, and clean separation of concerns.

## Core Features

- 📊 **Practitioner Dashboard**: High-level overview analytics, daily appointment schedule, and quick patient intake actions at a glance.
- 🩺 **Patient Roster & Intake Modal**: Dynamic search capabilities, active/inactive status filtering, mandatory DSM-5 primary clinical focus selectors, `@`-mention secondary ailment tag extraction (e.g., `@Insomnia`, `@PanicAttacks`), and a responsive modal with intelligent viewport bounding.
- 📝 **Patient Profiles & Clinical Notes**: Detailed patient timeline, structured note-taking (discoveries, daily actions, ailments), and integrated comorbidity tag badges.
- 📅 **Interactive Calendar**: Comprehensive appointment scheduling and calendar views for seamlessly managing client consultations.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security policies, typed service layer).

## Getting Started & Installation

Follow these steps to set up the project locally:

**Step 1: Clone the repository**
```bash
git clone https://github.com/Estete9/Lumina-Health.git
cd Lumina-Health
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Environment Configuration**
Create a `.env.local` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 4: Run the development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Step 5: Type checking & building**
```bash
npx tsc --noEmit
npm run build
```

## Git Push Quick Commands

To push this project to a new GitHub repository:

```bash
git remote add origin https://github.com/Estete9/Lumina-Health.git
git branch -M main
git add .
git commit -m "feat: complete Lumina Health practice management platform"
git push -u origin main
```

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Solo & small-group clinical psychologists, psychotherapists, and mental health practitioners managing outpatient psychotherapy practices.

## Product Purpose

Lumina Health provides a secure, streamlined practice management and clinical analytics platform designed specifically for psychological care. It unifies daily scheduling, structured clinical note-taking (session discoveries, daily actions, ailments), patient risk monitoring, and practice sustainability analytics into a cohesive, practitioner-first workspace.

## Positioning

An all-in-one mental health practice platform that pairs fast, structured clinical workflows with dual-lens practice intelligence—giving clinicians a 50/50 balance of measurement-based clinical efficacy (symptom trajectories, standardized scales) and financial operations (billable hours, attendance patterns, and documentation compliance) without the bloat of generic medical EHRs.

## Operating Context

- **Daily Morning & Between-Session Care:** Reviewing appointments, quickly logging structured session notes within the 48-hour compliance window, reviewing positive risk screens, and prepping for consultations.
- **Monthly Practice Administration:** Evaluating caseload trajectory (improving vs. stable vs. worsening), tracking intake-to-retention funnels, monitoring insurance vs. private-pay revenue, and auditing documentation timeliness.

## Capabilities and Constraints

- **Core Capabilities:** Secure patient roster, interactive session calendar with telehealth link integration, clinical notes hub with discovery tagging, and a multi-view Psychology Practice Analytics Dashboard (Overview, Clinical, Attendance, Financial, Pipeline, Compliance).
- **Technical & Security Constraints:** Strict HIPAA compliance and client de-identification across analytics and feeds; strict service-layer repository abstraction between React UI and Supabase PostgreSQL with Row Level Security (RLS).

## Brand Commitments

- **Identity & Name:** Lumina Health / Willow Grove practice styling.
- **Tone & Aesthetic:** Calming, clinical, natural palette—deep pine (`#3D5A50`), sage (`#7C9473`), amber (`#C98A3E`), brick (`#B0473E`), dark sidebar (`#10161A`), and warm surfaces (`#F3F4EF` / `#FFFFFF`). Clean typography (Inter, Fraunces serif, IBM Plex Mono).

## Evidence on Hand

- Fully functional Next.js App Router application with dual-mode Supabase/Mock data services.
- Real-time appointment scheduling, patient timeline tracking, and live-tested test suites (Jest unit + Playwright E2E).

## Product Principles

1. **Practitioner First:** Reduce cognitive load between client sessions with fast, frictionless data entry and clean information hierarchy.
2. **Measurement-Based Care:** Center analytics around client outcome trajectories rather than mere headcounts.
3. **Dual-Lens Balance:** Provide equal visibility into clinical efficacy and business sustainability.
4. **Privacy by Default:** Enforce HIPAA de-identification and strict data isolation across all views.

## Accessibility & Inclusion

- High-contrast visual hierarchies, accessible form controls, keyboard navigability, and clear status indicators with text labels accompanying color codes.

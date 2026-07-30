-- Migration: 20260729215000_update_appointments.sql
-- Purpose: Fix schema mismatch in public.appointments table to align with Frontend Appointment model and service layer

ALTER TABLE public.appointments
  DROP COLUMN IF EXISTS start_time,
  DROP COLUMN IF EXISTS end_time;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS patient_name TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS session_type TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS telehealth_url TEXT,
  ADD COLUMN IF NOT EXISTS telehealth_provider TEXT;

-- Create index on scheduled_at for optimized chronological queries
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);

-- Create practitioners table
CREATE TABLE public.practitioners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    secondary_ailments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clinical_notes table
CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    discoveries TEXT,
    daily_actions TEXT,
    ailments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Practitioners can only read and update their own profile
CREATE POLICY "Practitioners can view own profile" 
    ON public.practitioners FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Practitioners can update own profile" 
    ON public.practitioners FOR UPDATE 
    USING (auth.uid() = id);

-- Patients policies (practitioner scoped)
CREATE POLICY "Practitioners can manage their patients" 
    ON public.patients FOR ALL 
    USING (practitioner_id = auth.uid());

-- Clinical notes policies (practitioner scoped)
CREATE POLICY "Practitioners can manage their clinical notes" 
    ON public.clinical_notes FOR ALL 
    USING (practitioner_id = auth.uid());

-- Appointments policies (practitioner scoped)
CREATE POLICY "Practitioners can manage their appointments" 
    ON public.appointments FOR ALL 
    USING (practitioner_id = auth.uid());

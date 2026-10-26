-- ==============================================================================
-- CivicPulse AI: Municipal Complaint Analyzer Database Schema for Supabase
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'Elevated', 'Urgent', 'Immediate')),
    ai_confidence NUMERIC DEFAULT 0.85,
    urgency_reasons TEXT[] DEFAULT '{}',
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    population TEXT DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Progress', 'Resolved', 'Rejected')),
    image_url TEXT,
    department TEXT DEFAULT 'Municipal Public Works',
    official_notes TEXT,
    citizen_name TEXT,
    citizen_contact TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Allow public read & submit (can be restricted to auth roles later if desired)
DROP POLICY IF EXISTS "Public can view complaints" ON public.complaints;
CREATE POLICY "Public can view complaints" 
ON public.complaints FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public can submit complaints" ON public.complaints;
CREATE POLICY "Public can submit complaints" 
ON public.complaints FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update complaint status" ON public.complaints;
CREATE POLICY "Public can update complaint status" 
ON public.complaints FOR UPDATE 
USING (true);

-- 4. Enable Realtime on complaints table
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;

-- 5. Storage Bucket for Complaint Evidence Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaint-evidence', 'complaint-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public can upload evidence photos" ON storage.objects;
CREATE POLICY "Public can upload evidence photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-evidence');

DROP POLICY IF EXISTS "Public can view evidence photos" ON storage.objects;
CREATE POLICY "Public can view evidence photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-evidence');

-- 6. Insert Starter Seed Data (Sample Civic Complaints)
INSERT INTO public.complaints 
(id, title, description, category, severity, priority, ai_confidence, urgency_reasons, location, latitude, longitude, population, status, image_url, department, official_notes, citizen_name, citizen_contact)
VALUES
(
  'CMP-20261026-8801',
  'Exposed High-Voltage Cable Near Primary School Gate',
  'A high voltage live wire has snapped from the utility pole and is hanging directly over the pedestrian pathway outside St. Jude School. Sparks visible during drizzle.',
  'Electricity & Lighting',
  'Critical',
  'Immediate',
  0.96,
  ARRAY['danger/safety language detected', 'high-footfall/vulnerable location mentioned', 'electrocution hazard'],
  'St. Jude School Road, Central District',
  12.9716,
  77.5946,
  'High',
  'In Progress',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  'Electricity Supply Board (BESCOM/State Power)',
  'Emergency crew dispatched. Power isolated on sub-circuit 4. Lineman team on site repairing cable.',
  'Anand Sharma',
  '+91 98765 43210'
),
(
  'CMP-20261026-6412',
  'Massive Water Main Rupture Flooding Sub-Highway',
  'Underground clean drinking water main burst. Thousands of gallons gushing out per minute, submerging two lanes and causing severe soil erosion around storm drain.',
  'Water Supply & Sewage',
  'High',
  'Urgent',
  0.92,
  ARRAY['flooding hazard', 'critical infrastructure damage', 'public water loss'],
  'Outer Ring Road, Near Tech Park Junction',
  12.9352,
  77.6245,
  'High',
  'In Progress',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  'Water Supply & Sewerage Board',
  'Valves V-12 and V-14 shut off. Excavator arriving at 20:30 for joint replacement.',
  'Priya Nair',
  '+91 91234 56789'
),
(
  'CMP-20261025-3319',
  'Deep Potholes and Fractured Culvert on Market Road',
  'Multiple deep potholes across 200m stretch. Two delivery scooters skidded this morning. Fractured concrete culvert with exposed rebar.',
  'Roads & Infrastructure',
  'Medium',
  'Elevated',
  0.89,
  ARRAY['accident risk', 'structural deterioration'],
  'Old Bazaar 4th Cross, City Market',
  12.9654,
  77.5781,
  'Medium',
  'Submitted',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  'Public Works Department (PWD)',
  'Queued for zonal engineering inspection on Monday morning.',
  'Rajesh Kumar',
  'rajesh.k@gmail.com'
),
(
  'CMP-20261024-1904',
  'Illegal Garbage Dump Overflowing Near Maternity Clinic',
  'Garbage has not been collected for 6 days. Stray animals scattering biomedical and domestic waste. Foul odor and mosquito breeding grounds.',
  'Garbage & Sanitation',
  'High',
  'Urgent',
  0.94,
  ARRAY['public health risk language detected', 'dengue/mosquito vector threat', 'vulnerable clinic vicinity'],
  'Opposite City Community Health Center, Ward 14',
  12.9812,
  77.6033,
  'High',
  'Resolved',
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  'Solid Waste Management Division',
  'Heavy compactor truck deployed. Area cleared, sanitized with bleaching powder, and anti-dumping surveillance sign erected.',
  'Deepa M',
  '+91 99887 76655'
),
(
  'CMP-20261023-7721',
  'Uncovered Deep Manhole on Walking Track',
  'Cast iron manhole cover was displaced or stolen. Over 8 feet deep drop directly on evening joggers path without barricades.',
  'Public Safety & Hazards',
  'Critical',
  'Immediate',
  0.97,
  ARRAY['danger/safety language detected', 'fatal drop hazard', 'pedestrian safety'],
  'Lakeview Promenade Park, North Gate',
  12.9902,
  77.5912,
  'Medium',
  'Resolved',
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  'Municipal Disaster & Safety Cell',
  'Immediate barricade installed within 45 mins. Heavy ductile iron lid locked in place.',
  'Vikram Seth',
  'vikram.seth@outlook.com'
)
ON CONFLICT (id) DO NOTHING;

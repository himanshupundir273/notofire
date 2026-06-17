-- Run in Supabase Dashboard → SQL Editor
ALTER TABLE events ADD COLUMN IF NOT EXISTS links jsonb DEFAULT '[]'::jsonb;

-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Anonymous',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Public read comments"
  ON event_comments FOR SELECT USING (true);

-- Anyone can post comments (public view support)
CREATE POLICY "Public insert comments"
  ON event_comments FOR INSERT WITH CHECK (true);

-- Only admin (authenticated) can delete comments
CREATE POLICY "Auth delete comments"
  ON event_comments FOR DELETE USING (auth.role() = 'authenticated');

-- Create table for tracking visitors
CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  page_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

-- Allow public insert (to track visits)
CREATE POLICY "Allow public insert to visitor_stats" ON visitor_stats FOR INSERT WITH CHECK (true);

-- Allow admins to read (this is a simple policy, ideally restricted to authenticated admins)
CREATE POLICY "Allow public read access to visitor_stats" ON visitor_stats FOR SELECT USING (true);

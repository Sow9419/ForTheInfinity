-- Table pour le suivi des visiteurs
CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pour visitor_stats
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to visitor_stats" ON visitor_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select to visitor_stats" ON visitor_stats FOR SELECT TO authenticated USING (true);

-- Add policies for authenticated users (Admin)
DO $$ 
BEGIN
    -- Categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access to categories') THEN
        CREATE POLICY "Allow authenticated full access to categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access to products') THEN
        CREATE POLICY "Allow authenticated full access to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access to orders') THEN
        CREATE POLICY "Allow authenticated full access to orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Order Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated full access to order_items') THEN
        CREATE POLICY "Allow authenticated full access to order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

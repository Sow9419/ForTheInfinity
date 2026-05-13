-- Simplification des politiques : Accès public total pour le développement
-- (Conformément à la demande de l'utilisateur de ne pas imposer d'authentification pour le moment)

DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow public all access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public all access to products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
CREATE POLICY "Allow public all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
CREATE POLICY "Allow public all access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Table visitor_stats si elle n'existe pas
CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access to visitor_stats" ON visitor_stats FOR ALL USING (true) WITH CHECK (true);

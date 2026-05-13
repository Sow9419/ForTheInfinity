-- Nettoyage final des politiques RLS
-- Objectif : Une seule politique d'accès total public par table

-- Categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated full access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public all access to categories" ON categories;
CREATE POLICY "Allow public all access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated full access to products" ON products;
DROP POLICY IF EXISTS "Allow public all access to products" ON products;
CREATE POLICY "Allow public all access to products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public all access to orders" ON orders;
CREATE POLICY "Allow public all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated full access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public all access to order_items" ON order_items;
CREATE POLICY "Allow public all access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Visitor Stats
DROP POLICY IF EXISTS "Allow public insert to visitor_stats" ON visitor_stats;
DROP POLICY IF EXISTS "Allow authenticated select to visitor_stats" ON visitor_stats;
DROP POLICY IF EXISTS "Allow public all access to visitor_stats" ON visitor_stats;
CREATE POLICY "Allow public all access to visitor_stats" ON visitor_stats FOR ALL USING (true) WITH CHECK (true);

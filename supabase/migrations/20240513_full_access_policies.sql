-- Enable Full Access (CRUD) for all tables
-- WARNING: This migration enables public access for all operations.
-- In a production environment, these should be restricted to authenticated users (admins).

-- Categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow full access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow full access to products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
CREATE POLICY "Allow full access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
CREATE POLICY "Allow full access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Visitor Stats
DROP POLICY IF EXISTS "Allow public insert to visitor_stats" ON visitor_stats;
DROP POLICY IF EXISTS "Allow public read access to visitor_stats" ON visitor_stats;
CREATE POLICY "Allow full access to visitor_stats" ON visitor_stats FOR ALL USING (true) WITH CHECK (true);

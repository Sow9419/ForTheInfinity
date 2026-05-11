-- Create Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  price NUMERIC NOT NULL,
  image TEXT, -- Path in 'product' bucket
  images TEXT[], -- Array of paths in 'product' bucket
  tall BOOLEAN DEFAULT FALSE,
  short_description TEXT,
  extended_description TEXT,
  rating NUMERIC DEFAULT 5,
  reviews_count INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT DEFAULT 'Bamako',
  address TEXT,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Nouveau',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Categories: Anyone can read
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);

-- Products: Anyone can read
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);

-- Orders: Anyone can insert, but no public read
CREATE POLICY "Allow public insert access to orders" ON orders FOR INSERT WITH CHECK (true);

-- Order Items: Anyone can insert, but no public read
CREATE POLICY "Allow public insert access to order_items" ON order_items FOR INSERT WITH CHECK (true);

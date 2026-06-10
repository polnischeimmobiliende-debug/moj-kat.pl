/*
  MOJ-KAT.PL - IMPROVED SCHEMA (SEO + SEARCH + SCALE READY + FIXED)
*/

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =========================================================
-- PROPERTIES
-- =========================================================
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  slug text UNIQUE,

  title text NOT NULL,
  description text NOT NULL DEFAULT '',

  property_type text NOT NULL DEFAULT 'apartment',
  transaction_type text NOT NULL DEFAULT 'sale',

  price numeric NOT NULL DEFAULT 0,
  area numeric NOT NULL DEFAULT 0,
  rooms integer NOT NULL DEFAULT 0,

  floor integer,
  total_floors integer,

  city text NOT NULL DEFAULT '',
  district text DEFAULT '',
  street text DEFAULT '',

  latitude numeric,
  longitude numeric,

  construction_year integer,
  building_type text DEFAULT '',
  heating_type text DEFAULT '',
  parking text DEFAULT '',
  furnished boolean DEFAULT false,

  images text[] DEFAULT '{}',

  status text NOT NULL DEFAULT 'active',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  search_vector tsvector
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active properties"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can add properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- FAVORITES
-- =========================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, property_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_transaction ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city, status);
CREATE INDEX IF NOT EXISTS idx_properties_type_status ON properties(property_type, status);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_status ON properties(transaction_type, status);

-- FULL TEXT SEARCH INDEX (FIX)
CREATE INDEX IF NOT EXISTS properties_search_vector_idx
ON properties
USING GIN (search_vector);

-- =========================================================
-- FULL TEXT SEARCH TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION properties_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('simple',
      coalesce(NEW.title,'') || ' ' ||
      coalesce(NEW.description,'') || ' ' ||
      coalesce(NEW.city,'') || ' ' ||
      coalesce(NEW.district,'')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_search_trigger ON properties;

CREATE TRIGGER properties_search_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION properties_search_update();

-- =========================================================
-- AUTO PROFILE CREATE
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- UPDATED_AT FIX
-- =========================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON properties;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
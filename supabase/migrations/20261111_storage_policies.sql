-- ============================================================================
-- 2026-11-11 — Politiques RLS du stockage (upload d'images côté admin)
--
-- Symptôme : « Impossible d'ajouter un produit / un slide Hero » avec
-- l'erreur  "new row violates row-level security policy" (code AccessDenied).
--
-- Cause : le bucket "product" (images produits + slides Hero) n'avait AUCUNE
-- policy d'INSERT sur storage.objects pour le rôle anon utilisé par l'admin.
-- Comme l'upload d'images est effectué AVANT l'enregistrement en base, la
-- création du produit échouait en cascade. Le bucket "article-images" avait
-- déjà une policy d'insertion (upload OK).
--
-- Le RLS des TABLES (products, categories, sizes, product_sizes, promo_codes,
-- hero_sections, orders, order_items) est déjà en "full access" : vérifié par
-- tests INSERT/UPDATE/DELETE avec la clé anon.
--
-- À exécuter dans le SQL Editor de Supabase (une seule fois).
-- ============================================================================

BEGIN;

-- --- Lecture des objets des buckets utilisés par la boutique -------------
DROP POLICY IF EXISTS "Allow public read on storage.objects" ON storage.objects;
CREATE POLICY "Allow public read on storage.objects" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product', 'article-images'));

-- --- Upload (création d'images) ------------------------------------------
DROP POLICY IF EXISTS "Allow public insert on storage.objects" ON storage.objects;
CREATE POLICY "Allow public insert on storage.objects" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id IN ('product', 'article-images'));

-- --- Remplacement d'image ------------------------------------------------
DROP POLICY IF EXISTS "Allow public update on storage.objects" ON storage.objects;
CREATE POLICY "Allow public update on storage.objects" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id IN ('product', 'article-images'))
  WITH CHECK (bucket_id IN ('product', 'article-images'));

-- --- Suppression d'image --------------------------------------------------
DROP POLICY IF EXISTS "Allow public delete on storage.objects" ON storage.objects;
CREATE POLICY "Allow public delete on storage.objects" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id IN ('product', 'article-images'));

COMMIT;

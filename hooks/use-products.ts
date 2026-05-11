import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { supabase, getProductImageUrl } from '@/lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        const mappedProducts = data.map((record: any) => ({
          id: record.id,
          name: record.name,
          subtitle: record.subtitle,
          price: record.price,
          image: getProductImageUrl(record.image),
          images: (record.images || []).map((path: string) => getProductImageUrl(path)),
          tall: record.tall || false,
          shortDescription: record.short_description,
          extendedDescription: record.extended_description,
          rating: record.rating,
          reviewsCount: record.reviews_count,
          variants: record.variants,
          category: record.category_id,
        }));

        setProducts(mappedProducts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}

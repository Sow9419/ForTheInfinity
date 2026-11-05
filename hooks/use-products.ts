import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { mapProductRecord, PRODUCTS_SELECT } from '@/lib/product-mapping';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 1) Requête avec les tailles jointes (nécessite la migration commerce)
        let data: any[] | null = null;
        const joined = await supabase
          .from('products')
          .select(PRODUCTS_SELECT)
          .order('created_at', { ascending: false });

        if (joined.error) {
          // 2) Fallback : requête simple si la relation n'existe pas encore
          const plain = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          if (plain.error) throw plain.error;
          data = plain.data;
        } else {
          data = joined.data;
        }

        setProducts((data || []).map((record: any) => mapProductRecord(record, record.product_sizes)));
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

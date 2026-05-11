import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (supabaseError) throw supabaseError;
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

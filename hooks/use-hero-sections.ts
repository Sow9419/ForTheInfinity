import { useState, useEffect } from 'react';
import { HeroSlide } from '@/types';
import { supabase, getProductImageUrl } from '@/lib/supabase';

export function useHeroSections() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('hero_sections')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        const mapped = (data || []).map((record: any) => ({
          id: record.id,
          image: getProductImageUrl(record.image),
          title: record.title,
          description: record.description,
          position: record.position || '50% 50%',
        }));

        setHeroSlides(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroSlides();
  }, []);

  return { heroSlides, loading, error };
}

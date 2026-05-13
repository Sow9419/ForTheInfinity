'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackVisit = async () => {
      // Don't track admin or auth pages
      if (pathname.startsWith('/admin') || pathname.startsWith('/authentification')) {
        return;
      }

      try {
        await supabase.from('visitor_stats').insert([{
          page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
          user_agent: window.navigator.userAgent,
        }]);
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    trackVisit();
  }, [pathname, searchParams]);

  return null;
}

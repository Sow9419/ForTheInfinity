import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// If the URL is just the project ID, we should format it correctly
const fullSupabaseUrl = supabaseUrl.includes('.') 
  ? supabaseUrl 
  : `https://${supabaseUrl}.supabase.co`;

export const supabase = createClient(fullSupabaseUrl, supabaseAnonKey);

/**
 * Helper pour obtenir l'URL publique d'une image dans le bucket 'product'
 */
export const getProductImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Déjà une URL complète
  const { data } = supabase.storage.from('product').getPublicUrl(path);
  return data.publicUrl;
};

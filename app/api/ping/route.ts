import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Route API de Heartbeat pour Supabase
 * Sécurisée par une clé secrète.
 * URL : /api/ping?key=infinity_issa_cisse_2026_secure
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  // Vérification de la clé de sécurité via variable d'environnement
  const SECRET = process.env.CRON_SECRET;

  if (!SECRET || key !== SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Requête ultra-légère pour maintenir la DB active
    const { error } = await supabase
      .from('products')
      .select('id')
      .limit(1)
      .single();

    // PGRST116 signifie que la table est vide, ce qui compte quand même comme une activité
    if (error && error.code !== 'PGRST116') throw error;

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: 'active',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error: any) {
    console.error('Supabase Heartbeat Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Heartbeat failed'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/promo/validate
 * Body: {
 *   code: string,
 *   items?: { id: string, quantity: number, price: number }[],
 *   subtotal?: number
 * }
 * → Valide un code promo (actif, non expiré, usages restants, produits ciblés)
 *   et renvoie le montant de remise calculé côté serveur.
 *   Si le code est limité à certains produits, la remise ne porte que sur
 *   les lignes correspondantes du panier.
 */
export async function POST(request: Request) {
  try {
    const { code, items, subtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Code manquant' }, { status: 400 });
    }

    const normalized = code.trim().toUpperCase();

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', normalized)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, message: 'Code promo invalide' });
    }

    if (promo.active === false) {
      return NextResponse.json({ valid: false, message: 'Ce code promo est désactivé' });
    }

    if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ valid: false, message: 'Ce code promo a expiré' });
    }

    if (promo.max_uses != null && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, message: 'Ce code promo a atteint sa limite d\u2019utilisations' });
    }

    const percent = Number(promo.discount_percent) || 0;

    // ---- Restriction à certains produits ----
    const productIds: string[] | null = Array.isArray(promo.product_ids) && promo.product_ids.length > 0
      ? promo.product_ids
      : null;

    let base = Number(subtotal) || 0;
    let appliesToCount = null;

    if (productIds) {
      const cartItems = Array.isArray(items) ? items : [];
      const matched = cartItems.filter((item: any) => productIds.includes(item.id));
      appliesToCount = matched.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);

      if (appliesToCount === 0) {
        return NextResponse.json({
          valid: false,
          message: 'Ce code ne s\u2019applique pas aux produits de votre panier',
        });
      }

      // La remise ne porte que sur les produits ciblés
      base = matched.reduce(
        (acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
    }

    const amount = Math.round(base * (percent / 100));

    return NextResponse.json({
      valid: true,
      code: normalized,
      discountPercent: percent,
      discountAmount: amount,
      productLimited: !!productIds,
      appliesToCount,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { generateOrderEmailHtml } from '@/components/emails/OrderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total, city, coordinates, promo_code } = body;

    // ---- Recalcul serveur du sous-total à partir des lignes (prix effectifs) ----
    const hasItems = Array.isArray(items) && items.length > 0;
    const itemsSubtotal = hasItems
      ? items.reduce((acc: number, it: any) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
      : 0;

    // ---- Revalidation serveur du code promo ----
    // Le client ne fait pas autorité : un code supprimé, désactivé, expiré ou
    // épuisé entre le moment de l'application et l'envoi de la commande est
    // automatiquement retiré ici, et la remise est recalculée selon le
    // périmètre (tout le panier ou produits ciblés).
    let appliedPromoCode: string | null = null;
    let appliedDiscount = 0;
    let appliedPercent: number | null = null;

    if (promo_code) {
      try {
        const normalized = String(promo_code).trim().toUpperCase();
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('*')
          .ilike('code', normalized)
          .maybeSingle();

        const isValid =
          !!promo &&
          promo.active !== false &&
          (!promo.expires_at || new Date(promo.expires_at).getTime() >= Date.now()) &&
          (promo.max_uses == null || (promo.used_count ?? 0) < promo.max_uses);

        if (isValid) {
          const percent = Number(promo!.discount_percent) || 0;
          const ids: string[] | null =
            Array.isArray(promo!.product_ids) && promo!.product_ids.length > 0
              ? promo!.product_ids
              : null;
          let base = itemsSubtotal;
          if (ids && hasItems) {
            base = items
              .filter((it: any) => ids.includes(String(it.id)))
              .reduce((acc: number, it: any) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
          }
          appliedDiscount = Math.min(Math.round(base * (percent / 100)), itemsSubtotal);
          appliedPromoCode = String(promo!.code).toUpperCase();
          appliedPercent = percent;
        }
      } catch (promoRevalidationError) {
        console.error('Promo revalidation error:', promoRevalidationError);
      }
    }

    // Total final serveur : sous-total − remise revalidée (jamais négatif).
    // Sans lignes exploitables, on retombe sur le total envoyé par le client.
    const finalTotal = hasItems
      ? Math.max(0, itemsSubtotal - appliedDiscount)
      : Math.max(0, Number(total) || 0);

    // 1. Créer la commande client
    //    -> Si la migration commerce n'est pas encore exécutée (colonnes promo_code/discount absentes),
    //       on retente l'insert sans ces colonnes pour ne jamais bloquer une commande.
    let order: any = null;
    let orderError: any = null;
    {
      const full = await supabase
        .from('orders')
        .insert([
          {
            full_name: name,
            phone: phone,
            city: city || "Bamako",
            address: address,
            total: finalTotal,
            promo_code: appliedPromoCode,
            discount: appliedDiscount,
            status: "Nouveau"
          }
        ])
        .select()
        .single();
      order = full.data;
      orderError = full.error;

      if (orderError) {
        const minimal = await supabase
          .from('orders')
          .insert([
            {
              full_name: name,
              phone: phone,
              city: city || "Bamako",
              address: address,
              total: total,
              status: "Nouveau"
            }
          ])
          .select()
          .single();
        order = minimal.data;
        orderError = minimal.error;
      }
    }

    if (orderError) throw orderError;

    const orderId = order.id;

    // 2. Créer les OrderItems liés à cette commande
    //    -> Idem : fallback si la colonne `price` (snapshot) n'existe pas encore.
    let itemsError: any = null;
    {
      const withPrice = await supabase
        .from('order_items')
        .insert(
          items.map((item: any) => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            size: item.selectedSizes?.join(', ') || '',
            price: item.price ?? null
          }))
        );
      itemsError = withPrice.error;

      if (itemsError) {
        const fallback = await supabase
          .from('order_items')
          .insert(
            items.map((item: any) => ({
              order_id: orderId,
              product_id: item.id,
              quantity: item.quantity,
              size: item.selectedSizes?.join(', ') || ''
            }))
          );
        itemsError = fallback.error;
      }
    }

    if (itemsError) throw itemsError;

    // 2b. Incrémenter le compteur d'usage du code promo — UNIQUEMENT si le code
    //     est encore valide après revalidation serveur.
    if (appliedPromoCode) {
      try {
        const { error: promoErr } = await supabase.rpc('increment_promo_usage', { p_code: appliedPromoCode });
        if (promoErr) console.error('Promo usage increment error:', promoErr);
      } catch (e) {
        console.error('Promo usage increment failed:', e);
      }
    }

    // 3. Envoyer l'email de notification via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      console.log("Using Resend API Key:", process.env.RESEND_API_KEY?.substring(0, 7) + "...");
      const emailHtml = generateOrderEmailHtml({
        orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerCoordinates: coordinates,
        items,
        total: finalTotal,
        promoCode: appliedPromoCode,
        discount: appliedDiscount,
        discountPercent: appliedPercent
      });

      // Notification de vente : envoyée à la boîte de la boutique.
      // Destinataire et expéditeur sur le domaine vérifié 4theinfinity.com.
      let notifiedTo = 'contact@4theinfinity.com';
      const { data, error: sendError } = await resend.emails.send({
        from: '4TheInfinity <contact@4theinfinity.com>',
        to: notifiedTo,
        subject: `🛍️ Nouvelle commande - ${name}`,
        html: emailHtml,
      });

      // Si l'envoi échoue, on retente une fois avec l'expéditeur de test
      // Resend pour ne jamais perdre une notification de vente.
      if (sendError) {
        console.warn('Resend primary send failed:', JSON.stringify(sendError));
        const retry = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: notifiedTo,
          subject: `🛍️ Nouvelle commande - ${name}`,
          html: emailHtml,
        });
        if (retry.error) {
          console.error('Resend fallback send error:', JSON.stringify(retry.error));
        } else {
          console.log('Resend fallback success! ID:', retry.data?.id);
        }
      } else {
        console.log('Resend success! ID:', data?.id);
      }
    } catch (emailError: any) {
      console.error("Critical error during Resend process:", emailError.message);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

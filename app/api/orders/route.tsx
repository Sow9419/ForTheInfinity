import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { generateOrderEmailHtml } from '@/components/emails/OrderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total, city, coordinates } = body;

    // 1. Créer la commande client
    const { data: order, error: orderError } = await supabase
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

    if (orderError) throw orderError;

    const orderId = order.id;

    // 2. Créer les OrderItems liés à cette commande
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        items.map((item: any) => ({
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          size: item.selectedSizes?.join(', ') || ''
        }))
      );

    if (itemsError) throw itemsError;

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
        total
      });

      const { data, error: sendError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'dramanesow20@gmail.com',
        subject: `🛍️ Nouvelle commande - ${name}`,
        html: emailHtml,
      });

      if (sendError) {
        console.error("Resend send error details:", JSON.stringify(sendError));
      } else {
        console.log("Resend success! ID:", data?.id);
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

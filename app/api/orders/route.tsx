import { NextResponse } from 'next/server';
import { airtableFetch, Tables } from '@/lib/airtable';
import { Resend } from 'resend';
import { generateOrderEmailHtml } from '@/components/emails/OrderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total, city, coordinates } = body;

    // 1. Créer la commande client
    const orderData = {
      records: [
        {
          fields: {
            "Nom Complet": name,
            "Telephone": phone,
            "Ville": city || "Bamako",
            "Adresse": address,
            "Total": total,
            "Status": "Nouveau"
          }
        }
      ]
    };

    const orderResponse = await airtableFetch(`/${Tables.CommandeClient}`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    const orderId = orderResponse.records[0].id;

    // 2. Créer les OrderItems liés à cette commande
    const orderItemsData = {
      records: items.map((item: any) => ({
        fields: {
          "Order": [orderId],
          "Product": [item.id], // ID de l'enregistrement Airtable du produit
          "Quantity": item.quantity,
          "Size": item.selectedSizes?.join(', ') || ''
        }
      }))
    };

    await airtableFetch(`/${Tables.OrderItems}`, {
      method: 'POST',
      body: JSON.stringify(orderItemsData),
    });

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

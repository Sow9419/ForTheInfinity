interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoordinates?: { lat: number, lon: number } | null;
  items: any[];
  total: number;
  promoCode?: string | null;
  discount?: number;
  discountPercent?: number | null;
}

export function generateOrderEmailHtml({
  orderId,
  customerName,
  customerPhone,
  customerAddress,
  customerCoordinates,
  items,
  total,
  promoCode,
  discount = 0,
  discountPercent,
}: OrderEmailProps): string {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eeeeee;">
      <td style="padding: 15px 0;">
        <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
        ${item.selectedSizes && item.selectedSizes.length > 0 ? `
          <div style="font-size: 11px; color: #666666; margin-top: 4px;">
            Taille : ${item.selectedSizes.join(', ')}
          </div>
        ` : ''}
      </td>
      <td style="text-align: center; padding: 15px 0; font-size: 14px;">${item.quantity}</td>
      <td style="text-align: right; padding: 15px 0; font-weight: bold; font-size: 14px;">
        ${item.originalPrice != null && Number(item.originalPrice) > Number(item.price) ? `
          <span style="text-decoration: line-through; color: #999999; font-weight: normal;">${Number(item.originalPrice * item.quantity).toLocaleString('fr-FR')} FCFA</span><br/>
          <span style="color: #00A025;">${Number(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
        ` : `${Number(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`}
      </td>
    </tr>
  `).join('');

  const mapsLinkHtml = customerCoordinates ? `
    <p style="margin: 10px 0; font-size: 14px;">
      <a href="https://www.google.com/maps?q=${customerCoordinates.lat},${customerCoordinates.lon}" style="color: #00D632; font-weight: bold; text-decoration: none;">
        📍 Voir la localisation GPS sur Google Maps
      </a>
    </p>
  ` : '';

  return `
    <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="background-color: #00D632; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #000000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            Nouvelle Commande !
          </h1>
          <p style="margin: 10px 0 0; color: #000000; opacity: 0.8; font-size: 14px;">
            ID: ${orderId}
          </p>
        </div>

        <div style="padding: 30px 20px;">
          <div style="margin-bottom: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
            <h2 style="font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
              Informations Client
            </h2>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Nom :</strong> ${customerName}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Tél :</strong> ${customerPhone}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Adresse :</strong> ${customerAddress}</p>
            ${mapsLinkHtml}
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
              Détails des Produits
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #eeeeee;">
                  <th style="text-align: left; padding: 10px 0; font-size: 12px; color: #888888;">Produit</th>
                  <th style="text-align: center; padding: 10px 0; font-size: 12px; color: #888888;">Qté</th>
                  <th style="text-align: right; padding: 10px 0; font-size: 12px; color: #888888;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          ${promoCode ? `
            <div style="background-color: #ecfdf5; border: 1px dashed #6ee7b7; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 13px; font-weight: bold; color: #059669;">🎟️ CODE PROMO APPLIQUÉ</div>
                <div style="font-size: 18px; font-weight: 900; color: #059669; letter-spacing: 1px; margin-top: 3px;">${promoCode}${discountPercent != null ? ` <span style="font-size: 12px; font-weight: bold;">(−${discountPercent}%)</span>` : ''}</div>
              </div>
              <div style="font-size: 16px; font-weight: bold; color: #059669;">
                −${Number(discount).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          ` : ''}

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: right;">
            ${promoCode && discount ? `
              <div style="margin-bottom: 10px;">
                <span style="font-size: 12px; color: #888888; margin-right: 15px; text-transform: uppercase;">Sous-total</span>
                <span style="font-size: 14px; font-weight: bold; color: #333333; text-decoration: line-through;">${Number(total + discount).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ` : ''}
            <span style="font-size: 14px; color: #888888; margin-right: 15px; text-transform: uppercase;">Total</span>
            <span style="font-size: 24px; font-weight: 900; color: #00D632;">
              ${Number(total).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
          <p style="margin: 0;">© ${new Date().getFullYear()} FortheInfinity - Système de commande automatique</p>
        </div>
      </div>
    </div>
  `;
}


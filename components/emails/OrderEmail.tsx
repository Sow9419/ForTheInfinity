interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoordinates?: { lat: number, lon: number } | null;
  items: any[];
  total: number;
}

export function generateOrderEmailHtml({
  orderId,
  customerName,
  customerPhone,
  customerAddress,
  customerCoordinates,
  items,
  total,
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
        ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
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

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: right;">
            <span style="font-size: 14px; color: #888888; margin-right: 15px; text-transform: uppercase;">Total</span>
            <span style="font-size: 24px; font-weight: 900; color: #00D632;">
              ${total.toLocaleString('fr-FR')} FCFA
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


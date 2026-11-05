'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_WHATSAPP } from '@/lib/settings';

interface FloatingWhatsAppProps {
  productName: string;
  price: number;
  quantity: number;
  selectedSizes: string[];
}

export function FloatingWhatsApp({ productName, price, quantity, selectedSizes }: FloatingWhatsAppProps) {
  const [currentUrl, setCurrentUrl] = React.useState('');

  React.useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const generateLink = () => {
    const qty = quantity > 0 ? quantity : 1;
    const sizes = selectedSizes.length > 0 ? selectedSizes.join(', ') : 'Non spécifiée';

    const text = `Bonjour, je souhaite commander le produit suivant :\n\n` +
      `*🛒 ${productName}*\n` +
      `*💰 Prix :* ${price.toLocaleString('fr-FR')} FCFA\n\n` +
      `*- Quantité :* ${qty}\n` +
      `*- Taille/Variante :* ${sizes}\n` +
      `*- Nom complet :* ___\n` +
      `*- Téléphone :* ___\n` +
      `*- Ville :* ___\n\n` +
      `*🔗 Lien du produit :* ${currentUrl}`;

    const targetPhone = STORE_WHATSAPP;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <a
      href={generateLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:bg-[#1ebd59] hover:scale-110 active:scale-95 transition-all group"
      aria-label="Commander via WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
      </span>
    </a>
  );
}

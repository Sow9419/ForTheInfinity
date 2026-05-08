import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWhatsAppUrl(productName?: string, price?: number) {
  const phone = "22394231914";
  const baseUrl = `https://wa.me/${phone}`;
  
  if (!productName) {
    return `${baseUrl}?text=${encodeURIComponent("Bonjour Infinity, je souhaiterais avoir plus d'informations sur vos collections.")}`;
  }

  const text = `Bonjour Infinity, je souhaite avoir des informations sur le produit suivant :\n\n` +
    `*🛒 ARTICLE :* ${productName}\n` +
    (price ? `*💰 PRIX :* ${price.toLocaleString('fr-FR')} FCFA\n\n` : '\n') +
    `*- Nom complet :* ___\n` +
    `*- Ville :* ___\n\n` +
    `Merci de me recontacter !`;

  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}

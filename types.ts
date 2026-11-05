// types.ts
export interface Product {
  id: string; // Supabase ID
  name: string;
  subtitle: string;
  price: number;
  image: string;
  images?: string[];
  tall: boolean;
  shortDescription?: string;
  extendedDescription?: string;
  rating?: number;
  reviewsCount?: number;
  variants?: string[];
  category?: string;
  /** Commerce */
  inStock?: boolean;
  promoPrice?: number | null;
  /** Prix effectif facturé (promo si défini) */
  effectivePrice?: number;
  sizes?: ProductSize[];
  /** Statuts (badges liquid glass) */
  isLimited?: boolean; // Édition limitée
  isNew?: boolean;     // Badge "Nouveau"
}

export interface Category {
  id: string;
  name: string;
}

export interface SizeOption {
  id: string;
  name: string;
  position: number;
}

/** Taille d'un produit avec son état de stock */
export interface ProductSize {
  sizeId: string;
  name: string;
  position: number;
  inStock: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  /** Ids des produits ciblés — null ou vide = valable sur tout le panier */
  productIds?: string[] | null;
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description?: string;
  /** Point focal CSS (object-position/background-position), ex: "50% 50%" */
  position?: string;
}

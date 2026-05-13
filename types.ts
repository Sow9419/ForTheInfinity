// types.ts
export interface Product {
  id: string; // Supabase ID
  name: string;
  subtitle: string;
  price: number;
  image: string;
  tall: boolean;
  shortDescription?: string;
  extendedDescription?: string;
  rating?: number;
  reviewsCount?: number;
  variants?: string[];
  category?: string;
}

export interface Category {
  id: string;
  name: string;
}

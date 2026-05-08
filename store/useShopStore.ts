import { create } from 'zustand';
import { Product } from '../types';
import { PRODUCTS } from '../lib/data';

interface ShopStore {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeHeroProduct: Product | null;
  setActiveHeroProduct: (product: Product | null) => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  activeCategory: '',
  setActiveCategory: (category) => set({ activeCategory: category }),
  activeHeroProduct: null,
  setActiveHeroProduct: (product) => set({ activeHeroProduct: product }),
}));

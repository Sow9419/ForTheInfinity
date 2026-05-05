import { create } from 'zustand';
import { Product } from '../types';
import { PRODUCTS } from '../lib/data';

interface ShopStore {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  activeHeroProduct: Product;
  setActiveHeroProduct: (product: Product) => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  activeCategory: 'T-shirt',
  setActiveCategory: (category) => set({ activeCategory: category }),
  activeHeroProduct: PRODUCTS[0],
  setActiveHeroProduct: (product) => set({ activeHeroProduct: product }),
}));

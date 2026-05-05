import { create } from 'zustand';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  cartCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  setIsCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  cartCount: 0,
  totalPrice: 0,
  isCartOpen: false,

  addToCart: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = state.items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [...state.items, { ...product, quantity: 1 }];
    }

    return {
      items: updatedItems,
      cartCount: state.cartCount + 1,
      totalPrice: state.totalPrice + product.price,
      isCartOpen: true,
    };
  }),

  removeFromCart: (productId) => set((state) => {
    const existingItem = state.items.find((item) => item.id === productId);
    if (!existingItem) return state;

    const updatedItems = state.items.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
    ).filter((item) => item.quantity > 0);

    return {
      items: updatedItems,
      cartCount: state.cartCount - 1,
      totalPrice: state.totalPrice - existingItem.price,
    };
  }),

  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
}));

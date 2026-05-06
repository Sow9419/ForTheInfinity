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
  isCheckoutOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  cartCount: 0,
  totalPrice: 0,
  isCartOpen: false,
  isCheckoutOpen: false,

  addToCart: (product, quantity = 1) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = state.items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [...state.items, { ...product, quantity: quantity }];
    }

    return {
      items: updatedItems,
      cartCount: state.cartCount + quantity,
      totalPrice: state.totalPrice + (product.price * quantity),
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
  setIsCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),
  clearCart: () => set({ items: [], cartCount: 0, totalPrice: 0 }),
}));

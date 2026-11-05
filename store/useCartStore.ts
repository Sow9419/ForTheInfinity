import { create } from 'zustand';
import { Product } from '../types';

/** Prix réellement facturé : prix promo si défini et inférieur, sinon prix de base */
export const getEffectivePrice = (product: Product) =>
  product.effectivePrice != null ? product.effectivePrice : product.price;

interface CartItem extends Product {
  quantity: number;
  selectedSizes?: string[];
}

interface CartStore {
  items: CartItem[];
  cartCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  addToCart: (product: Product, quantity?: number, selectedSizes?: string[]) => void;
  removeFromCart: (productId: string) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  updateCartItemSizes: (productId: string, sizes: string[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  cartCount: 0,
  totalPrice: 0,
  isCartOpen: false,
  isCheckoutOpen: false,

  addToCart: (product, quantity = 1, selectedSizes = []) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = state.items.map((item) =>
        item.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + quantity,
              selectedSizes: Array.from(new Set([...(item.selectedSizes || []), ...selectedSizes]))
            }
          : item
      );
    } else {
      updatedItems = [...state.items, { ...product, quantity: quantity, selectedSizes }];
    }

    return {
      items: updatedItems,
      cartCount: state.cartCount + quantity,
      totalPrice: state.totalPrice + (getEffectivePrice(product) * quantity),
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
      totalPrice: Math.max(0, state.totalPrice - getEffectivePrice(existingItem)),
    };
  }),

  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setIsCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),
  updateCartItemSizes: (productId, sizes) => set((state) => ({
    items: state.items.map((item) => 
      item.id === productId ? { ...item, selectedSizes: sizes } : item
    )
  })),
  clearCart: () => set({ items: [], cartCount: 0, totalPrice: 0 }),
}));

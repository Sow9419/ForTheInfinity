'use client';

import React from 'react';
import { ShoppingBasket, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { CartContent } from '@/components/CartContent';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { OrderForm } from './OrderForm';

interface FooterBarProps {
  product: any;
  isDesktop: boolean;
}

export function FooterBar({ product, isDesktop }: FooterBarProps) {
  const { addToCart, cartCount, totalPrice, isCartOpen, setIsCartOpen } = useCartStore();
  const [isOrderOpen, setIsOrderOpen] = React.useState(false);
  const [isOrdered, setIsOrdered] = React.useState(false);
  const [orderQuantity, setOrderQuantity] = React.useState(1);

  const handleAddToCart = () => {
    if (product?.inStock === false) return;
    addToCart(product, 1);
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    setIsOrderOpen(true);
  };

  return (
    <>
      {/* FooterBar flottante */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[75%] w-[92%] md:w-[40%] max-w-[500px] bg-[#161B22]/95 backdrop-blur-md px-[20px] md:px-[25px] py-[12px] md:py-[14px] flex justify-between items-center rounded-full box-border z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5">
        
        {/* Gauche : CartIcon → ouvre le panier global */}
        <button
          onClick={handleOpenCart}
          className="flex items-center gap-[15px] text-white group"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.div
                  key={cartCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2.5 bg-white text-black text-[11px] font-black min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center border-[2.5px] border-[#161B22] shadow-[0_4px_15px_rgba(255,255,255,0.2)]"
                >
                  {cartCount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#888] uppercase tracking-[1px]">PANIER</span>
            <span className="text-[14px] md:text-[16px] font-bold">
              {totalPrice.toLocaleString('fr-FR')} {product.currency}
            </span>
          </div>
        </button>

        {/* Droite : Ajouter au panier */}
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: product?.inStock === false ? 1 : 1.05 }}
          whileTap={{ scale: product?.inStock === false ? 1 : 0.95 }}
          disabled={product?.inStock === false}
          className={`relative group bg-white text-black border-none py-[10px] md:py-[12px] px-[20px] md:px-[25px] rounded-full font-extrabold text-[12px] md:text-[13px] cursor-pointer flex items-center gap-[8px] overflow-hidden shadow-lg transition-all ${product?.inStock === false ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <div className="relative z-10 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ShoppingBasket className="w-4 h-4" strokeWidth={2.5} />
            </motion.div>
            <span>Ajouter</span>
          </div>
        </motion.button>
      </div>

    </>
  );
}

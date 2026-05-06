'use client';

import React from 'react';
import { ShoppingBag, ShoppingCart, ArrowRight } from 'lucide-react';
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
                  className="absolute -top-2 -right-2.5 bg-[#00D632] text-black text-[11px] font-black min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center border-[2.5px] border-[#161B22] shadow-[0_4px_15px_rgba(0,214,50,0.45)]"
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
        <button
          onClick={handleAddToCart}
          className="bg-[#00D632] text-black border-none py-[10px] md:py-[12px] px-[20px] md:px-[25px] rounded-full font-extrabold text-[12px] md:text-[13px] cursor-pointer flex items-center gap-[8px] hover:bg-[#00e836] active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" strokeWidth={2.5} />
          Ajouter
        </button>
      </div>

      {/* Sheet Panier Global (Desktop) */}
      <Sheet open={isCartOpen && isDesktop} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="right"
          className="w-[420px] sm:w-[480px] p-0 overflow-hidden [&>button]:hidden"
        >
          <div className="h-full flex flex-col">
            <CartContent onClose={() => setIsCartOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet Panier Global (Mobile) */}
      <Sheet open={isCartOpen && !isDesktop} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] p-0 overflow-hidden rounded-t-3xl [&>button]:hidden"
        >
          <CartContent onClose={() => setIsCartOpen(false)} showCloseOnMobile />
        </SheetContent>
      </Sheet>
    </>
  );
}

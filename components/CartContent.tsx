'use client';

import React from 'react';
import { ShoppingBag, Plus, Minus, X, ArrowLeft, ShoppingBasket, ChevronRight, ArrowRight } from 'lucide-react';
import { useCartStore, getEffectivePrice } from '../store/useCartStore';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'motion/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { OrderForm } from './detail-product/OrderForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface CartContentProps {
  onClose?: () => void;
  showHeader?: boolean;
  /** Affiche le bouton X sur mobile (utile dans le Sheet) */
  showCloseOnMobile?: boolean;
}

export const SwipeButton = ({ onSwipe, text = "Glisser pour valider" }: { onSwipe: () => boolean | void | Promise<boolean | void>, text?: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const handleDragEnd = (event: any, info: any) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const knobWidth = 48; // w-12 = 48px
    const threshold = containerWidth - knobWidth - 10;

    if (info.offset.x >= threshold) {
      controls.start({ x: containerWidth - knobWidth });
      setTimeout(async () => {
        const result = await onSwipe();
        if (result === false) {
          controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        }
      }, 300);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full h-16 rounded-[2rem] bg-white shadow-lg shadow-emerald-500/20 p-2 overflow-hidden select-none">
      {/* Shimmer background animation */}
      <motion.div
        animate={{ x: ['-200%', '400%'] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] z-0"
      />

      <span className="absolute inset-0 flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-black z-0 pointer-events-none pl-8">
        {text}
        <motion.div
          animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="ml-2 flex items-center"
        >
          <ChevronRight className="w-3 h-3 -mr-1" />
          <ChevronRight className="w-3 h-3 -mr-1 opacity-70" />
          <ChevronRight className="w-3 h-3 opacity-40" />
        </motion.div>
      </span>
      <div ref={containerRef} className="w-full h-full relative">
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="absolute left-0 top-0 w-12 h-12 bg-black rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
        >
          <ShoppingBasket className="w-5 h-5 text-white" />
        </motion.div>
      </div>
    </div>
  );
};

export function CartContent({ onClose, showHeader = true, showCloseOnMobile = false }: CartContentProps) {
  const { cartCount, totalPrice, items, removeFromCart, addToCart, clearCart, setIsCartOpen, setIsCheckoutOpen } = useCartStore();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header */}
      {showHeader && (
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-transparent z-10">
          <h2 className="text-white font-sans uppercase font-black tracking-tight text-left text-lg">
            Mon Panier ({cartCount})
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className={showCloseOnMobile ? 'flex text-gray-100 hover:text-black transition-colors' : 'hidden md:flex text-gray-400 hover:text-black transition-colors'}
            >
              <X size={24} />
            </button>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
            <ShoppingBag size={48} className="opacity-20 text-black" />
            <p className="font-bold uppercase tracking-wider text-sm text-white">Votre panier est vide</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {items.map((item) => (
              <motion.div layout key={item.id} className="flex gap-4 items-center bg-black/10 p-4 rounded-sm border border-gray-100/50">
                <div className="w-24 h-24 rounded-sm bg-white/40 overflow-hidden flex-shrink-0 p-2 relative border border-gray-100">
                  <Image fill sizes="96px" src={item.image || ''} alt={item.name} className="object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-300 uppercase tracking-tight font-sans text-sm line-clamp-1">{item.name}</h4>

                  {/* Affichage des tailles sélectionnées */}
                  {item.selectedSizes && item.selectedSizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedSizes.map(size => (
                        <span key={size} className="text-[9px] font-bold bg-white/30 backdrop-blur-2xl text-white px-1.5 py-0.5 rounded-md uppercase">
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-white font-black mt-1 text-sm">{getEffectivePrice(item).toLocaleString('en-US')} FCFA</p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-2xl rounded-full border border-gray-500 p-1 px-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="text-[10px] font-black min-w-[12px] text-center text-amber-50">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-6 bg-transparent border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-end mb-6">
            <span className="font-black text-white/40 uppercase tracking-widest text-[20px] pb-1">Total</span>
            <div className="text-right">
              <span className="font-black text-3xl text-white tracking-tighter">
                {totalPrice.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-black text-white/50 ml-1 uppercase">FCFA</span>
            </div>
          </div>

          <SwipeButton onSwipe={handleCheckout} />
        </div>
      )}
    </div>
  );
}

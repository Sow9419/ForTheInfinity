'use client';

import React from 'react';
import { ShoppingBag, Plus, Minus, X, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
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

export function CartContent({ onClose, showHeader = true, showCloseOnMobile = false }: CartContentProps) {
  const { cartCount, totalPrice, items, removeFromCart, addToCart, clearCart, setIsCartOpen, setIsCheckoutOpen } = useCartStore();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      {showHeader && (
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-black font-sans uppercase font-black tracking-tight text-left text-lg">
            Mon Panier ({cartCount})
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className={showCloseOnMobile ? 'flex text-gray-400 hover:text-black transition-colors' : 'hidden md:flex text-gray-400 hover:text-black transition-colors'}
            >
              <X size={24} />
            </button>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <ShoppingBag size={48} className="opacity-20" />
            <p className="font-bold uppercase tracking-wider text-sm">Votre panier est vide</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {items.map((item) => (
              <motion.div layout key={item.id} className="flex gap-4 items-center bg-[#F4F3ED] p-4 rounded-[2rem] border border-gray-100/50">
                <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden flex-shrink-0 p-2 relative border border-gray-100">
                   <Image fill sizes="96px" src={item.image || ''} alt={item.name} className="object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-black uppercase tracking-tight font-sans text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-[#00C38A] font-black mt-1 text-sm">{item.price.toLocaleString('en-US')} FCFA</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-3 bg-white/80 rounded-full border border-gray-200 p-1 px-2">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="text-[10px] font-black min-w-[12px] text-center">{item.quantity}</span>
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
        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
           <div className="flex justify-between items-end mb-6">
            <span className="font-black text-gray-400 uppercase tracking-widest text-[10px] pb-1">Total</span>
            <div className="text-right">
               <span className="font-black text-3xl text-black tracking-tighter">
                {totalPrice.toLocaleString('en-US')}
               </span>
               <span className="text-xs font-black text-gray-400 ml-1 uppercase">FCFA</span>
            </div>
          </div>
          
          <Button 
            onClick={handleCheckout}
            className="w-full h-16 rounded-[2rem] bg-[#00C38A] text-white hover:bg-[#00ab78] shadow-lg shadow-emerald-500/20 transition-all flex items-center px-4 gap-4"
          >
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
               <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs text-center pr-10">
              Valider le panier
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderForm } from './detail-product/OrderForm';
import { motion } from 'motion/react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

import { X, ArrowRight, ShoppingBasket, Loader2 } from 'lucide-react';

export function CheckoutContent({ onClose, idForm = "checkout-form" }: { onClose?: () => void, idForm?: string }) {
  const { items, totalPrice, clearCart, setIsCheckoutOpen } = useCartStore();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClear = () => {
    clearCart();
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER (Fixe) */}
      <div className="flex-none pt-4 px-6 md:px-10 border-b border-gray-200 md:border-white/10 pb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight text-black md:text-white">
          Finaliser ma commande
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-black md:text-white/60 md:hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      {/* MAIN (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
        <div className="relative">
          <OrderForm 
            items={items} 
            totalPrice={totalPrice} 
            success={isSuccess} 
            setSuccess={setIsSuccess}
            onClearCart={handleClear}
            onLoadingChange={setIsLoading}
            closeCheckout={() => {
              if (onClose) onClose();
              else setIsCheckoutOpen(false);
            }}
            showFooter={false}
            idForm={idForm}
          />
        </div>
      </div>

      {/* FOOTER (Fixe) */}
      {!isSuccess && items.length > 0 && (
        <div className="flex-none p-6 md:p-10 border-t border-gray-200 md:border-white/10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black text-[10px] uppercase tracking-widest text-gray-700 md:text-white/50">Total à payer</span>
            <span className="font-black text-2xl text-black md:text-white">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="pt-2 w-full">
            <motion.button
              form={idForm}
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.01 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
              className={`group relative w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest text-xs overflow-hidden shadow-xl transition-all duration-300 ${
                isLoading 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-black md:bg-white md:text-black"
              }`}
            >
              {!isLoading && (
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 md:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}
              
              <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer la commande</span>
                    <motion.div 
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ShoppingBasket className="w-4 h-4" strokeWidth={3} />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckoutTunnel() {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCartStore();
  const isMobile = useIsMobile();

  // Sur Desktop, CheckoutContent est géré par ClientLayout
  if (!isMobile) return null;

  return (
    <Sheet open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-[2rem] border-none bg-black/10 backdrop-blur-2xl flex flex-col p-0 overflow-hidden shadow-2xl transition-all duration-500"
      >
        <div className="w-full flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-black/20 rounded-full" />
        </div>
        <CheckoutContent idForm="checkout-form-mobile" />
      </SheetContent>
    </Sheet>
  );
}

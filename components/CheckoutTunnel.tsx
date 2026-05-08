'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderForm } from './detail-product/OrderForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CheckoutTunnel() {
  const { isCheckoutOpen, setIsCheckoutOpen, items, totalPrice, clearCart } = useCartStore();
  const isMobile = useIsMobile();
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleClear = () => {
    clearCart();
  };

  const checkoutContent = (
    <div className="flex flex-col gap-6">
      <OrderForm 
        items={items} 
        totalPrice={totalPrice} 
        success={isSuccess} 
        setSuccess={setIsSuccess}
        onClearCart={handleClear}
        closeCheckout={() => setIsCheckoutOpen(false)}
      />
    </div>
  );

  return (
    <Sheet open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={`
          ${isMobile ? "h-[90vh] rounded-t-[2rem] px-6 pb-20" : "w-[450px] sm:w-[540px] px-10 pb-10"} 
          border-none bg-[#ECEEE5] overflow-y-auto scrollbar-hide shadow-2xl transition-all duration-500
        `}
      >
        {/* Indicateur de glissement (Handle) - Visible surtout sur mobile */}
        {isMobile && (
          <div className="w-full flex justify-center pt-3 pb-6">
            <div className="w-12 h-1.5 bg-black/10 rounded-full" />
          </div>
        )}

        <SheetHeader className={isMobile ? "mb-6" : "mt-10 mb-8"}>
          <SheetTitle className="text-2xl font-black uppercase tracking-tight text-center md:text-left">
            Finaliser ma commande
          </SheetTitle>
        </SheetHeader>

        <div className="relative">
          {checkoutContent}
        </div>
      </SheetContent>
    </Sheet>
  );
}

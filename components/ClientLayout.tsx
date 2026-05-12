'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/store/useCartStore';
import { MobileCartDrawer } from '@/components/MobileCartDrawer';
import { CartContent } from '@/components/CartContent';
import { CheckoutTunnel, CheckoutContent } from '@/components/CheckoutTunnel';
import { GlobalLoader } from '@/components/GlobalLoader';
import { VisitorTracker } from '@/components/VisitorTracker';
import { Suspense } from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen } = useCartStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white w-full">
      <Suspense fallback={null}>
        <VisitorTracker />
      </Suspense>

      <AnimatePresence mode="wait">
        {isLoading && <GlobalLoader key="loader" />}
      </AnimatePresence>

      {/* Zone de contenu principale — scroll indépendant */}
      <div
        id="main-content"
        className="flex-1 min-w-0 h-full overflow-y-auto relative scroll-smooth"
      >
        {children}
        <MobileCartDrawer />
        <CheckoutTunnel />
      </div>

      {/* Panier Desktop / Checkout Desktop — Split View fixe sur la droite */}
      <AnimatePresence mode="wait">
        {(isCartOpen || isCheckoutOpen) && (
          <motion.div
            key="desktop-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block h-full flex-shrink-0 border-l border-white/10 bg-black/30 backdrop-blur-2xl z-50 overflow-hidden"
          >
            <div className="w-[450px] h-full relative">
              <AnimatePresence mode="wait">
                {isCartOpen && (
                  <motion.div 
                    key="cart-view"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <CartContent onClose={() => setIsCartOpen(false)} />
                  </motion.div>
                )}
                {isCheckoutOpen && !isCartOpen && (
                  <motion.div 
                    key="checkout-view"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <CheckoutContent onClose={() => setIsCheckoutOpen(false)} idForm="checkout-form-desktop" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

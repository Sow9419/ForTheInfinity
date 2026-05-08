'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/store/useCartStore';
import { MobileCartDrawer } from '@/components/MobileCartDrawer';
import { CartContent } from '@/components/CartContent';
import { CheckoutTunnel } from '@/components/CheckoutTunnel';
import { GlobalLoader } from '@/components/GlobalLoader';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, setIsCartOpen } = useCartStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white w-full">
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

      {/* Panier Desktop — Split View fixe sur la droite */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="desktop-cart"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden md:block h-full flex-shrink-0 border-l border-gray-100 bg-white z-50 overflow-hidden"
          >
            <div className="w-[450px] h-full relative">
              <CartContent onClose={() => setIsCartOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

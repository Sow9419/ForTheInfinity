'use client';

import React from 'react';
import { ShoppingBag, Wallet } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartContent } from './CartContent';
import { usePathname } from 'next/navigation';

export function MobileCartDrawer() {
  const { cartCount, totalPrice, isCartOpen, setIsCartOpen } = useCartStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/product/');

  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const handleScroll = () => {
      const pos = mainContent ? mainContent.scrollTop : window.scrollY;
      setIsScrolled(pos > 100);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    handleScroll();
    handleResize();

    return () => {
      if (mainContent) mainContent.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const showMobileBar = (cartCount > 0 || isScrolled) && isMobile && !isProductPage;

  return (
    <>
      {/* 1. La Gâchette (Trigger) : Barre noire flottante en bas sur Mobile */}
      <AnimatePresence>
        {showMobileBar && (
          <motion.div
            key="mobile-trigger-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full"
          >
            <div
              onClick={() => setIsCartOpen(true)}
              className="bg-[#121622]/95 backdrop-blur-2xl border-t border-white/10 p-4 rounded-none flex items-center justify-between gap-4 cursor-pointer shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="relative bg-white/10 p-3 rounded-2xl border border-white/5">
                  <ShoppingBag className="text-[#F2F1E8] w-6 h-6" strokeWidth={2} />
                  {cartCount > 0 && (
                    <motion.div
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-[#00C38A] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-[#121622]"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-300 tracking-wider mb-0.5 opacity-60">Panier</span>
                  <p className="text-white font-black text-lg tracking-tight leading-none">
                    {totalPrice.toLocaleString('en-US')}{' '}
                    <span className="text-xs text-gray-400 font-bold uppercase">FCFA</span>
                  </p>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartOpen(true);
                }}
                className="h-12 bg-white text-black px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                Commander <Wallet size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Le Contenant (Container) : Tiroir Plein Écran sur Mobile (Framer Motion pour cohérence Desktop) */}
      <AnimatePresence>
        {isCartOpen && isMobile && (
          <motion.div
            key="mobile-cart-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-[100] bg-black/30 backdrop-blur-2xl flex flex-col overflow-hidden"
          >
            <CartContent onClose={() => setIsCartOpen(false)} showCloseOnMobile />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
'use client';

import React from 'react';
import { ShoppingBag, Wallet, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

import Image from 'next/image';

export function MobileCartDrawer() {
  const { cartCount, totalPrice, isCartOpen, setIsCartOpen, items, removeFromCart, addToCart } = useCartStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMobileCart = cartCount > 0 || isScrolled;

  return (
    <>
      {/* Mobile Fixed Bottom Cart Bar */}
      <AnimatePresence>
        {showMobileCart && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-40 transition-all w-[calc(100%-3rem)] md:hidden"
          >
            <div 
              onClick={() => setIsCartOpen(true)}
              className="bg-[#121622]/90 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 p-4 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="relative bg-white/10 p-3 rounded-2xl border border-white/5">
                  <ShoppingBag className="text-[#F2F1E8] w-6 h-6" strokeWidth={2} />
                  <motion.div 
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-[#121622]"
                  >
                    {cartCount}
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5">Panier</span>
                  <p className="text-white font-black text-lg tracking-tight leading-none">{totalPrice.toLocaleString('en-US')} <span className="text-xs text-gray-400 font-bold uppercase">FCFA</span></p>
                </div>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartOpen(true);
                }}
                className="h-12 bg-[#F2F1E8] text-black px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                ENCAISSER <Wallet size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Sheet / Drawer that opens */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side={isDesktop ? "right" : "bottom"} className={`bg-white border-none p-0 flex flex-col ${!isDesktop ? 'h-[90vh] rounded-t-3xl' : 'w-full sm:max-w-md h-full'}`}>
          <SheetHeader className="p-6 border-b border-gray-100 flex-shrink-0">
            <SheetTitle className="text-black font-sans uppercase font-black tracking-tight text-left">Mon Panier ({cartCount})</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 pb-32">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <ShoppingBag size={48} className="opacity-20" />
                <p className="font-bold uppercase tracking-wider text-sm">Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div layout key={item.id} className="flex gap-4 items-center bg-[#F4F3ED]/50 p-3 rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 p-2 relative border border-gray-100">
                       <Image fill sizes="80px" src={item.image || ''} alt={item.name} className="object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-black uppercase tracking-tight font-sans text-sm">{item.name}</h4>
                      <p className="text-emerald-600 font-bold mt-1 text-sm">{item.price.toLocaleString('en-US')} FCFA</p>
                      
                      <div className="flex items-center gap-3 mt-3 bg-white w-min rounded-lg border border-gray-100 p-1">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-black min-w-[12px] text-center w-4">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
               <div className="flex justify-between items-center mb-4">
                <span className="font-black text-gray-500 uppercase tracking-widest text-sm">Total</span>
                <span className="font-black text-2xl text-black tracking-tighter">{totalPrice.toLocaleString('en-US')} <span className="text-sm text-gray-400">FCFA</span></span>
              </div>
              <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:scale-[1.02] transition-transform">
                Valider la commande
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

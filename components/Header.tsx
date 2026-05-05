'use client';

import React, { useEffect, useState } from 'react';
import { Send, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { totalPrice, cartCount, setIsCartOpen } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={cn(
        'fixed z-50 transition-all duration-500 ease-in-out flex items-center justify-between left-1/2 -translate-x-1/2',
        scrolled 
          ? 'top-4 w-[95%] md:w-max md:gap-12 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
          : 'top-0 w-full px-4 sm:px-6 md:px-8 py-6 bg-transparent'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20">
        <h1 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase cursor-pointer">
          Jokin<span className="font-light opacity-80">Mode</span>
        </h1>
      </div>

      {/* Navigation Mobile & Desktop */}
      <nav className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-white/10">
          <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all text-white">
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </a>
          <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
            <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </a>
        </div>
        
        {/* Panier Desktop */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-transform"
        >
           <div className="relative">
             <ShoppingBag size={18} className="text-black" strokeWidth={2.5} />
             {cartCount > 0 && (
               <Badge className="absolute -top-3 -right-3 px-1.5 py-0 min-w-5 h-5 flex items-center justify-center text-[10px] bg-emerald-500 text-white border-0 hover:bg-emerald-600">
                 {cartCount}
               </Badge>
             )}
           </div>
           <span className="font-black text-sm text-black uppercase tracking-tight">{totalPrice.toLocaleString('en-US')} FCFA</span>
        </button>
      </nav>
    </motion.header>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Send, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';
import { cn, getWhatsAppUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { totalPrice, cartCount, setIsCartOpen } = useCartStore();

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const handleScroll = () => {
      const scrollPos = mainContent ? mainContent.scrollTop : window.scrollY;
      setScrolled(scrollPos > 50);
    };

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      handleScroll();
    } else {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (mainContent) mainContent.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
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
          4THE<span className="font-light opacity-80">INFINITY</span>
        </h1>
      </div>

      {/* Navigation Mobile & Desktop */}
      <nav className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-white/10">
          <a href="https://www.tiktok.com/@4the_infinity?_r=1&_t=ZS-96JM6Yn3uvk" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all text-white">
            <svg className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
            </svg>
          </a>
          <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
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

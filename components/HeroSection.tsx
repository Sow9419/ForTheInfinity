'use client';

import React from 'react';
import { ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react';
import { useShopStore } from '../store/useShopStore';
import { PRODUCTS } from '../lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/useCartStore';

import Image from 'next/image';

export function HeroSection() {
  const { activeHeroProduct, setActiveHeroProduct } = useShopStore();
  const { addToCart } = useCartStore();

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHeroProduct.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${activeHeroProduct.image}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 mix-blend-multiply"></div>
      </div>

      <div className="pt-20"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 text-center max-w-4xl mx-auto">
        <div className="overflow-hidden mb-6">
          <motion.h2 
            key={`title-${activeHeroProduct.id}`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="text-7xl md:text-8xl lg:text-[100px] font-black text-white tracking-tighter leading-[0.85] flex items-center uppercase"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            {activeHeroProduct.name.split(' ')[0]}
            {activeHeroProduct.name.split(' ')[1] && (
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white', WebkitTextFillColor: 'transparent' }}>
                {activeHeroProduct.name.split(' ').slice(1).join(' ')}
              </span>
            )}
          </motion.h2>
        </div>
        
        <motion.p 
          key={`desc-${activeHeroProduct.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-200 text-sm sm:text-base md:text-lg mb-8 max-w-lg leading-relaxed font-light backdrop-blur-sm"
        >
          {activeHeroProduct.description}
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-row items-center gap-3 w-full max-w-md mx-auto justify-center"
        >
          <button 
            onClick={() => addToCart(activeHeroProduct)}
            className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#F2F1E8]/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg group relative overflow-hidden"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:scale-110 transition-transform relative z-10" />
          </button>
          <button className="flex-1 h-12 sm:h-14 lg:h-16 bg-white rounded-full flex items-center justify-center gap-2 sm:gap-3 px-2 sm:px-0 hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg group">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366] group-hover:scale-110 transition-transform" />
            <span className="text-black font-semibold text-sm sm:text-base">Discuter sur WhatsApp</span>
          </button>
        </motion.div>
      </div>

      {/* --- CIRCULAR STORIES UI --- */}
      <div className="relative z-10 w-full pb-0 pt-4">
        <div className="flex items-center justify-start md:justify-center gap-4 px-6 py-0 h-[160px] overflow-x-auto hide-scrollbar snap-x scroll-smooth">
          {PRODUCTS.map((product) => {
            const isActive = activeHeroProduct.id === product.id;
            return (
              <motion.div 
                key={product.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveHeroProduct(product)}
                className="snap-center shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div 
                  className={`relative rounded-full transition-all duration-500 flex items-center justify-center
                    ${isActive 
                      ? 'w-24 h-24 md:w-28 md:h-28 ring-offset-4 ring-offset-black/20 ring-2 ring-[#F2F1E8] p-1' 
                      : 'w-16 h-16 md:w-20 md:h-20 ring-offset-2 ring-offset-transparent ring-1 ring-white/30'
                    }
                  `}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border border-white/10 relative">
                    <Image fill sizes="(max-width: 768px) 100px, 150px" src={product.image} alt={product.name} className={`object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} referrerPolicy="no-referrer" />
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeStory"
                      className="absolute -bottom-1 bg-[#F2F1E8] text-black text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-tighter shadow-xl"
                    >
                      En Vue
                    </motion.div>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${isActive ? 'text-white opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'}`}>
                  {product.name.split(' ')[0]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

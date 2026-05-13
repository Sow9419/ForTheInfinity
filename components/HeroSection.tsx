'use client';

import React from 'react';
import { ArrowRight, Eye, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { useShopStore } from '../store/useShopStore';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/useCartStore';
import { getWhatsAppUrl } from '@/lib/utils';
import { useProducts } from '@/hooks/use-products';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import InfinityLoader from './InfinityLoader';

export function HeroSection() {
  const { activeHeroProduct, setActiveHeroProduct } = useShopStore();
  const { addToCart } = useCartStore();
  const router = useRouter();
  const { products, loading } = useProducts();

  React.useEffect(() => {
    if (!loading && products.length > 0 && !activeHeroProduct) {
      setActiveHeroProduct(products[0]);
    }
  }, [products, loading, activeHeroProduct, setActiveHeroProduct]);

  if (loading || !activeHeroProduct) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <InfinityLoader size={250} />
      </div>
    );
  }

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
            className="absolute inset-0 bg-scale-down bg-center bg-[#f7f7dd]"
            style={{ backgroundImage: `url('${activeHeroProduct.image}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 mix-blend-multiply"></div>
      </div>

      <div className="pt-20"></div>

      <div className="relative z-10 flex flex-col justify-end px-6 max-w-7xl mx-auto w-full pb-8 mt-auto">
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full max-w-2xl gap-5 mx-auto md:mx-0">

          <div className="overflow-hidden">
            <motion.h2
              key={`title-${activeHeroProduct.id}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              className="text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-light italic text-white tracking-tight leading-[0.9] flex flex-wrap justify-center md:justify-start items-baseline gap-x-3 uppercase"
              style={{ fontFamily: "var(--font-cormorant)" }}
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
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-light backdrop-blur-sm"
          >
            {activeHeroProduct.shortDescription}
          </motion.p>

          <motion.div
            key={`meta-${activeHeroProduct.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center md:justify-start gap-4 w-full md:w-auto"
          >
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.round(activeHeroProduct.rating || 5) ? 'fill-[#FBBF24] text-[#FBBF24]' : 'fill-white/20 text-white/20'}`}
                    />
                  ))}
                </div>
                <span className="text-white font-bold text-xs">{activeHeroProduct.rating?.toFixed(1) || "5.0"}</span>
              </div>
              <span className="text-white/50 text-[9px] uppercase tracking-widest font-black">
                {(activeHeroProduct.reviewsCount || 0).toLocaleString()} avis vérifiés
              </span>
            </div>

            <div className="h-6 w-[1px] bg-white/20" />

            <div className="flex items-baseline gap-1">
              <span className="text-white text-xl md:text-2xl font-bold tracking-tighter">
                {activeHeroProduct.price.toLocaleString('fr-FR')}
              </span>
              <span className="text-xs font-light text-white/60">FCFA</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-row items-center gap-2.5 w-full justify-center md:justify-start mt-2"
          >
            <button
              onClick={() => addToCart(activeHeroProduct)}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#F2F1E8]/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg group relative overflow-hidden"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:scale-110 transition-transform relative z-10" />
            </button>
            <a
              href={getWhatsAppUrl(activeHeroProduct?.name, activeHeroProduct?.price)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 md:h-12 bg-white rounded-full flex items-center justify-center gap-2 px-4 md:px-5 hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg group"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="text-black font-semibold text-xs md:text-sm whitespace-nowrap">Discuter sur WhatsApp</span>
            </a>
            <button
              onClick={() => router.push(`/product/${activeHeroProduct.id}`)}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#F2F1E8]/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg group relative overflow-hidden"
            >
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:scale-110 transition-transform relative z-10" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* --- CIRCULAR STORIES UI --- */}
      <div className="relative z-10 w-full pb-0 pt-4">
        <div className="flex items-center justify-start md:justify-center gap-4 px-6 py-0 h-[160px] overflow-x-auto hide-scrollbar snap-x scroll-smooth">
          {products.map((product) => {
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

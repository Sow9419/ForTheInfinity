'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHeroSections } from '@/hooks/use-hero-sections';
import { BrandLoader } from './BrandLoader';
import { LiquidTicker } from './LiquidTicker';

import Image from 'next/image';

const HERO_ROTATION_MS = 6000;

export function HeroSection() {
  const { heroSlides, loading } = useHeroSections();
  const [activeIndex, setActiveIndex] = React.useState(0);

  // L'image change automatiquement toutes les 6 secondes
  React.useEffect(() => {
    if (loading || heroSlides.length <= 1) return;
    const id = setInterval(
      () => setActiveIndex((i) => (i + 1) % heroSlides.length),
      HERO_ROTATION_MS
    );
    return () => clearInterval(id);
  }, [loading, heroSlides.length, activeIndex]);

  if (loading) {
    return (
      <div className="w-full min-h-[100dvh]">
        <BrandLoader className="min-h-[100dvh]" />
      </div>
    );
  }

  if (heroSlides.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white/30 text-sm uppercase tracking-widest text-center px-6">
          Aucune slide Hero — ajoutez-en depuis le back-office
        </p>
      </div>
    );
  }

  const activeHero = heroSlides[Math.min(activeIndex, heroSlides.length - 1)];
  const titleWords = (activeHero.title || '').split(' ');
  const titleRest = titleWords.slice(1).join(' ');

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHero.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center bg-[#0a0a0a]"
            style={{ backgroundImage: `url('${activeHero.image}')`, backgroundPosition: activeHero.position || '50% 50%' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 mix-blend-multiply"></div>
      </div>

      <div className="pt-20"></div>

      <div className="relative z-10 flex flex-col justify-end px-6 max-w-7xl mx-auto w-full pb-8 mt-auto">
        {activeHero && (
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full max-w-2xl gap-5 mx-auto md:mx-0">

            <div className="overflow-hidden">
              <motion.h2
                key={`title-${activeHero.id}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                className="text-[40px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-light italic text-white tracking-tight leading-[0.9] flex flex-wrap justify-center md:justify-start items-baseline gap-x-3 uppercase"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {titleWords[0]}
                {titleRest && (
                  <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white', WebkitTextFillColor: 'transparent' }}>
                    {titleRest}
                  </span>
                )}
              </motion.h2>
            </div>

            {activeHero.description && (
              <motion.p
                key={`desc-${activeHero.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-light backdrop-blur-sm whitespace-pre-line"
              >
                {activeHero.description}
              </motion.p>
            )}
          </div>
        )}
      </div>

      {/* --- CIRCULAR STORIES UI --- */}
      <div className="relative z-10 w-full pb-0 pt-4">
        <div className="flex items-center justify-start md:justify-center gap-4 px-6 py-0 h-[160px] overflow-x-auto hide-scrollbar snap-x scroll-smooth">
          {heroSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.div
                key={slide.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveIndex(index)}
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
                    {slide.image ? (
                      <Image fill sizes="(max-width: 768px) 100px, 150px" src={slide.image} alt={slide.title} className={`object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-white/10" />
                    )}
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
                  {(slide.title || '').split(' ')[0]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- TICKER LIQUID GLASS (bas du hero) --- */}
      <div className="relative z-10 w-full">
        <LiquidTicker />
      </div>
    </section>
  );
}

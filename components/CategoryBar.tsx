'use client';

import React from 'react';
import { useShopStore } from '../store/useShopStore';
import { motion } from 'motion/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

import { useCategories } from '@/hooks/use-categories';

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useShopStore();
  const { categories } = useCategories();

  return (
    <div className="w-full pb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2 md:gap-3 px-4 sm:px-6 hide-scrollbar">
          {/* Bouton pour tout afficher */}
          <button
            onClick={() => setActiveCategory('')}
            className={`whitespace-nowrap px-4 py-2.5 md:px-6 md:py-4 text-[11px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              activeCategory === ''
                ? 'bg-black text-white shadow-xl'
                : 'bg-white/40 backdrop-blur-xl border border-white/60 text-gray-700 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
            }`}
          >
            Tous
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2.5 md:px-6 md:py-4 text-[11px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-black text-white shadow-xl'
                  : 'bg-white/40 backdrop-blur-xl border border-white/60 text-gray-700 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:bg-white/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

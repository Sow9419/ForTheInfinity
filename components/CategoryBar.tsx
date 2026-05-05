'use client';

import React from 'react';
import { useShopStore } from '../store/useShopStore';
import { CATEGORIES } from '../lib/data';
import { motion } from 'motion/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useShopStore();

  return (
    <div className="w-full pb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-3 overflow-x-auto px-4 sm:px-6 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-black text-white shadow-xl'
                  : 'bg-[#ECEEE5] text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

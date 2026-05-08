'use client';

import React from 'react';
import { useShopStore } from '../store/useShopStore';
import { CATEGORIES } from '../lib/data';
import { motion } from 'motion/react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function CategoryBar() {
  const { activeCategory, setActiveCategory } = useShopStore();
  const [categories, setCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="w-full pb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-3 overflow-x-auto px-4 sm:px-6 hide-scrollbar">
          {/* Bouton pour tout afficher */}
          <button
            onClick={() => setActiveCategory('')}
            className={`whitespace-nowrap px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              activeCategory === ''
                ? 'bg-black text-white shadow-xl'
                : 'bg-[#ECEEE5] text-gray-500 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-black text-white shadow-xl'
                  : 'bg-[#ECEEE5] text-gray-500 hover:bg-gray-200'
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

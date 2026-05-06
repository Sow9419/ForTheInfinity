'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { PRODUCTS } from '../lib/data';
import { useShopStore } from '../store/useShopStore';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export function ProductGrid() {
  const { setActiveHeroProduct, activeCategory } = useShopStore();
  const { addToCart } = useCartStore();

  // Simulated filtering for effect
  const filteredProducts = PRODUCTS; // In a real app we'd filter by activeCategory

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="columns-2 md:columns-3 xl:columns-4 gap-2 sm:gap-2 pb-0 px-2"
    >
      {filteredProducts.map((product) => (
        <Link 
          href={`/product/${product.id}`}
          key={product.id}
          className="block"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-[#ECEEE5] rounded-none overflow-hidden flex flex-col transition-all cursor-pointer break-inside-avoid mb-4 sm:mb-6 group"
          >
          <div className="p-3 md:p-4 lg:p-5 flex flex-col gap-3 md:gap-4">
            <div className="text-center px-2">
              <p className="font-roboto font-medium text-lg md:text-xl lg:text-2xl text-black mb-1 leading-tight tracking-tight">
                {product.name}
              </p>
              <p className="font-roboto font-light text-xs md:text-sm text-gray-500 uppercase tracking-widest">
                {product.subtitle}
              </p>
            </div>
            
            <div className={cn(
              "bg-white/50 rounded-none overflow-hidden relative",
              product.tall ? "aspect-[3/4]" : "aspect-square"
            )}>
              <Image
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-between mt-1 pt-2 border-t border-black/5">
              <p className="font-roboto font-bold text-base md:text-lg lg:text-xl text-black">
                {product.price.toLocaleString('en-US').replace(/,/g, '.')} FCFA
              </p>
              <button 
                onClick={(e) => handleAddToCart(e, product)}
                className="bg-black hover:bg-gray-800 transition-colors rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 active:scale-95 shadow-lg text-white"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

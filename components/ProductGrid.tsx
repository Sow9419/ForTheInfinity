'use client';

import React from 'react';
import { Plus } from 'lucide-react';
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

import { useProducts } from '@/hooks/use-products';

export function ProductGrid() {
  const { activeCategory } = useShopStore();
  const { addToCart } = useCartStore();
  const { products, loading } = useProducts();

  const filteredProducts = products.filter(p =>
    !activeCategory ? true : p.category === activeCategory
  );

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="columns-2 md:columns-3 xl:columns-4 gap-2 sm:gap-2 pb-0 px-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 aspect-[3/4] mb-6 rounded-none animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={activeCategory}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="columns-2 md:columns-4 gap-2 sm:gap-2 pb-0 px-2"
    >
      {filteredProducts.map((product) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="glass-card bg-[#ECEEE5]/20  rounded-none overflow-hidden flex flex-col transition-all break-inside-avoid mb-4 sm:mb-6 group relative"
        >
          <div className="p-2 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-3">
            {/* Zone cliquable vers la page détail */}
            <Link href={`/product/${product.id}`} className="flex flex-col gap-2 md:gap-3 cursor-pointer">
              <div className="text-center px-2">
                <p className="font-roboto font-medium text-base md:text-lg lg:text-xl text-gray-200 mb-1 leading-tight tracking-tight">
                  {product.name}
                </p>
                <p className="font-roboto font-light text-xs md:text-sm text-gray-300 uppercase tracking-widest">
                  {product.subtitle}
                </p>
              </div>

              <div className={cn(
                "rounded-none overflow-hidden relative",
                product.tall ? "aspect-[4/5]" : "aspect-square"
              )}>
                {product.image && (
                  <Image
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </Link>

            {/* Zone Bas : Prix et Bouton (Bouton hors du Link) */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-black/5">
              <p className="font-roboto font-bold text-base md:text-lg lg:text-xl text-gray-200">
                {product.price.toLocaleString('en-US').replace(/,/g, '.')} FCFA
              </p>
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                className="glass-card bg-black/30  hover:bg-gray-800 transition-colors rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 active:scale-95 shadow-lg text-white z-10"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

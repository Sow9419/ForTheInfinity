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
import { getEffectivePrice } from '@/store/useCartStore';

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pb-10 px-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100/10 aspect-[3/4] rounded-2xl animate-pulse" />
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
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pb-10 px-4"
    >
      {filteredProducts.map((product) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="glass-card bg-[#ECEEE5]/10 rounded-xl overflow-hidden flex flex-col transition-all group relative border border-white/5"
        >
          <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 h-full">
            {/* Zone cliquable vers la page détail */}
            <Link href={`/product/${product.id}`} className="flex flex-col gap-2 md:gap-3 cursor-pointer flex-1 relative">
              {/* Badge ÉPUISÉ */}
              {product.inStock === false && (
                <span className="absolute top-2 left-2 z-20 px-2 py-1 bg-black/85 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg">
                  Épuisé
                </span>
              )}
              {/* Badge PROMO */}
              {product.inStock !== false && product.promoPrice != null && product.promoPrice < product.price && (
                <span className="absolute top-2 left-2 z-20 px-2 py-1 bg-indigo-50 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-md shadow-none">
                  Promo
                </span>
              )}
              {/* Statut liquid glass — haut droite (Limité prioritaire, jamais les deux) */}
              {(product.isLimited || product.isNew) && (
                <span className="absolute top-2 right-2 z-20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full text-blue-600 border border-white/25 bg-black/[0.12] backdrop-blur-md shadow-none">
                  {product.isLimited ? 'Limité' : 'Nouveau'}
                </span>
              )}
              

              <div className="rounded-xl overflow-hidden relative aspect-square">
                {product.image && (
                  <Image
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${product.inStock === false ? 'grayscale opacity-60' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="text-center px-1">
                <h3 className="font-roboto font-bold text-sm md:text-base lg:text-lg text-white mb-0.5 leading-tight tracking-tight line-clamp-1">
                  {product.name}
                </h3>
                <p className="font-roboto font-light text-[10px] md:text-xs text-gray-200 uppercase tracking-widest line-clamp-1">
                  {product.subtitle}
                </p>
              </div>
            </Link>

            {/* Zone Bas : Prix et Bouton */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
              {product.inStock !== false && product.promoPrice != null && product.promoPrice < product.price ? (
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] md:text-[10px] text-white/40 line-through">
                    {product.price.toLocaleString('fr-FR')}
                  </span>
                  <p className="font-roboto font-black text-xs md:text-base lg:text-lg text-[#00D632]">
                    {getEffectivePrice(product).toLocaleString('fr-FR')} <span className="text-[8px] md:text-[10px] font-normal text-white/50">FCFA</span>
                  </p>
                </div>
              ) : (
                <p className={`font-roboto font-black text-xs md:text-base lg:text-lg ${product.inStock === false ? 'text-white/40' : 'text-white'}`}>
                  {product.price.toLocaleString('fr-FR')} <span className="text-[8px] md:text-[10px] font-normal text-white/50">FCFA</span>
                </p>
              )}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={product.inStock === false}
                title={product.inStock === false ? 'Rupture de stock' : 'Ajouter au panier'}
                className={`bg-white text-black hover:bg-[#00D632] hover:text-white transition-all rounded-xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0 shadow-lg z-10 ${product.inStock === false ? 'opacity-40 cursor-not-allowed hover:bg-white hover:text-black' : 'active:scale-90'}`}
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

import React, { useEffect } from 'react';
import { Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface ProductDetailsProps {
  collection: string;
  title: string;
  price: number;
  currency: string;
  rating?: number;
  reviewsCount?: number;
  product: any; // On passe le produit entier pour pouvoir l'ajouter au panier
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

export function ProductDetails({
  collection,
  title,
  price,
  currency,
  rating,
  reviewsCount,
  product,
  selectedSizes,
  onSizesChange
}: ProductDetailsProps) {
  const { items, addToCart, removeFromCart, updateCartItemSizes } = useCartStore();
  const [showError, setShowError] = React.useState(false);
  
  // On cherche le produit dans le panier pour avoir sa quantité réelle
  const cartItem = items.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // On affiche la quantité réelle (0 si pas dans le panier)
  const displayQuantity = quantityInCart;

  // Synchronisation des tailles avec le panier en temps réel
  useEffect(() => {
    if (cartItem && selectedSizes.length === 0 && cartItem.selectedSizes && cartItem.selectedSizes.length > 0) {
      onSizesChange(cartItem.selectedSizes);
    }
  }, [cartItem?.id]); 

  useEffect(() => {
    if (cartItem) {
      updateCartItemSizes(product.id, selectedSizes);
    }
  }, [selectedSizes, cartItem?.id, updateCartItemSizes]);

  const toggleSize = (size: string) => {
    setShowError(false);
    const newSizes = selectedSizes.includes(size) 
      ? selectedSizes.filter(s => s !== size) 
      : [...selectedSizes, size];
    onSizesChange(newSizes);
  };

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      removeFromCart(product.id);
    }
  };

  const handleIncrement = () => {
    addToCart(product, 1, selectedSizes);
  };

  return (
    <>
      {/* Product Meta */}
      <div className="flex flex-col gap-2 md:gap-[8px]">
        <span className="text-[#8e939c] text-[10px] font-bold tracking-widest uppercase">
          {collection}
        </span>
        <h1 className="text-3xl md:text-[44px] font-extrabold leading-[1.05] md:leading-[0.95] tracking-tight md:tracking-[-1.5px] text-gray-900 md:text-[#111] m-0 whitespace-pre-line">
          {title}
        </h1>
        
        {/* Rating Summary */}
        <div className="flex items-center gap-1.5 md:gap-[10px] mt-1 md:mt-[5px]">
          <div className="flex gap-[2px]">
            {product.rating?.toFixed(1) ? (
              [...Array(Math.round(product.rating))].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-4 md:h-4 fill-[#FBBF24] text-[#FBBF24]" />
              ))
            ) : (
              [...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-4 md:h-4 fill-gray-300 text-gray-300" />
              ))
            )}
          </div>
          <span className="text-[13px] md:text-[14px] font-medium text-gray-600">
            {product.rating?.toFixed(1) || "5.0"} <span className="text-purple-600 font-bold">({(product.reviewsCount || 0).toLocaleString('fr-FR')} avis vérifiés)</span>
          </span>
        </div>
      </div>

      {/* Product Variants (Taille) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Choisir Taille</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`
                min-w-[50px] h-[50px] rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center
                ${selectedSizes.includes(size) 
                  ? 'bg-black border-black text-white shadow-lg scale-105' 
                  : 'bg-transparent border-gray-400 text-gray-400 hover:border-black hover:text-black'}
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Tag & Quantity */}
      <div className="flex items-center justify-between mt-2 md:my-[10px]">
        <div className="text-[28px] md:text-[32px] font-bold text-gray-900 md:text-[#111] tracking-tight">
          {product.price.toLocaleString('en-US').replace(/,/g, '.')} FCFA
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDecrement}
            disabled={quantityInCart === 0}
            className="w-10 h-10 rounded-full bg-white border-gray-400 text-gray-400 hover:border-black hover:text-black flex items-center justify-center text-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-2xl font-medium w-6 text-center">{displayQuantity}</span>
          <button
            onClick={handleIncrement}
            className="w-10 h-10 rounded-full bg-white border-gray-400 text-gray-400 hover:border-black hover:text-black flex items-center justify-center text-xl hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

import React from 'react';
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
}

export function ProductDetails({
  collection,
  title,
  price,
  currency,
  rating = 5.0,
  reviewsCount = 124,
  product
}: ProductDetailsProps) {
  const { items, addToCart, removeFromCart } = useCartStore();
  
  // On cherche le produit dans le panier pour avoir sa quantité réelle
  const cartItem = items.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // On affiche 1 par défaut si le produit n'est pas encore dans le panier,
  // mais les actions agiront directement sur le store.
  const displayQuantity = Math.max(1, quantityInCart);

  const handleDecrement = () => {
    if (quantityInCart > 0) {
      removeFromCart(product.id);
    }
  };

  const handleIncrement = () => {
    addToCart(product, 1);
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
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 md:w-4 md:h-4 fill-[#FBBF24] text-[#FBBF24]" />
            ))}
          </div>
          <span className="text-[13px] md:text-[14px] font-medium md:font-normal text-gray-600 md:text-[#666]">
            {rating?.toFixed(1)} <span className="text-[#3B82F6] md:text-[#666] font-normal md:font-bold">({reviewsCount?.toLocaleString('en-US')} reviews)</span>
          </span>
        </div>
      </div>

      {/* Price Tag & Quantity */}
      <div className="flex items-center justify-between mt-2 md:my-[10px]">
        <div className="text-[28px] md:text-[32px] font-bold text-gray-900 md:text-[#111] tracking-tight">
          {(price * displayQuantity).toLocaleString('fr-FR')} {currency || ""}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDecrement}
            disabled={quantityInCart === 0}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-2xl font-medium w-6 text-center">{displayQuantity}</span>
          <button
            onClick={handleIncrement}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

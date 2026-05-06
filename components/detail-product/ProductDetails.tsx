import React from 'react';
import { Star } from 'lucide-react';

interface ProductDetailsProps {
  collection: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  setQuantity: (q: number) => void;
}

export function ProductDetails({
  collection,
  title,
  price,
  currency,
  quantity,
  setQuantity
}: ProductDetailsProps) {
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
      </div>

      {/* Price Tag & Quantity */}
      <div className="flex items-center justify-between mt-2 md:my-[10px]">
        <div className="text-[28px] md:text-[32px] font-bold text-gray-900 md:text-[#111] tracking-tight">
          {price?.toLocaleString('fr-FR') || "0"} {currency || ""}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors"
          >
            -
          </button>
          <span className="text-2xl font-medium w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

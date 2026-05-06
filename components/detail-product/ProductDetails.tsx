import React from 'react';
import { Star } from 'lucide-react';

interface ProductDetailsProps {
  collection: string;
  title: string;
  rating: number;
  reviewsCount: number;
  price: number;
  currency: string;
  quantity: number;
  setQuantity: (q: number) => void;
}

export function ProductDetails({
  collection,
  title,
  rating,
  reviewsCount,
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

        <div className="flex items-center gap-1.5 md:gap-[10px] mt-1 md:mt-[5px]">
          <div className="flex gap-[2px]">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 md:w-4 md:h-4 fill-[#FBBF24] text-[#FBBF24]" />)}
          </div>
          <span className="text-[13px] md:text-[14px] font-medium md:font-normal text-gray-600 md:text-[#666]">
            {rating?.toFixed(1) || "5.0"} <span className="text-[#3B82F6] md:text-[#666] font-normal md:font-bold">({reviewsCount?.toLocaleString('en-US') || "0"} reviews)</span>
          </span>
        </div>
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

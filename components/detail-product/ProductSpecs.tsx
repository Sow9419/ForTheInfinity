import React from 'react';
import { CheckCircle2, Truck } from 'lucide-react';

interface ProductSpecsProps {
  specs?: { text: string }[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  return (
    <div className="flex flex-col gap-2.5 md:gap-[12px]">
      <div className="flex items-center gap-3 md:gap-[10px] text-[13px] text-gray-700 md:text-[#444] font-medium">
        <div className="md:w-[18px] md:h-[18px] md:bg-[#F0F0F0] rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 md:w-3 md:h-3 text-gray-400 md:text-[#111] stroke-[1.5] md:stroke-2" />
        </div>
        <span>{specs?.[0]?.text || "Garantie satisfaction"}</span>
      </div>
      <div className="flex items-center gap-3 md:gap-[10px] text-[13px] text-gray-700 md:text-[#444] font-medium">
        <div className="md:w-[18px] md:h-[18px] md:bg-[#F0F0F0] rounded-full flex items-center justify-center">
          <Truck className="w-5 h-5 md:w-3 md:h-3 text-gray-400 md:text-[#111] stroke-[1.5] md:stroke-2" />
        </div>
        <span>{specs?.[1]?.text || "Livraison gratuite"}</span>
      </div>
    </div>
  );
}

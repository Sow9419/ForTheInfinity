import React from 'react';
import { ShieldCheck, Truck, Sparkles, RefreshCw, Ruler, Droplets } from 'lucide-react';

interface ProductSpecsProps {
  specs?: { label: string; value: string }[];
}

const SPEC_ICONS: Record<string, any> = {
  "Matière": Sparkles,
  "Coupe": Ruler,
  "Poids": ShieldCheck,
  "Entretien": Droplets,
  "Livraison": Truck,
  "Garantie": ShieldCheck,
  "default": CheckCircle2
};

import { CheckCircle2 } from 'lucide-react';

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || specs.length === 0) {
    // Default fallback specs if none provided
    specs = [
      { label: "Qualité", value: "Garantie satisfaction" },
      { label: "Expédition", value: "Livraison 24/48h" }
    ];
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
      {specs.map((spec, idx) => {
        const Icon = SPEC_ICONS[spec.label] || SPEC_ICONS.default;
        return (
          <div 
            key={idx} 
            className="flex flex-col gap-2 p-3 md:p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm hover:bg-white/60 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon className="w-4 h-4 text-black/60" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
                {spec.label}
              </p>
              <p className="text-xs md:text-sm text-black font-semibold">
                {spec.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


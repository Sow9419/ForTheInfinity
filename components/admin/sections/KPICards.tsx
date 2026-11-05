'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Package, Users, Banknote } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface KPIData {
  ordersCount: number;
  productsCount: number;
  revenue: number;
  visitorCount: number;
}

interface KPICardsProps {
  kpis: KPIData;
}

/** Compteur animé — ease-out expo */
function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (diff === 0) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(2, -10 * p);
      const next = start + diff * eased;
      setValue(next);
      ref.current = next;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

const Metric = ({ value, format }: { value: number, format?: (n: number) => string }) => {
  const animated = useCountUp(value);
  const display = format ? format(animated) : Math.round(animated).toLocaleString('fr-FR');
  return <span className="tabular-nums">{display}</span>;
};

export function KPICards({ kpis }: KPICardsProps) {
  const stats = [
    { label: 'Commandes', value: kpis.ordersCount, icon: ShoppingCart, chip: 'bg-blue-50 text-blue-600 ring-blue-100' },
    { label: 'Produits', value: kpis.productsCount, icon: Package, chip: 'bg-violet-50 text-violet-600 ring-violet-100' },
    { label: 'Visiteurs', value: kpis.visitorCount, icon: Users, chip: 'bg-amber-50 text-amber-600 ring-amber-100' },
    { label: 'Revenu (FCFA)', value: kpis.revenue, icon: Banknote, chip: 'bg-emerald-50 text-emerald-600 ring-emerald-100', format: (n: number) => Math.round(n).toLocaleString('fr-FR') },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-[26px] bg-white border border-black/[0.06] p-5 lg:p-6 shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)] hover:shadow-[0_2px_4px_rgba(20,18,12,0.05),0_24px_48px_-24px_rgba(20,18,12,0.28)] transition-shadow duration-500"
          >
            <div className="flex items-start justify-between mb-4 lg:mb-6">
              <div className={cn("w-10 h-10 lg:w-11 lg:h-11 rounded-2xl flex items-center justify-center ring-1", stat.chip)}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-300 group-hover:text-neutral-400 transition-colors">4TI</span>
            </div>
            <p className="text-[9.5px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl lg:text-[30px] leading-none font-black tracking-[-0.02em] text-neutral-900">
              <Metric value={stat.value} format={stat.format} />
            </h3>
          </motion.div>
        );
      })}
    </div>
  );
}

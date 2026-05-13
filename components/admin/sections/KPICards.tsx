'use client';

import React from 'react';
import { ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
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

const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative group overflow-hidden rounded-[32px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-6 hover:bg-white/[0.05] transition-all duration-300",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

export function KPICards({ kpis }: KPICardsProps) {
  const stats = [
    { label: 'Commandes', value: kpis.ordersCount, trend: 12.5, icon: ShoppingCart, color: 'blue' },
    { label: 'Produits', value: kpis.productsCount, trend: 2.1, icon: Package, color: 'purple' },
    { label: 'Visiteurs', value: kpis.visitorCount, trend: 18.3, icon: Users, color: 'orange' },
    { label: 'Revenu', value: `${(kpis.revenue / 1000).toFixed(1)}k`, trend: 8.4, icon: TrendingUp, color: 'green' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <GlassCard key={i} delay={i * 0.1} className="p-4 lg:p-6">
            <div className="flex justify-between items-start mb-3 lg:mb-4">
              <div className={cn(
                "p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-white/[0.03] border border-white/[0.05]",
                { 
                  'text-blue-400': stat.color === 'blue', 
                  'text-purple-400': stat.color === 'purple', 
                  'text-orange-400': stat.color === 'orange', 
                  'text-green-400': stat.color === 'green' 
                }
              )}>
                <Icon size={18} />
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[9px] lg:text-[10px] uppercase tracking-widest font-bold mb-1">{stat.label}</p>
              <h3 className="text-xl lg:text-3xl font-bold text-white tabular-nums">{stat.value}</h3>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

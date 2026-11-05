'use client';

import React from 'react';
import { motion } from 'motion/react';

const DEFAULT_ITEMS = [
  'Éditions limitées',
  'Livraison Bamako',
  'Qualité premium',
  'Loyalty & Minimalist',
  'Nouveautés',
  'À l\'infini',
];

/**
 * Bandeau défilant style « liquid glass » — verre translucide, lueur
 * haute interne et marquee infini. Conçu pour le bas du Hero.
 */
export function LiquidTicker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span className="whitespace-nowrap px-8 md:px-10 text-[10px] md:text-[11px] font-black uppercase tracking-[0.32em] text-white/70">
            {item}
          </span>
          <span className="text-[9px] text-white/35">✦</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="relative z-10 w-full">
      {/* Verre liquide : translucide + flou + reflets internes haut/bas */}
      <div
        className="w-full overflow-hidden border-y border-white/10 bg-white/[0.06] backdrop-blur-xl
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_-1px_0_0_rgba(255,255,255,0.05),0_-4px_24px_-12px_rgba(0,0,0,0.6)]"
      >
        <motion.div
          className="flex w-max py-3.5 md:py-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
        >
          <Row />
          <Row hidden />
        </motion.div>
      </div>
    </div>
  );
}

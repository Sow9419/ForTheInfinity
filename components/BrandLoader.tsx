'use client';

import React from 'react';
import { motion } from 'motion/react';

/**
 * Splash de chargement — fond blanc dégradé + logo officiel
 * (logo: remplacer le fichier public/logo-4ti.png par le dernier logo 4TI)
 */
export function BrandLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-white via-[#F8F7F2] to-[#ECEAE0] ${className}`}>
      <motion.img
        src="/logo-4ti.png"
        alt="4TheInfinity"
        className="h-28 md:h-40 w-auto object-contain"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <h2 className="text-gray-900 font-black text-2xl uppercase tracking-[0.3em] ml-1">
          4TheInfinity
        </h2>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gray-400/80 to-transparent" />
        <p className="text-gray-500/90 text-[10px] uppercase tracking-[0.35em] mt-1 font-light text-center leading-relaxed">
          Built on loyalty. Mode for the infinity
        </p>
      </motion.div>
    </div>
  );
}

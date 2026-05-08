'use client';

import React from 'react';
import { motion } from 'motion/react';
import InfinityLoader from './InfinityLoader';

export function GlobalLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      <div className="relative flex flex-col items-center">
        <InfinityLoader 
          size={350} 
          speed={2.2} 
          tailLength={120} 
          className="drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <h2 className="text-white font-black text-2xl uppercase tracking-[0.3em] ml-1">
            ForTheInfinity
          </h2>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] mt-2 font-light">
            Luxury Minimalist
          </p>
        </motion.div>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
    </motion.div>
  );
}

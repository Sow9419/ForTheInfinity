'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BrandLoader } from './BrandLoader';

export function GlobalLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999]"
    >
      <BrandLoader className="min-h-screen" />
    </motion.div>
  );
}

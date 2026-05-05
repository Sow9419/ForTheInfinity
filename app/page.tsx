'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';
import { MobileCartDrawer } from '@/components/MobileCartDrawer';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      
      {/* --- CATALOGUE --- */}
      <main className="max-w-7xl mx-auto pt-10 relative">
        <CategoryBar />
        <ProductGrid />
      </main>

      <MobileCartDrawer />
    </>
  );
}

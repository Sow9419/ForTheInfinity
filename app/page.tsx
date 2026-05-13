import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';
import { CinematicFooter } from '@/components/motion-footer';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <main className="max-w-7xl mx-auto pt-10 relative z-10 pb-20 overflow-hidden min-h-[60vh]">
        {/* Couche 1 : Background visuel riche (Image floue) - Appliqué uniquement à la section main */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/image.png"
            alt="Background flou"
            className="w-full h-full object-cover opacity-60 scale-110"
          />
          {/* Overlay de couleur pour teinter le fond (ex: bg-black/10, bg-blue-500/5, etc.) */}
          <div className="absolute inset-0 backdrop-blur-xl bg-black/30" />
        </div>

        <div className="relative z-10">
          <CategoryBar />
          <ProductGrid />
        </div>
      </main>
      <CinematicFooter />
    </>
  );
}

import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <main className="max-w-7xl mx-auto pt-10 relative pb-20">
        <CategoryBar />
        <ProductGrid />
      </main>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCartStore } from '@/store/useCartStore';
import { useProduct } from '@/hooks/use-product';

// Components from detail-product
import { ProductGallery } from "@/components/detail-product/ProductGallery";
import { ProductDetails } from "@/components/detail-product/ProductDetails";
import { ProductSpecs } from "@/components/detail-product/ProductSpecs";
import { ProductDescription } from "@/components/detail-product/ProductDescription";
import { FAQSection } from "@/components/detail-product/FAQSection";
import { FooterBar } from "@/components/detail-product/FooterBar";
import { ProductSkeleton } from "@/components/detail-product/ProductSkeleton";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const productId = params?.id as string;
  const { product, loading: isLoading } = useProduct(productId);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { items } = useCartStore();
  const cartItem = items.find(item => item.id === productId);
  const currentQuantity = cartItem ? cartItem.quantity : 1; 

  if (isLoading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-sm text-center max-w-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-3">Produit indisponible</h2>
          <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
            Nous rencontrons un problème technique. Veuillez réessayer dans quelques instants.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#111] text-white py-3.5 rounded-[12px] font-bold text-[14px] hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row font-sans relative md:overflow-hidden bg-transparent overflow-x-hidden">

      {/* Background Visuel Riche (Image floue) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/image1.png"
          alt="Background flou"
          className="w-full h-full object-cover opacity-60 scale-110"
        />
        {/* Overlay blanc translucide pour l'effet light glass */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/40" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row w-full h-full">

        <FloatingWhatsApp
          productName={product.title}
          price={product.effectivePrice ?? product.price}
          quantity={currentQuantity}
          selectedSizes={selectedSizes}
        />

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex absolute top-4 left-4 z-[60] bg-white/40 hover:bg-white/60 backdrop-blur-md p-3 rounded-full border border-white/50 transition-all group shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-black group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Left Column: Media Gallery */}
        <div className="w-full md:w-1/2 h-[70vh] md:h-full relative overflow-hidden bg-none">
          <ProductGallery
            images={product.images}
            title={product.title}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
          />
        </div>

        {/* Right Column: Content */}
        <div className="w-full bg-white/30 backdrop-blur-md md:border-l border-white/40 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] md:w-1/2 flex-1 px-5 py-6 md:p-[40px] flex flex-col gap-6 md:gap-[25px] md:overflow-y-auto pb-[100px] overflow-x-hidden">

          <ProductDetails
            collection={product.collection}
            title={product.title}
            price={product.price}
            currency={product.currency}
            product={product}
            selectedSizes={selectedSizes}
            onSizesChange={setSelectedSizes}
          />

          <ProductSpecs specs={product.specs} />

          <ProductDescription
            shortDescription={product.description?.short}
            extendedDescription={product.description?.extended}
          />

          <FAQSection faqs={product.faqs} />
        </div>

        {/* Footer Action Bar */}
        <FooterBar
          product={product}
          isDesktop={!isMobile}
        />
      </div>
    </div>
  );
}

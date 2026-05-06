import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useMediaQuery } from "./hooks/use-media-query";

// Components
import { Header } from "@/components/landing/Header";
import { ProductGallery } from "@/components/landing/ProductGallery";
import { ProductDetails } from "@/components/landing/ProductDetails";
import { ProductSpecs } from "@/components/landing/ProductSpecs";
import { ProductDescription } from "@/components/landing/ProductDescription";
import { VideoCard } from "@/components/landing/VideoCard";
import { FAQSection } from "@/components/landing/FAQSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { FooterBar } from "@/components/landing/FooterBar";
import { ProductSkeleton } from "@/components/landing/ProductSkeleton";
import AppWithErrorBoundary from "@/components/landing/ErrorBoundary";

function App() {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    // Reset success state when order panel closes
    if (!isOrderOpen) {
      setTimeout(() => setIsOrdered(false), 500); // Delay to avoid flash during exit animation
    }
  }, [isOrderOpen]);

  useEffect(() => {
    // Attempt to fetch dynamic product data from Airtable
    setIsLoading(true);
    setHasError(false);
    fetch("/api/product")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          const loadedProduct = data.product;
          if (!loadedProduct.images || loadedProduct.images.length === 0) {
            loadedProduct.images = [
              "https://images.unsplash.com/photo-1524592094714-cb9c76eb8f76?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400"
            ];
          }
          setProduct(loadedProduct);
        } else {
          setHasError(true);
        }
      })
      .catch(err => {
        console.error("Could not fetch dynamic product data", err);
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (hasError || !product) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-sm text-center max-w-md border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-3">Produit indisponible</h2>
          <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
            Nous rencontrons un problème technique pour charger les informations de ce produit. Veuillez réessayer dans quelques instants.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-[#111] text-white py-3.5 rounded-[12px] font-bold text-[14px] hover:bg-gray-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen w-full bg-white flex flex-col md:flex-row font-sans relative md:overflow-hidden">

      <Header 
        mobileOnly 
        brand={product.brand} 
        quantity={quantity} 
        setIsOrderOpen={setIsOrderOpen} 
      />

      <ProductGallery 
        images={product.images} 
        title={product.title} 
        activeImage={activeImage} 
        setActiveImage={setActiveImage} 
      />

      {/* Right Column: Content Area */}
      <div className="w-full md:w-1/2 flex-1 px-5 py-6 md:p-[40px] flex flex-col gap-6 md:gap-[25px] md:overflow-y-auto pb-[100px] md:pb-[100px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

        <Header 
          desktopOnly 
          brand={product.brand} 
          quantity={quantity} 
          setIsOrderOpen={setIsOrderOpen} 
        />

        <ProductDetails 
          collection={product.collection}
          title={product.title}
          rating={product.rating}
          reviewsCount={product.reviewsCount}
          price={product.price}
          currency={product.currency}
          quantity={quantity}
          setQuantity={setQuantity}
        />

        <ProductSpecs specs={product.specs} />

        <ProductDescription 
          shortDescription={product.description?.short}
          extendedDescription={product.description?.extended}
        />

        <VideoCard video={product.video} />

        <FAQSection faqs={product.faqs} />

        <ReviewsSection 
          ratingBreakdown={product.ratingBreakdown}
          reviews={product.reviews}
        />
      </div>

      <FooterBar 
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        isOrderOpen={isOrderOpen}
        setIsOrderOpen={setIsOrderOpen}
        isOrdered={isOrdered}
        setIsOrdered={setIsOrdered}
        isDesktop={isDesktop}
      />
    </div>
  );
}

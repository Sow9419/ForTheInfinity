'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCartStore } from '@/store/useCartStore';

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

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  const { items } = useCartStore();
  const cartItem = items.find(item => item.id === (params?.id as string));
  const currentQuantity = cartItem ? cartItem.quantity : 1; // Par défaut 1 pour WhatsApp si pas dans panier

  const productId = params?.id as string;

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const baseProduct = products.find((p: any) => p.id === productId);

        if (baseProduct) {
          const enrichedProduct = {
            ...baseProduct,
            brand: "Jokin Mode",
            collection: baseProduct.subtitle || "Infinity Collection",
            title: baseProduct.name,
            currency: "FCFA",
            images: baseProduct.images?.length > 0 ? baseProduct.images : (baseProduct.image ? [baseProduct.image] : []),
            specs: [
              { label: "Matière", value: "100% Coton Premium" },
              { label: "Coupe", value: "Oversized Fit" },
              { label: "Poids", value: "240 GSM" },
              { label: "Entretien", value: "Lavage à froid" }
            ],
            description: {
              short: baseProduct.shortDescription || "Pas de description disponible.",
              extended: baseProduct.extendedDescription || ""
            },
            faqs: [
              { question: "Quelle taille choisir ?", answer: "Nous recommandons votre taille habituelle pour un effet légèrement ample." },
              { question: "Quels sont les délais de livraison ?", answer: "La livraison à Bamako s'effectue en 24h. Pour les autres villes du Mali et de la sous-région, comptez 2 à 5 jours ouvrés." },
              { question: "Puis-je échanger un article ?", answer: "Oui, vous disposez de 48h après réception pour demander un échange si la taille ne vous convient pas (sous réserve de stock disponible)." },
              { question: "Quels sont les modes de paiement ?", answer: "Nous acceptons les paiements en espèces à la livraison (Bamako) ainsi que les transferts Orange Money et Moov Money." },
              { question: "Comment entretenir mon vêtement ?", answer: "Pour préserver la qualité du coton et de l'impression, nous conseillons un lavage à l'envers à 30°C et d'éviter le sèche-linge." }
            ]
          };
          setProduct(enrichedProduct);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

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
    <div className="min-h-screen md:h-screen w-full bg-white flex flex-col md:flex-row font-sans relative md:overflow-hidden">
      
      <FloatingWhatsApp 
        productName={product.title} 
        price={product.price} 
        quantity={currentQuantity}
        selectedSizes={selectedSizes}
      />

      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex absolute top-4 left-4 z-[60] bg-black/10 hover:bg-black/10 backdrop-blur-md p-3 rounded-full border border-white/20 transition-all group"
      >
        <ArrowLeft className="w-5 h-5 text-black group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Left Column: Media Gallery */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-full relative overflow-hidden bg-[#ECEEE5]">
        <ProductGallery
          images={product.images}
          title={product.title}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
        />
      </div>

      {/* Right Column: Content */}
      <div className="w-full bg-[#ECEEE5] md:w-1/2 flex-1 px-5 py-6 md:p-[40px] flex flex-col gap-6 md:gap-[25px] md:overflow-y-auto pb-[100px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

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
  );
}

import { useState, useEffect } from 'react';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { mapProductRecord, PRODUCTS_SELECT } from '@/lib/product-mapping';

export function useProduct(id: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        // 1) Avec les tailles jointes (nécessite la migration commerce)
        let record: any = null;
        const joined = await supabase
          .from('products')
          .select(PRODUCTS_SELECT)
          .eq('id', id)
          .single();

        if (joined.error) {
          // 2) Fallback : requête simple si la relation n'existe pas encore
          const plain = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
          if (plain.error) throw plain.error;
          record = plain.data;
        } else {
          record = joined.data;
        }

        if (record) {
          const mapped = mapProductRecord(record, record.product_sizes);
          const gallery = (mapped.images && mapped.images.length > 0)
            ? mapped.images
            : (record.image ? [getProductImageUrl(record.image)] : []);

          const enrichedProduct = {
            ...mapped,
            images: gallery,
            brand: "Jokin Mode",
            collection: record.subtitle || "Infinity Collection",
            title: record.name,
            currency: "FCFA",
            specs: [
              { label: "Matière", value: "100% Coton Premium" },
              { label: "Coupe", value: "Oversized Fit" },
              { label: "Poids", value: "240 GSM" },
              { label: "Entretien", value: "Lavage à froid" }
            ],
            description: {
              short: record.short_description || "Pas de description disponible.",
              extended: record.extended_description || ""
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
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

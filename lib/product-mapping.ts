import { getProductImageUrl } from '@/lib/supabase';
import { Product } from '@/types';

/**
 * Transforme une ligne `products` (+ éventuellement `product_sizes` jointes)
 * en objet Product utilisé partout côté client.
 */
export function mapProductRecord(
  record: any,
  productSizes?: any[]
): Product {
  const promoPrice = record.promo_price != null ? Number(record.promo_price) : null;
  const basePrice = Number(record.price);
  const effectivePrice = promoPrice != null && promoPrice < basePrice ? promoPrice : basePrice;

  const sizes = (productSizes || [])
    .map((ps: any) => ({
      sizeId: ps.size_id,
      name: ps.sizes?.name || '',
      position: ps.sizes?.position ?? 99,
      inStock: ps.in_stock !== false,
    }))
    .sort((a: any, b: any) => a.position - b.position);

  return {
    id: record.id,
    name: record.name,
    subtitle: record.subtitle,
    price: basePrice,
    image: getProductImageUrl(record.image),
    images: (record.images || []).map((path: string) => getProductImageUrl(path)),
    tall: record.tall || false,
    shortDescription: record.short_description,
    extendedDescription: record.extended_description,
    rating: record.rating,
    reviewsCount: record.reviews_count,
    variants: record.variants,
    category: record.category_id,
    inStock: record.in_stock !== false,
    promoPrice,
    effectivePrice,
    sizes,
    isLimited: record.is_limited === true,
    isNew: record.is_new === true,
  };
}

export const PRODUCTS_SELECT = '*, product_sizes(size_id, in_stock, sizes(id, name, position))';

import { NextResponse } from 'next/server';
import { airtableFetch, Tables } from '@/lib/airtable';

export async function GET() {
  try {
    const data = await airtableFetch(`/${Tables.Products}?view=Grid%20view`);
    
    const products = data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
      subtitle: record.fields.Subtitle,
      price: record.fields.Price,
      image: record.fields.Image?.[0]?.url || '',
      images: (record.fields.Image || []).map((att: any) => att.url),
      tall: record.fields.Tall || false,
      shortDescription: record.fields.ShortDescription,
      extendedDescription: record.fields.ExtendedDescription,
      rating: record.fields.Rating,
      reviewsCount: record.fields.ReviewsCount,
      variants: record.fields.Variants,
      category: record.fields.Category?.[0], // ID de la catégorie liée
    }));

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { airtableFetch, Tables } from '@/lib/airtable';

export async function GET() {
  try {
    const data = await airtableFetch(`/${Tables.Category}`);
    
    const categories = data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

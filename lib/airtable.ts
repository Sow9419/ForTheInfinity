// lib/airtable.ts

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn("Airtable API Key or Base ID is missing in environment variables.");
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export async function airtableFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${AIRTABLE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch from Airtable');
  }

  return response.json();
}

export const Tables = {
  Products: 'Products',
  Category: 'Category',
  OrderItems: 'OrderItems',
  CommandeClient: 'commande_client',
};

import { NextResponse } from "next/server";

import { fetchMercadoLivreProducts } from "@/services/productMetadata";

export const revalidate = 60 * 30;

export async function GET() {
  const products = await fetchMercadoLivreProducts();

  return NextResponse.json({
    products,
    fetchedAt: new Date().toISOString(),
  });
}


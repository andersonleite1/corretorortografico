export interface ProductData {
  id?: string;
  title: string;
  image?: string;
  price?: number;
  affiliateUrl: string;
  installments?: number;
  installmentValue?: number;
  installmentLabel?: string;
  originalPrice?: number;
}

interface MercadoLivreApiResponse {
  products?: MercadoLivreApiProduct[];
}

interface MercadoLivreApiProduct {
  id: string;
  title: string;
  url: string;
  cashPrice?: string;
  originalPrice?: string;
  installments?: {
    text?: string;
    quantity?: number;
    value?: string;
  };
  image?: string;
  scrapedAt?: string;
  category?: string;
  active?: boolean;
}

const DEFAULT_API_URL =
  "https://api.editordetexto.cloud/api/mercado-livre/products";

export async function fetchMercadoLivreProducts(): Promise<ProductData[]> {
  const apiUrl = process.env.MELI_API_URL ?? DEFAULT_API_URL;
  const apiKey = process.env.MELI_API_KEY;

  if (!apiKey) {
    console.warn(
      "[fetchMercadoLivreProducts] MELI_API_KEY not configured. Skipping request."
    );
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "x-api-key": apiKey,
      },
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      console.error(
        `[fetchMercadoLivreProducts] Request failed with status ${response.status}`
      );
      return [];
    }

    const payload = (await response.json()) as MercadoLivreApiResponse;
    const products = payload.products ?? [];

    return products
      .filter(
        (product) =>
          Boolean(product.active) &&
          Boolean(product.title) &&
          Boolean(product.url)
      )
      .map<ProductData>((product) => ({
        id: product.id,
        title: product.title,
        image: product.image,
        price: parseCurrency(product.cashPrice),
        affiliateUrl: product.url,
        installments: product.installments?.quantity,
        installmentValue: parseCurrency(product.installments?.value),
        installmentLabel: product.installments?.text,
        originalPrice: parseCurrency(product.originalPrice),
      }));
  } catch (error) {
    console.error("[fetchMercadoLivreProducts] Failed to fetch products:", error);
    return [];
  }
}

function parseCurrency(raw?: string | null): number | undefined {
  if (!raw) {
    return undefined;
  }

  const normalized = raw
    .replace(/[^\d,\.]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

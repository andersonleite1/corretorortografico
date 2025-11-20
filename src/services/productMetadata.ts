import axios from "axios";
import * as cheerio from "cheerio";

export interface ProductData {
  title: string;
  image?: string;
  price?: number;
  affiliateUrl: string;
  installments?: number;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const PRICE_PATTERNS = [
  'meta[property="product:price:amount"]',
  'meta[property="product:price"]',
  'meta[property="og:price:amount"]',
  'meta[itemprop="price"]',
  'meta[name="twitter:data1"]',
];

export async function fetchProductMetadata(
  url: string
): Promise<ProductData | null> {
  try {
    const response = await axios.get<string>(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content")?.trim() ||
      $("title").text().trim() ||
      "Oferta Mercado Livre";

    const image = $('meta[property="og:image"]').attr("content")?.trim();

    const price =
      parsePrice(
        PRICE_PATTERNS.map((selector) => $(selector).attr("content")?.trim())
          .filter(Boolean)
          .shift()
      ) ?? parsePrice(extractPriceFromText(title) || undefined);

    return {
      title,
      image,
      price,
      affiliateUrl: url,
      installments: 12,
    };
  } catch (error) {
    console.error(`[fetchProductMetadata] Failed for ${url}:`, error);
    return null;
  }
}

function parsePrice(raw?: string | null): number | undefined {
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

function extractPriceFromText(text: string): string | null {
  const match = text.match(/\d+(?:[\.,]\d{2})?/);
  return match ? match[0] : null;
}

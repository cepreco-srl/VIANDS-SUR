// ─── Mercado Libre API Service ───────────────────────────────────────────────

import type {
  MLCategory,
  MLHighlightItem,
  MLTrendKeyword,
} from "@/types/mercadolibre";

const BASE_URL = "https://api.mercadolibre.com";
const SITE_ID = process.env.ML_SITE_ID ?? "MLA";

function authHeaders(): HeadersInit {
  const token = process.env.ML_ACCESS_TOKEN;
  return token && token !== "your_access_token_here"
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function mlFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    next: { revalidate: 300 }, // 5-minute cache
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `ML API error ${res.status} on ${path}: ${errorBody.slice(0, 200)}`
    );
  }

  return res.json() as Promise<T>;
}

// ─── Trends ─────────────────────────────────────────────────────────────────

export async function getTrends(siteId = SITE_ID): Promise<MLTrendKeyword[]> {
  // Public endpoint, no auth needed
  const data = await mlFetch<MLTrendKeyword[]>(
    `/trends/${siteId}`
  );
  return data;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getRootCategories(siteId = SITE_ID): Promise<MLCategory[]> {
  interface SiteResponse {
    categories: { id: string; name: string }[];
  }
  const site = await mlFetch<SiteResponse>(`/sites/${siteId}`);
  return site.categories as MLCategory[];
}

export async function getCategoryDetails(categoryId: string): Promise<MLCategory> {
  return mlFetch<MLCategory>(`/categories/${categoryId}`);
}

// ─── Highlights / Best Sellers ───────────────────────────────────────────────

export async function getHighlights(
  categoryId: string,
  siteId = SITE_ID
): Promise<MLHighlightItem[]> {
  // Primary: use Search API sorted by sold quantity — always returns full item data
  interface SearchResponse {
    results: MLHighlightItem[];
  }

  try {
    const search = await mlFetch<SearchResponse>(
      `/sites/${siteId}/search?category=${categoryId}&sort=sold_quantity_desc&limit=20`
    );
    if (search.results?.length) {
      return search.results;
    }
  } catch {
    // fall through to highlights fallback
  }

  // Fallback: highlights endpoint + fetch item details
  interface HighlightResponse {
    content: { id: string }[];
  }

  const highlights = await mlFetch<HighlightResponse>(
    `/highlights/${siteId}/category/${categoryId}`
  );

  if (!highlights.content?.length) return [];

  const ids = highlights.content
    .slice(0, 20)
    .map((i) => i.id)
    .join(",");

  const details = await mlFetch<unknown[]>(`/items?ids=${ids}`);

  return details
    .map((entry) => {
      const e = entry as { code?: number; body?: MLHighlightItem } & MLHighlightItem;
      return e.body ?? e;
    })
    .filter((item): item is MLHighlightItem => Boolean(item?.id));
}

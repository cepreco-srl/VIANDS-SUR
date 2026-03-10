import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.mercadolibre.com";

function authHeaders(): HeadersInit {
  const token = process.env.ML_ACCESS_TOKEN;
  return token && token !== "your_access_token_here"
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("category") ?? "MLA1743";
  const siteId = req.nextUrl.searchParams.get("site") ?? "MLA";

  const headers = { "Content-Type": "application/json", ...authHeaders() };

  // Step 1: highlights endpoint
  const hlRes = await fetch(
    `${BASE_URL}/highlights/${siteId}/category/${categoryId}`,
    { headers }
  );
  const hlRaw = await hlRes.json();
  const firstIds = (hlRaw?.content ?? [])
    .slice(0, 3)
    .map((i: { id?: string }) => i.id)
    .filter(Boolean)
    .join(",");

  // Step 2: items endpoint (if IDs available)
  let itemsRaw = null;
  if (firstIds) {
    const itRes = await fetch(
      `${BASE_URL}/items?ids=${firstIds}`,
      { headers }
    );
    itemsRaw = await itRes.json();
  }

  // Step 3: search endpoint
  const srRes = await fetch(
    `${BASE_URL}/sites/${siteId}/search?category=${categoryId}&sort=sold_quantity_desc&limit=3`,
    { headers }
  );
  const searchRaw = await srRes.json();

  return NextResponse.json({
    highlights_raw: hlRaw,
    items_raw: itemsRaw,
    search_raw: searchRaw,
  });
}

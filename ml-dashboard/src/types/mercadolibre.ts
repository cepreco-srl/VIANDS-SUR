// ─── Mercado Libre API Types ────────────────────────────────────────────────

export interface MLTrendKeyword {
  keyword: string;
  url: string;
}

export interface MLTrendsResponse {
  keywords: MLTrendKeyword[];
}

// Highlight / Best Seller item returned by /highlights endpoint
export interface MLHighlightItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  condition: "new" | "used";
  thumbnail: string;
  permalink: string;
  seller: {
    id: number;
    nickname: string;
    reputation?: MLSellerReputation;
  };
  shipping: {
    free_shipping: boolean;
    logistic_type?: string;
  };
  attributes?: MLAttribute[];
  category_id?: string;
}

export interface MLSellerReputation {
  level_id: string | null;
  power_seller_status: string | null;
  transactions: {
    canceled: number;
    completed: number;
    period: string;
    ratings: {
      negative: number;
      neutral: number;
      positive: number;
    };
    total: number;
  };
  metrics?: {
    sales: { period: string; completed: number };
    claims: { period: string; rate: number; value: number };
    delayed_handling_time: { period: string; rate: number; value: number };
    cancellations: { period: string; rate: number; value: number };
  };
}

export interface MLAttribute {
  id: string;
  name: string;
  value_name: string | null;
  value_struct?: { number: number; unit: string } | null;
}

export interface MLHighlightsResponse {
  content: MLHighlightItem[];
}

// Category tree
export interface MLCategory {
  id: string;
  name: string;
  picture?: string;
  children_categories?: MLCategoryChild[];
  path_from_root?: { id: string; name: string }[];
  total_items_in_this_category?: number;
}

export interface MLCategoryChild {
  id: string;
  name: string;
  total_items_in_this_category: number;
}

// Opportunity score (computed client-side)
export interface OpportunityScore {
  score: number;       // 0-100
  label: "Alta" | "Media" | "Baja";
  color: string;
  reasoning: string;
}

// Enriched product for UI
export interface EnrichedProduct extends MLHighlightItem {
  opportunityScore: OpportunityScore;
}

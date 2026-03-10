// ─── Opportunity Score Calculator ────────────────────────────────────────────
// Computes a 0-100 score based on publicly available signals.

import type { MLHighlightItem, OpportunityScore } from "@/types/mercadolibre";

const REPUTATION_SCORES: Record<string, number> = {
  "5_green": 95,
  "4_light_green": 80,
  "3_yellow": 60,
  "2_orange": 35,
  "1_red": 10,
};

export function computeOpportunityScore(item: MLHighlightItem): OpportunityScore {
  let score = 50; // baseline
  const signals: string[] = [];

  // 1. Sold quantity signal (up to +25 pts)
  const sold = item.sold_quantity ?? 0;
  if (sold >= 1000) {
    score += 25;
    signals.push("Alta demanda comprobada (+1000 ventas)");
  } else if (sold >= 200) {
    score += 15;
    signals.push("Buena demanda (200-999 ventas)");
  } else if (sold >= 50) {
    score += 8;
    signals.push("Demanda moderada (50-199 ventas)");
  } else {
    signals.push("Demanda inicial (<50 ventas)");
  }

  // 2. Free shipping (+10 pts) — strong conversion driver
  if (item.shipping?.free_shipping) {
    score += 10;
    signals.push("Envío gratis (favorece conversión)");
  } else {
    score -= 5;
    signals.push("Sin envío gratis (reduce conversión)");
  }

  // 3. Condition: new items tend to score better in non-refurb categories
  if (item.condition === "new") {
    score += 5;
  }

  // 4. Seller reputation (up to +15 or down to -20)
  const repLevel = item.seller?.reputation?.level_id;
  if (repLevel) {
    const repScore = REPUTATION_SCORES[repLevel] ?? 50;
    // Low seller rep = high opportunity (competition is weak)
    // High seller rep = market dominated, lower opportunity
    if (repScore <= 35) {
      score += 15;
      signals.push("Competidor con baja reputación (ventana de entrada)");
    } else if (repScore <= 60) {
      score += 5;
      signals.push("Competidor con reputación media");
    } else {
      score -= 10;
      signals.push("Vendedor dominante con alta reputación");
    }
  }

  // 5. Available stock vs demand ratio
  const available = item.available_quantity ?? 0;
  if (available > 0 && sold > 0) {
    const ratio = sold / (sold + available);
    if (ratio > 0.8) {
      score += 10;
      signals.push("Stock bajo vs demanda (urgencia de compra)");
    }
  }

  // Clamp to [0, 100]
  score = Math.min(100, Math.max(0, score));

  let label: OpportunityScore["label"];
  let color: string;

  if (score >= 70) {
    label = "Alta";
    color = "text-emerald-400";
  } else if (score >= 40) {
    label = "Media";
    color = "text-amber-400";
  } else {
    label = "Baja";
    color = "text-red-400";
  }

  return {
    score: Math.round(score),
    label,
    color,
    reasoning: signals.slice(0, 3).join(" · "),
  };
}

export function formatPrice(price: number, currency = "ARS"): string {
  const locale = currency === "BRL" ? "pt-BR" : "es-AR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

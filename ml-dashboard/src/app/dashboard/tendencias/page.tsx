import TendenciasClient from "./TendenciasClient";
import { getTrends } from "@/lib/mercadolibre";
import type { MLTrendKeyword } from "@/types/mercadolibre";

export const revalidate = 300;

export default async function TendenciasPage() {
  let keywords: MLTrendKeyword[] = [];
  let error: string | null = null;

  try {
    keywords = await getTrends();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar tendencias";
  }

  return <TendenciasClient initialKeywords={keywords} initialError={error} />;
}

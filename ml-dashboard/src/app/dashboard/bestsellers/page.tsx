import BestSellersClient from "./BestSellersClient";
import { getRootCategories } from "@/lib/mercadolibre";
import type { MLCategory } from "@/types/mercadolibre";

export const revalidate = 3600;

export default async function BestSellersPage() {
  let categories: MLCategory[] = [];
  let catError: string | null = null;

  try {
    categories = await getRootCategories();
  } catch (err) {
    catError =
      err instanceof Error ? err.message : "Error al cargar categorías";
  }

  return (
    <BestSellersClient initialCategories={categories} categoryError={catError} />
  );
}

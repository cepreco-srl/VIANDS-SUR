"use client";

import { useState, useCallback } from "react";
import {
  ShoppingBag,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
  Search as SearchIcon,
} from "lucide-react";
import CategoryBadge from "@/components/ui/CategoryBadge";
import ProductCard from "@/components/ui/ProductCard";
import LoadingGrid from "@/components/ui/LoadingGrid";
import ErrorAlert from "@/components/ui/ErrorAlert";
import type { MLCategory, MLHighlightItem, EnrichedProduct } from "@/types/mercadolibre";
import { computeOpportunityScore } from "@/lib/opportunity";

interface Props {
  initialCategories: MLCategory[];
  categoryError: string | null;
}

export default function BestSellersClient({
  initialCategories,
  categoryError,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<MLCategory | null>(null);
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);

  const siteId = process.env.NEXT_PUBLIC_ML_SITE_ID ?? "MLA";

  const filteredCategories = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );
  const visibleCategories = showAllCats
    ? filteredCategories
    : filteredCategories.slice(0, 12);

  const loadProducts = useCallback(
    async (category: MLCategory) => {
      setSelectedCategory(category);
      setLoadingProducts(true);
      setProductError(null);
      setProducts([]);

      try {
        const res = await fetch(
          `/api/highlights?category=${category.id}&site=${siteId}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const raw: MLHighlightItem[] = await res.json();
        const enriched: EnrichedProduct[] = raw.map((item) => ({
          ...item,
          opportunityScore: computeOpportunityScore(item),
        }));
        // Sort by opportunity score descending
        enriched.sort((a, b) => b.opportunityScore.score - a.opportunityScore.score);
        setProducts(enriched);
      } catch (err) {
        setProductError(
          err instanceof Error ? err.message : "Error al cargar productos"
        );
      } finally {
        setLoadingProducts(false);
      }
    },
    [siteId]
  );

  const topScore =
    products.length > 0
      ? Math.max(...products.map((p) => p.opportunityScore.score))
      : 0;
  const avgScore =
    products.length > 0
      ? Math.round(
          products.reduce((s, p) => s + p.opportunityScore.score, 0) /
            products.length
        )
      : 0;

  return (
    <div className="flex h-full min-h-screen">
      {/* Category Sidebar */}
      <div className="w-64 shrink-0 hidden md:flex flex-col border-r border-white/[0.06] bg-gray-900/40 overflow-y-auto">
        <div className="px-4 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-yellow-400" />
            <p className="text-xs font-semibold text-gray-300">Categorías</p>
          </div>
          <div className="relative">
            <SearchIcon
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Buscar categoría…"
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-yellow-400/20 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 px-3 py-3 space-y-0.5">
          {categoryError && (
            <p className="text-xs text-red-400 px-2 py-2">{categoryError}</p>
          )}
          {visibleCategories.map((cat) => (
            <CategoryBadge
              key={cat.id}
              category={cat}
              selected={selectedCategory?.id === cat.id}
              onClick={() => loadProducts(cat)}
            />
          ))}
          {filteredCategories.length > 12 && (
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showAllCats ? (
                <>
                  <ChevronUp size={12} /> Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> Ver{" "}
                  {filteredCategories.length - 12} más
                </>
              )}
            </button>
          )}
          {filteredCategories.length === 0 && catSearch && (
            <p className="text-xs text-gray-600 px-3 py-4 text-center">
              Sin resultados
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={20} className="text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">Best Sellers</h1>
            </div>
            <p className="text-sm text-gray-400">
              {selectedCategory
                ? `Top productos en "${selectedCategory.name}"`
                : "Seleccioná una categoría para ver los más vendidos"}
            </p>
          </div>
          {selectedCategory && !loadingProducts && products.length > 0 && (
            <button
              onClick={() => loadProducts(selectedCategory)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs px-3 py-2 rounded-xl transition-all self-start"
            >
              <RefreshCw size={12} /> Actualizar
            </button>
          )}
        </div>

        {/* Mobile category selector */}
        <div className="md:hidden mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
            Categorías
          </p>
          <div className="flex flex-wrap gap-2">
            {initialCategories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => loadProducts(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedCategory?.id === cat.id
                    ? "bg-yellow-400 text-gray-900 border-yellow-400"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-yellow-400/30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar (when products loaded) */}
        {products.length > 0 && !loadingProducts && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-white">{products.length}</p>
              <p className="text-[11px] text-gray-500">Productos</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-emerald-400">{topScore}</p>
              <p className="text-[11px] text-gray-500">Mejor score</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-yellow-400">{avgScore}</p>
              <p className="text-[11px] text-gray-500">Score promedio</p>
            </div>
          </div>
        )}

        {/* States */}
        {!selectedCategory && !loadingProducts && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400/5 border border-yellow-400/10 flex items-center justify-center">
              <ShoppingBag size={32} className="text-yellow-400/40" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                Elegí una categoría
              </p>
              <p className="text-gray-500 text-sm max-w-xs">
                Seleccioná una categoría del panel lateral para ver los
                productos más vendidos con su índice de oportunidad.
              </p>
            </div>
          </div>
        )}

        {loadingProducts && <LoadingGrid count={8} />}

        {productError && !loadingProducts && (
          <ErrorAlert
            message={productError}
            onRetry={() => selectedCategory && loadProducts(selectedCategory)}
          />
        )}

        {!loadingProducts && !productError && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} rank={i + 1} />
            ))}
          </div>
        )}

        {!loadingProducts && !productError && selectedCategory && products.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-sm">
            No se encontraron productos para esta categoría
          </div>
        )}
      </div>
    </div>
  );
}

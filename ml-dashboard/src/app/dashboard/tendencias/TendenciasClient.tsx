"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Search,
  ExternalLink,
  RefreshCw,
  Flame,
  BarChart3,
} from "lucide-react";
import TrendChart from "@/components/charts/TrendChart";
import ErrorAlert from "@/components/ui/ErrorAlert";
import type { MLTrendKeyword } from "@/types/mercadolibre";

interface Props {
  initialKeywords: MLTrendKeyword[];
  initialError: string | null;
}

const SITE_SEARCH_URLS: Record<string, string> = {
  MLA: "https://listado.mercadolibre.com.ar",
  MLB: "https://lista.mercadolivre.com.br",
  MLM: "https://listado.mercadolibre.com.mx",
  MLC: "https://listado.mercadolibre.cl",
  MLU: "https://listado.mercadolibre.com.uy",
};

export default function TendenciasClient({ initialKeywords, initialError }: Props) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [error, setError] = useState(initialError);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const siteId = process.env.NEXT_PUBLIC_ML_SITE_ID ?? "MLA";
  const searchBase = SITE_SEARCH_URLS[siteId] ?? SITE_SEARCH_URLS.MLA;

  const filtered = useMemo(
    () =>
      keywords.filter((kw) =>
        kw.keyword.toLowerCase().includes(search.toLowerCase())
      ),
    [keywords, search]
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trends?site=${siteId}&t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MLTrendKeyword[] = await res.json();
      setKeywords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Tendencias Actuales</h1>
          </div>
          <p className="text-sm text-gray-400">
            Las {keywords.length} palabras clave más buscadas en Mercado Libre
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={refresh} />}

      {!error && keywords.length > 0 && (
        <>
          {/* Chart section */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-yellow-400" />
              <h2 className="text-sm font-semibold text-gray-200">
                Top 15 Tendencias (visualización)
              </h2>
            </div>
            <TrendChart keywords={keywords} limit={15} />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Filtrar palabras clave…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-yellow-400/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
            />
          </div>

          {/* Count */}
          <p className="text-xs text-gray-600 mb-3">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {search ? ` para "${search}"` : ""}
          </p>

          {/* Grid of keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((kw, i) => {
              const rank = keywords.indexOf(kw) + 1;
              const isHot = rank <= 10;
              return (
                <a
                  key={kw.keyword}
                  href={`${searchBase}/${encodeURIComponent(kw.keyword)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-yellow-400/20 rounded-xl px-4 py-3 transition-all duration-200"
                >
                  {/* Rank */}
                  <span
                    className={`text-xs font-bold w-7 shrink-0 text-right ${
                      rank <= 3
                        ? "text-yellow-400"
                        : rank <= 10
                        ? "text-amber-500"
                        : "text-gray-600"
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Keyword */}
                  <span className="flex-1 text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                    {kw.keyword}
                  </span>

                  {/* Hot badge */}
                  {isHot && (
                    <Flame
                      size={13}
                      className={rank <= 3 ? "text-orange-400 fill-orange-400" : "text-orange-600"}
                    />
                  )}

                  <ExternalLink
                    size={12}
                    className="text-gray-600 group-hover:text-yellow-400 transition-colors shrink-0"
                  />
                </a>
              );
            })}
          </div>

          {filtered.length === 0 && search && (
            <div className="text-center py-16 text-gray-500 text-sm">
              No se encontraron resultados para &quot;{search}&quot;
            </div>
          )}
        </>
      )}

      {!error && keywords.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500 text-sm">
          No hay tendencias disponibles
        </div>
      )}
    </div>
  );
}

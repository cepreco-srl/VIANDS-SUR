"use client";

import Image from "next/image";
import {
  ExternalLink,
  Package,
  Star,
  Truck,
  TrendingUp,
  ShoppingCart,
  Search,
} from "lucide-react";
import type { EnrichedProduct } from "@/types/mercadolibre";
import { formatPrice } from "@/lib/opportunity";

interface Props {
  product: EnrichedProduct;
  rank?: number;
}

const REPUTATION_LABELS: Record<string, { label: string; color: string }> = {
  "5_green": { label: "Platinum", color: "text-emerald-400" },
  "4_light_green": { label: "Gold", color: "text-yellow-400" },
  "3_yellow": { label: "Silver", color: "text-gray-300" },
  "2_orange": { label: "Bronze", color: "text-orange-400" },
  "1_red": { label: "Sin rep.", color: "text-red-400" },
};

export default function ProductCard({ product, rank }: Props) {
  const opp = product.opportunityScore;
  const rep = product.seller?.reputation?.level_id;
  const repInfo = rep ? REPUTATION_LABELS[rep] : null;

  const analyzeCompetition = () => {
    const query = encodeURIComponent(product.title);
    const site = process.env.NEXT_PUBLIC_ML_SITE_ID ?? "MLA";
    const baseUrls: Record<string, string> = {
      MLA: "https://listado.mercadolibre.com.ar",
      MLB: "https://lista.mercadolivre.com.br",
      MLM: "https://listado.mercadolibre.com.mx",
      MLC: "https://listado.mercadolibre.cl",
      MLU: "https://listado.mercadolibre.com.uy",
    };
    window.open(`${baseUrls[site] ?? baseUrls.MLA}/${query}`, "_blank");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-yellow-400/30 hover:bg-white/[0.07] transition-all duration-300 group flex flex-col">
      {/* Header: rank + opportunity badge */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {rank != null && (
          <span className="text-xs font-bold text-gray-500">#{rank}</span>
        )}
        <span
          className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${
            opp.label === "Alta"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : opp.label === "Media"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          Oportunidad {opp.label}
        </span>
      </div>

      {/* Image */}
      <div className="relative mx-4 mb-3 rounded-lg overflow-hidden bg-white/5 aspect-square max-h-40 flex items-center justify-center">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail.replace(/^http:/, "https:")}
            alt={product.title}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <Package size={40} className="text-gray-600" />
        )}
        {product.shipping?.free_shipping && (
          <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Truck size={10} /> GRATIS
          </div>
        )}
        {product.condition === "used" && (
          <div className="absolute top-2 right-2 bg-gray-700/90 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
            USADO
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium text-gray-100 line-clamp-2 leading-snug group-hover:text-yellow-300 transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-xl font-bold text-yellow-400">
          {formatPrice(product.price, product.currency_id)}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <ShoppingCart size={11} />
            {(product.sold_quantity ?? 0).toLocaleString("es-AR")} vendidos
          </span>
          {product.available_quantity != null && (
            <span className="flex items-center gap-1">
              <Package size={11} />
              {product.available_quantity.toLocaleString("es-AR")} stock
            </span>
          )}
          {repInfo && (
            <span className={`flex items-center gap-1 ${repInfo.color}`}>
              <Star size={11} />
              {repInfo.label}
            </span>
          )}
        </div>

        {/* Opportunity bar */}
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <TrendingUp size={10} /> Índice de Oportunidad
            </span>
            <span className={`text-[10px] font-bold ${opp.color}`}>
              {opp.score}/100
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                opp.label === "Alta"
                  ? "bg-emerald-400"
                  : opp.label === "Media"
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
              style={{ width: `${opp.score}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-600 mt-1 line-clamp-1">
            {opp.reasoning}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <a
            href={product.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 hover:border-yellow-400/40 text-yellow-400 text-xs font-medium py-2 rounded-lg transition-all"
          >
            <ExternalLink size={12} /> Ver en ML
          </a>
          <button
            onClick={analyzeCompetition}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-all"
          >
            <Search size={12} /> Analizar
          </button>
        </div>
      </div>
    </div>
  );
}

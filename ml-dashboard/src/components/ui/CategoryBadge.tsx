"use client";

import { Tag } from "lucide-react";
import type { MLCategory } from "@/types/mercadolibre";

interface Props {
  category: MLCategory;
  selected?: boolean;
  onClick?: () => void;
  showCount?: boolean;
}

export default function CategoryBadge({
  category,
  selected = false,
  onClick,
  showCount = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 text-left group
        ${
          selected
            ? "bg-yellow-400 text-gray-900 shadow-md shadow-yellow-400/20"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <Tag
        size={14}
        className={`shrink-0 ${selected ? "text-gray-900" : "text-gray-500 group-hover:text-yellow-400"}`}
      />
      <span className="truncate flex-1">{category.name}</span>
      {showCount && category.total_items_in_this_category != null && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
            selected ? "bg-gray-900/20 text-gray-800" : "bg-white/5 text-gray-500"
          }`}
        >
          {(category.total_items_in_this_category / 1000).toFixed(0)}k
        </span>
      )}
    </button>
  );
}

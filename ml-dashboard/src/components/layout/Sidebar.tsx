"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  LayoutDashboard,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Vista general",
  },
  {
    href: "/dashboard/tendencias",
    icon: TrendingUp,
    label: "Tendencias",
    description: "Top 50 búsquedas",
  },
  {
    href: "/dashboard/bestsellers",
    icon: ShoppingBag,
    label: "Best Sellers",
    description: "Más vendidos",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-gray-900/60 border-r border-white/[0.06] backdrop-blur-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Zap size={16} className="text-gray-900 fill-gray-900" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ML</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">
              Opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">
          Explorar
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-yellow-400/10 border border-yellow-400/20 text-yellow-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }
              `}
            >
              <Icon size={16} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p
                  className={`text-[10px] mt-0.5 leading-none ${
                    isActive ? "text-yellow-400/60" : "text-gray-600"
                  }`}
                >
                  {item.description}
                </p>
              </div>
              <ChevronRight
                size={12}
                className={`shrink-0 transition-transform ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-3">
          <p className="text-xs font-semibold text-yellow-400 mb-0.5">
            Datos en vivo
          </p>
          <p className="text-[10px] text-gray-500 leading-snug">
            API oficial de Mercado Libre · Caché 5 min
          </p>
        </div>
      </div>
    </aside>
  );
}

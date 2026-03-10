"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, ShoppingBag, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tendencias", icon: TrendingUp, label: "Tendencias" },
  { href: "/dashboard/bestsellers", icon: ShoppingBag, label: "Best Sellers" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-t border-white/[0.06] flex">
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
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium transition-colors ${
              isActive ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

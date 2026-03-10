import Link from "next/link";
import { TrendingUp, ShoppingBag, ArrowRight, Zap, Globe, BarChart3 } from "lucide-react";

const cards = [
  {
    href: "/dashboard/tendencias",
    icon: TrendingUp,
    title: "Tendencias Actuales",
    description:
      "Las 50 palabras clave más buscadas en tiempo real. Identificá qué productos están en auge antes que tu competencia.",
    cta: "Ver tendencias",
    color: "from-yellow-500/10 to-amber-600/5",
    border: "border-yellow-500/20 hover:border-yellow-400/40",
    iconColor: "text-yellow-400",
    badge: "50 keywords",
  },
  {
    href: "/dashboard/bestsellers",
    icon: ShoppingBag,
    title: "Best Sellers por Categoría",
    description:
      "Los 20 productos más vendidos en cada categoría, con Índice de Oportunidad calculado automáticamente.",
    cta: "Ver best sellers",
    color: "from-emerald-500/10 to-teal-600/5",
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    iconColor: "text-emerald-400",
    badge: "20 productos",
  },
];

const stats = [
  { icon: Globe, value: "18+", label: "Países disponibles" },
  { icon: BarChart3, value: "50", label: "Tendencias en vivo" },
  { icon: Zap, value: "5 min", label: "Caché de datos" },
];

export default function DashboardHomePage() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Zap size={10} className="fill-yellow-400" /> En vivo
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
          Dashboard de{" "}
          <span className="text-yellow-400">Oportunidades</span>
          <br />
          en Mercado Libre
        </h1>
        <p className="text-gray-400 text-base max-w-xl leading-relaxed">
          Analizá tendencias, best sellers e identificá nichos con alta demanda y
          baja competencia antes de invertir.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <Icon size={18} className="text-yellow-400 shrink-0" />
              <div>
                <p className="text-lg font-bold text-white leading-none">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.iconColor}`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-medium bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded-full">
                  {card.badge}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{card.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                {card.description}
              </p>
              <div
                className={`inline-flex items-center gap-2 text-sm font-semibold ${card.iconColor} group-hover:gap-3 transition-all`}
              >
                {card.cta} <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
        <Zap size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Los datos se obtienen de la{" "}
          <strong className="text-gray-400">API oficial de Mercado Libre</strong>.
          Configurá tu <code className="bg-white/5 px-1 py-0.5 rounded text-yellow-400">ML_ACCESS_TOKEN</code> en{" "}
          <code className="bg-white/5 px-1 py-0.5 rounded">.env.local</code> para desbloquear todos los endpoints.
          Las tendencias ({" "}
          <code className="bg-white/5 px-1 py-0.5 rounded text-yellow-400">/trends</code>{" "}
          ) son públicas y no requieren autenticación.
        </p>
      </div>
    </div>
  );
}

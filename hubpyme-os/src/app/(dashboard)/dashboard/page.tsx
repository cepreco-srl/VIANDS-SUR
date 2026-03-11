import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingCart,
  Package,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statCards = [
  {
    title: "Ventas hoy",
    value: "$0",
    description: "Sin datos aún",
    icon: ShoppingCart,
    trend: null,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Items en stock",
    value: "0",
    description: "Productos registrados",
    icon: Package,
    trend: null,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Mensajes nuevos",
    value: "0",
    description: "Sin mensajes sin leer",
    icon: MessageSquare,
    trend: null,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Ventas del mes",
    value: "$0",
    description: "Marzo 2026",
    icon: TrendingUp,
    trend: null,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const quickActions = [
  { label: "Nueva venta", href: "/ventas/nueva", icon: ShoppingCart },
  { label: "Agregar producto", href: "/stock/nuevo", icon: Package },
  { label: "Ver mensajes", href: "/mensajes", icon: MessageSquare },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { organizationName, name, email } = session.user;
  const displayName = name ?? email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ¡Bienvenido, {displayName?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {organizationName} · Dashboard general
          </p>
        </div>
        <Badge variant="secondary" className="mt-1">
          Etapa 1 · Demo
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-md p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
            <CardDescription>Lo más común para tu operación diaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Setup checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración inicial</CardTitle>
            <CardDescription>Completá estos pasos para comenzar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Perfil de organización completo", done: false },
              { label: "Primer producto en stock", done: false },
              { label: "Primera venta registrada", done: false },
              { label: "Integración con WhatsApp", done: false },
              { label: "Configuración fiscal (AFIP)", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    item.done
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  }`}
                />
                <span
                  className={
                    item.done ? "line-through text-muted-foreground" : ""
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Próximas etapas en desarrollo
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

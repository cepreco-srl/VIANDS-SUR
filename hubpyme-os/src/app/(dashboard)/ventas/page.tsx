import { ShoppingCart, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VentasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registrá y gestioná tus ventas
          </p>
        </div>
        <Badge variant="outline" className="mt-1 gap-1.5">
          <Clock className="h-3 w-3" />
          Próximamente
        </Badge>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4 text-lg">Módulo de Ventas</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Aquí podrás registrar ventas, generar comprobantes y hacer seguimiento
            de tus ingresos. Disponible en la Etapa 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Lo que viene:</p>
            <ul className="space-y-1">
              <li>→ Terminal de ventas rápida</li>
              <li>→ Selección de clientes y productos</li>
              <li>→ Emisión de comprobantes</li>
              <li>→ Integración con AFIP (Factura A/B/C)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

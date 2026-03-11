import { Package, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StockPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control de inventario y productos
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
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4 text-lg">Módulo de Inventario</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Gestioná tus productos, costos, precios y niveles de stock. Con
            alertas automáticas cuando el stock esté bajo. Disponible en la Etapa 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Lo que viene:</p>
            <ul className="space-y-1">
              <li>→ CRUD de productos con categorías</li>
              <li>→ Seguimiento de stock en tiempo real</li>
              <li>→ Alertas de stock mínimo</li>
              <li>→ Control de costos y márgenes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

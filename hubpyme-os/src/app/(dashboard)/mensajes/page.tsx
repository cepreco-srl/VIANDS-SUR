import { MessageSquare, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MensajesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inbox unificado: WhatsApp + Gmail
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
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4 text-lg">Hub de Comunicación</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Todos tus mensajes en un solo lugar. Conectá tu WhatsApp Business y
            Gmail para responder clientes sin saltar entre apps. Disponible en la Etapa 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">Lo que viene:</p>
            <ul className="space-y-1">
              <li>→ Inbox unificado (WhatsApp + Gmail)</li>
              <li>→ Mensajes vinculados a contactos</li>
              <li>→ Visibilidad para todo el equipo</li>
              <li>→ Respuestas rápidas predefinidas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

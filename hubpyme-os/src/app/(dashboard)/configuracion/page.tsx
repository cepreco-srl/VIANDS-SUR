import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Building2, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { user } = session;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administrá tu organización y cuenta
        </p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Organización</CardTitle>
          </div>
          <CardDescription>Datos de tu empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre
            </p>
            <p className="text-sm font-medium">{user.organizationName}</p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              ID de Organización
            </p>
            <p className="text-sm font-mono text-muted-foreground">
              {user.organizationId}
            </p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              CUIT
            </p>
            <p className="text-sm text-muted-foreground">No configurado</p>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Mi cuenta</CardTitle>
          </div>
          <CardDescription>Tu perfil de usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre
            </p>
            <p className="text-sm font-medium">{user.name ?? "Sin nombre"}</p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm">{user.email}</p>
          </div>
          <Separator />
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Rol
            </p>
            <Badge variant="secondary" className="w-fit">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Integrations (future) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Integraciones</CardTitle>
          </div>
          <CardDescription>Conectá tus servicios externos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "WhatsApp Business", status: "no conectado" },
              { name: "Gmail", status: "no conectado" },
              { name: "AFIP Web Services", status: "no configurado" },
            ].map((int) => (
              <div
                key={int.name}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium">{int.name}</span>
                <Badge variant="outline" className="text-xs">
                  {int.status}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Las integraciones estarán disponibles en las próximas etapas del desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

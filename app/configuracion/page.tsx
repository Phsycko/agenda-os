"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import { canViewSettings } from "@/lib/crm/permissions";
import { EmptyState } from "@/components/ui/empty-state";
import { LEAD_SOURCES } from "@/lib/crm/types";
import type { SellerRole } from "@/lib/crm/types";

export default function ConfiguracionPage() {
  const { state, updateSettings, createSeller, updateSeller, deleteSeller, installDemo, clearDemo, resetWorkspace, currentSeller } = useCrm();

  if (!canViewSettings(currentSeller)) {
    return (
      <AppShell title="Configuracion">
        <EmptyState title="Acceso restringido" description="Solo administradores configuran la agencia." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Configuracion">
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
          <p className="text-sm text-muted-foreground">Marca, moneda, servicios y equipo. Los datos comerciales viven en localStorage hasta conectar backend.</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={state.settings.companyName} onChange={(e) => updateSettings({ companyName: e.target.value })} placeholder="Nombre de la empresa" />
            <Input value={state.settings.brandText} onChange={(e) => updateSettings({ brandText: e.target.value })} placeholder="Texto de marca" />
            <Input value={state.settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} placeholder="Moneda (USD, MXN…)" />
            <Textarea
              value={state.settings.servicesOffered.join(", ")}
              onChange={(e) => updateSettings({ servicesOffered: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Servicios ofrecidos, separados por coma"
            />
            <p className="text-xs text-muted-foreground">Fuentes de leads disponibles: {LEAD_SOURCES.join(", ")} (editar en código si necesitas más).</p>
            <p className="text-xs text-primary">Los cambios se guardan automáticamente en este navegador.</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Datos de demostración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Instalar demo reemplaza leads, clientes, citas, tareas comerciales, plantillas seleccionadas y movimientos. Conserva ajustes y datos personales.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={installDemo}>
                Instalar datos de demostración
              </Button>
              <Button variant="outline" onClick={clearDemo} disabled={!state.demoIds}>
                Borrar solo datos demo
              </Button>
              <Button variant="destructive" onClick={() => window.confirm("¿Borrar TODO el workspace?") && resetWorkspace()}>
                Reset total
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Vendedores y roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.sellers.map((s) => (
              <div key={s.id} className="grid md:grid-cols-6 gap-2 border border-border rounded-lg p-3 bg-[#101010]">
                <Input value={s.name} onChange={(e) => updateSeller(s.id, { name: e.target.value })} className="md:col-span-2" />
                <Input value={s.email} onChange={(e) => updateSeller(s.id, { email: e.target.value })} className="md:col-span-2" />
                <Select value={s.role} onValueChange={(v) => updateSeller(s.id, { role: (v ?? s.role) as SellerRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => updateSeller(s.id, { active: !s.active })}>
                    {s.active ? "Desactivar" : "Activar"}
                  </Button>
                  {s.role !== "ADMIN" ? (
                    <Button size="sm" variant="destructive" onClick={() => deleteSeller(s.id)}>
                      Eliminar
                    </Button>
                  ) : null}
                </div>
                <Input
                  type="number"
                  placeholder="Meta mensual"
                  className="md:col-span-2"
                  value={s.monthlyGoal ?? ""}
                  onChange={(e) => updateSeller(s.id, { monthlyGoal: e.target.value === "" ? null : Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="% comisión"
                  className="md:col-span-2"
                  value={s.commissionPct ?? ""}
                  onChange={(e) => updateSeller(s.id, { commissionPct: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                createSeller({
                  name: "Nuevo vendedor",
                  email: `vendedor${Date.now()}@local.test`,
                  phone: null,
                  role: "VENDEDOR",
                  active: true,
                  monthlyGoal: null,
                  commissionPct: null,
                })
              }
            >
              Añadir vendedor
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

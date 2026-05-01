"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { ReportsCharts } from "@/components/dashboard/reports-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrm } from "@/components/providers/crm-provider";
import { reportsBundle } from "@/lib/crm/selectors";
import { canViewFinances } from "@/lib/crm/permissions";

export default function ReportesPage() {
  const { state, currentSeller } = useCrm();
  const r = reportsBundle(state);
  const showMoney = canViewFinances(currentSeller);

  return (
    <AppShell title="Reportes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Vista agregada de embudo, equipo e ingresos.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Stat label="Clientes activos" value={String(r.clientsActive)} />
          <Stat label="Clientes perdidos" value={String(r.clientsLost)} />
          <Stat label="Demos agendadas" value={String(r.demosAgendadas)} />
          <Stat label="Demos realizadas" value={String(r.demosRealizadas)} />
          <Stat label="Propuestas enviadas" value={String(r.propuestas)} />
          <Stat label="Ventas cerradas (ganadas)" value={String(r.ventasCerradas)} />
          <Stat label="Tareas completadas" value={String(r.tareasCompletadas)} />
          <Stat label="Eventos en bitácora" value={String(r.activityCount)} />
        </div>

        <ReportsCharts bySource={r.bySource.length ? r.bySource : [{ name: "—", value: 0 }]} byStage={r.conversionByStage} byMonth={showMoney && r.byMonth.length ? r.byMonth : [{ month: "—", value: 0 }]} />

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Leads por vendedor</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.bySeller.length ? r.bySeller : [{ name: "—", value: 0 }]}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="name" stroke="#999" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C853" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Tasa de cierre por vendedor (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={r.closeBySeller.length ? r.closeBySeller : [{ name: "—", value: 0 }]}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="name" stroke="#999" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00E676" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrm } from "@/components/providers/crm-provider";
import { computeDashboard } from "@/lib/crm/selectors";
import { canViewFinances } from "@/lib/crm/permissions";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  const { state, ready, currentSeller } = useCrm();
  const m = computeDashboard(state);
  const showMoney = canViewFinances(currentSeller);

  if (!ready) {
    return (
      <AppShell title="Dashboard">
        <p className="text-sm text-muted-foreground">Cargando workspace…</p>
      </AppShell>
    );
  }

  const hasData =
    state.leads.length > 0 ||
    state.clients.length > 0 ||
    state.appointments.length > 0 ||
    state.finances.length > 0;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Control operativo</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Métricas en vivo desde tu CRM local. Conecta autenticación y base de datos cuando estés listo sin cambiar la UI.
            </p>
          </div>
          {!hasData ? (
            <EmptyState
              title="Workspace vacío"
              description="Instala datos de demostración desde Configuración o crea tu primer lead desde el botón superior."
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Leads totales" value={`${m.leadsTotal}`} />
          <StatCard title="Leads nuevos (7 días)" value={`${m.leadsNewWeek}`} helper="Ventana móvil" />
          <StatCard title="Demos agendadas" value={`${m.demosScheduled}`} helper="Pendientes tipo demo" />
          <StatCard title="Clientes activos" value={`${m.clientsActive}`} />
          <StatCard title="Tasa de cierre" value={`${m.closeRate.toFixed(1)}%`} />
          {showMoney ? (
            <>
              <StatCard title="Ingresos del mes" value={`$${m.incomeMonth.toFixed(0)}`} />
              <StatCard title="Egresos del mes" value={`$${m.expenseMonth.toFixed(0)}`} />
              <StatCard title="Utilidad estimada" value={`$${m.estimatedProfit.toFixed(0)}`} />
              <StatCard title="Recurrente mensual" value={`$${m.recurringMonthly.toFixed(0)}`} helper="Suma mensualidades activas" />
              <StatCard title="Ticket promedio" value={`$${m.avgTicket.toFixed(0)}`} helper="Clientes activos" />
            </>
          ) : (
            <StatCard title="Finanzas" value="—" helper="Solo administradores ven montos globales." />
          )}
        </div>

        <DashboardCharts
          bySource={m.bySource.length ? m.bySource : [{ name: "Sin datos", value: 0 }]}
          incomeData={m.incomeByMonth.length ? m.incomeByMonth : [{ month: "—", value: 0 }]}
        />

        <div className="grid xl:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-auto">
              {m.recentActivity.length ? (
                m.recentActivity.map((a) => (
                  <div key={a.id} className="text-sm border-b border-border/80 pb-2 last:border-0">
                    <span className="text-muted-foreground text-xs">{format(parseISO(a.createdAt), "d MMM HH:mm", { locale: es })}</span>
                    <p className="text-zinc-200">{a.description}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {a.action}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin actividad registrada todavía.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Ranking de vendedores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {m.sellerRanking.length ? (
                m.sellerRanking.map((r, i) => (
                  <div key={r.sellerId} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {r.name}
                    </span>
                    <span className="text-primary font-medium">${r.revenue.toFixed(0)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin vendedores o ingresos asignados.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid xl:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Leads sin seguimiento</CardTitle>
              <Link href="/leads" className="text-xs text-primary hover:underline">
                Ver leads
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-auto">
              {m.leadsNoFollowUp.length ? (
                m.leadsNoFollowUp.slice(0, 8).map((l) => (
                  <div key={l.id} className="text-sm flex justify-between gap-2 border-b border-border/60 pb-2">
                    <span className="font-medium truncate">{l.businessName}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {l.stage.replaceAll("_", " ")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Todo al día o sin leads abiertos.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Próximas citas</CardTitle>
              <Link href="/agenda" className="text-xs text-primary hover:underline">
                Agenda
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-auto">
              {m.upcomingAppointments.length ? (
                m.upcomingAppointments.map((a) => (
                  <div key={a.id} className="text-sm border-b border-border/60 pb-2">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.date} · {a.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay citas pendientes próximas.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tareas vencidas</CardTitle>
              <Link href="/tareas" className="text-xs text-primary hover:underline">
                Tareas
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-auto">
              {m.overdueTasks.length ? (
                m.overdueTasks.map((t) => (
                  <div key={t.id} className="text-sm border-b border-border/60 pb-2">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-amber-300">Vence: {t.dueDate?.slice(0, 10)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin tareas vencidas.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

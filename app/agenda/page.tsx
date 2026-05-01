"use client";

import { useMemo, useState } from "react";
import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { useCrm } from "@/components/providers/crm-provider";
import { filterAppointmentsForUser, isReadOnly } from "@/lib/crm/permissions";
import { APPOINTMENT_TYPES, type AppointmentType, type CrmAppointment } from "@/lib/crm/types";
import { CopyButton } from "@/components/ui/copy-button";

const TYPE_COLORS: Record<AppointmentType, string> = {
  DEMO: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  LLAMADA: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SEGUIMIENTO: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  REVISION_MENSUAL: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  CIERRE: "bg-emerald-600/20 text-emerald-200 border-emerald-600/40",
  REUNION_INTERNA: "bg-zinc-600/20 text-zinc-200 border-zinc-600/40",
};

const STATUS_COLORS: Record<CrmAppointment["status"], string> = {
  PENDIENTE: "text-zinc-200",
  COMPLETADA: "text-emerald-300",
  CANCELADA: "text-red-300",
  NO_ASISTIO: "text-amber-300",
};

function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export default function AgendaPage() {
  const { state, currentSeller, updateAppointment, deleteAppointment } = useCrm();
  const readOnly = isReadOnly(currentSeller);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"dia" | "semana" | "mes" | "lista">("semana");
  const [selected, setSelected] = useState<CrmAppointment | null>(null);
  const [filters, setFilters] = useState({ type: "ALL", status: "ALL", seller: "ALL" });

  const baseApps = useMemo(() => filterAppointmentsForUser(state.appointments, state), [state]);

  const appointments = useMemo(() => {
    return baseApps.filter((a) => {
      const matchT = filters.type === "ALL" || a.type === filters.type;
      const matchS = filters.status === "ALL" || a.status === filters.status;
      const matchV = filters.seller === "ALL" || (filters.seller === "__none" ? !a.sellerId : a.sellerId === filters.seller);
      return matchT && matchS && matchV;
    });
  }, [baseApps, filters]);

  const leads = state.leads.map((l) => ({ id: l.id, businessName: l.businessName }));
  const clients = state.clients.map((c) => ({ id: c.id, businessName: c.businessName }));

  const resolveName = (a: CrmAppointment) => {
    if (a.clientId) return state.clients.find((c) => c.id === a.clientId)?.businessName ?? "Cliente";
    if (a.leadId) return state.leads.find((l) => l.id === a.leadId)?.businessName ?? "Lead";
    return "—";
  };

  const week = useMemo(() => weekDays(selectedDate), [selectedDate]);
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = useMemo(() => {
    const out: Date[] = [];
    let day = monthGridStart;
    while (day <= monthGridEnd) {
      out.push(day);
      day = addDays(day, 1);
    }
    return out;
  }, [monthGridStart, monthGridEnd]);

  const appointmentsForDate = (date: Date) => appointments.filter((a) => isSameDay(parseISO(a.date), date));

  const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekApps = appointments.filter((a) => {
    const d = parseISO(a.date);
    return d >= todayStart && d <= addDays(todayStart, 6);
  });

  return (
    <AppShell title="Agenda">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agenda comercial</h1>
            <p className="text-sm text-muted-foreground">Demos, seguimientos y revisiones ligadas a leads y clientes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!readOnly ? (
              <Dialog>
                <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                  Crear cita
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Nueva cita</DialogTitle>
                  </DialogHeader>
                  <AppointmentForm leads={leads} clients={clients} />
                </DialogContent>
              </Dialog>
            ) : null}
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Hoy
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Esta semana ({thisWeekApps.length})
            </Button>
            <Button variant="outline" onClick={() => setFilters((f) => ({ ...f, status: "PENDIENTE" }))}>
              Pendientes
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-3">
          <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v ?? "ALL" }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {APPOINTMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v ?? "ALL" }))}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="COMPLETADA">Completada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
              <SelectItem value="NO_ASISTIO">No asistió</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.seller} onValueChange={(v) => setFilters((f) => ({ ...f, seller: v ?? "ALL" }))}>
            <SelectTrigger>
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="__none">Sin asignar</SelectItem>
              {state.sellers.filter((s) => s.active).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!appointments.length ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">No hay citas con estos filtros.</CardContent>
          </Card>
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <div>
              <Tabs value={view} onValueChange={(v) => setView((v ?? "semana") as typeof view)}>
                <TabsList>
                  <TabsTrigger value="dia">Día</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
                  <TabsTrigger value="lista">Lista</TabsTrigger>
                </TabsList>

                <TabsContent value="dia" className="mt-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {appointmentsForDate(selectedDate).map((a) => (
                        <AppointmentRow key={a.id} a={a} label={resolveName(a)} onSelect={() => setSelected(a)} />
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="semana" className="mt-4">
                  <div className="grid md:grid-cols-2 2xl:grid-cols-7 gap-3">
                    {week.map((day) => {
                      const dayItems = appointmentsForDate(day);
                      return (
                        <Card key={day.toISOString()} className="bg-card border-border min-h-52">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>{format(day, "EEE", { locale: es })}</span>
                              <span className="text-muted-foreground">{format(day, "d")}</span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{dayItems.length} citas</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {dayItems.map((a) => (
                              <AppointmentRow key={a.id} a={a} compact label={resolveName(a)} onSelect={() => setSelected(a)} />
                            ))}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="mes" className="mt-4">
                  <div className="grid grid-cols-7 gap-2">
                    {monthDays.map((day) => {
                      const dayItems = appointmentsForDate(day);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          className={`rounded-lg border border-border min-h-24 text-left p-2 bg-[#101010] hover:border-primary/60 transition ${isSameMonth(day, selectedDate) ? "" : "opacity-50"}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <p className="text-xs text-muted-foreground">{format(day, "d")}</p>
                          <div className="mt-2 space-y-1">
                            {dayItems.slice(0, 2).map((i) => (
                              <div key={i.id} className="h-1.5 rounded bg-primary/70" />
                            ))}
                            {dayItems.length > 2 ? <p className="text-[10px] text-muted-foreground">+{dayItems.length - 2}</p> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="lista" className="mt-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-6 border-b border-border px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                        <span>Fecha</span>
                        <span>Hora</span>
                        <span>Tipo</span>
                        <span>Relación</span>
                        <span>Estado</span>
                        <span>Siguiente</span>
                      </div>
                      {appointments.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className="w-full grid grid-cols-6 px-4 py-3 text-sm border-b border-border hover:bg-[#141414] text-left"
                          onClick={() => setSelected(a)}
                        >
                          <span>{format(parseISO(a.date), "dd/MM/yyyy")}</span>
                          <span>{a.time}</span>
                          <span>{a.type.replaceAll("_", " ")}</span>
                          <span>{resolveName(a)}</span>
                          <span className={STATUS_COLORS[a.status]}>{a.status.replaceAll("_", " ")}</span>
                          <span className="truncate">{a.nextAction ?? "—"}</span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <Card className="bg-card border-border xl:sticky xl:top-20 h-fit">
              <CardHeader>
                <CardTitle>Detalle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Selecciona una cita.</p>
                ) : (
                  <>
                    <p className="font-semibold">{selected.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(selected.date), "EEEE d MMM", { locale: es })} · {selected.time}
                    </p>
                    <Badge className={TYPE_COLORS[selected.type]}>{selected.type.replaceAll("_", " ")}</Badge>
                    <p className="text-sm">{resolveName(selected)}</p>
                    <p className="text-sm text-muted-foreground">{selected.notes ?? "—"}</p>
                    {!readOnly ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" onClick={() => updateAppointment(selected.id, { status: "COMPLETADA" })}>
                          Completada
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateAppointment(selected.id, { status: "NO_ASISTIO" })}>
                          No asistió
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateAppointment(selected.id, { status: "CANCELADA" })}>
                          Cancelar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteAppointment(selected.id)}>
                          Eliminar
                        </Button>
                      </div>
                    ) : null}
                    <CopyButton text={`Cita: ${selected.title} el ${selected.date} ${selected.time}`} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AppointmentRow({
  a,
  label,
  onSelect,
  compact,
}: {
  a: CrmAppointment;
  label: string;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border border-border bg-[#121212] hover:bg-[#171717] transition text-left ${compact ? "p-2" : "p-3"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>
          {a.time} — {a.title}
        </p>
        <Badge className={TYPE_COLORS[a.type]}>{a.type.replaceAll("_", " ")}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className={`mt-1 text-xs ${STATUS_COLORS[a.status]}`}>{a.status}</p>
    </button>
  );
}

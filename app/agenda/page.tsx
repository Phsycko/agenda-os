"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { useCrm } from "@/components/providers/crm-provider";
import { filterAppointmentsForUser, isReadOnly } from "@/lib/crm/permissions";
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentType,
  type CrmAppointment,
} from "@/lib/crm/types";
import { CopyButton } from "@/components/ui/copy-button";

const TYPE_ACCENT: Record<AppointmentType, string> = {
  DEMO: "border-l-emerald-400",
  LLAMADA: "border-l-sky-400",
  SEGUIMIENTO: "border-l-amber-400",
  REVISION_MENSUAL: "border-l-violet-400",
  CIERRE: "border-l-emerald-500",
  REUNION_INTERNA: "border-l-zinc-500",
};

const TYPE_BADGE: Record<AppointmentType, string> = {
  DEMO: "bg-emerald-500/12 text-emerald-200 border-emerald-500/25",
  LLAMADA: "bg-sky-500/12 text-sky-200 border-sky-500/25",
  SEGUIMIENTO: "bg-amber-500/12 text-amber-200 border-amber-500/25",
  REVISION_MENSUAL: "bg-violet-500/12 text-violet-200 border-violet-500/25",
  CIERRE: "bg-emerald-600/15 text-emerald-100 border-emerald-500/30",
  REUNION_INTERNA: "bg-zinc-600/20 text-zinc-200 border-zinc-500/25",
};

const STATUS_MUTED: Record<CrmAppointment["status"], string> = {
  PENDIENTE: "text-zinc-300",
  COMPLETADA: "text-emerald-400/90",
  CANCELADA: "text-red-400/90",
  NO_ASISTIO: "text-amber-400/90",
};

function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function timeSortKey(time: string) {
  const [h, m] = time.split(":").map((x) => Number(x));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export default function AgendaPage() {
  const { state, currentSeller, updateAppointment, deleteAppointment, updateSettings } = useCrm();
  const readOnly = isReadOnly(currentSeller);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [view, setView] = useState<"dia" | "semana" | "mes" | "lista">("dia");
  const [selected, setSelected] = useState<CrmAppointment | null>(null);
  const [filters, setFilters] = useState({ type: "ALL", status: "ALL", seller: "ALL" });

  const key = dateKey(selectedDate);
  const storedDayNote = state.settings.agendaDayNotes[key] ?? "";
  const [dayNoteDraft, setDayNoteDraft] = useState(storedDayNote);

  useEffect(() => {
    setDayNoteDraft(state.settings.agendaDayNotes[key] ?? "");
  }, [key, state.settings.agendaDayNotes]);

  const persistDayNote = useCallback(() => {
    updateSettings({
      agendaDayNotes: {
        ...state.settings.agendaDayNotes,
        [key]: dayNoteDraft,
      },
    });
  }, [updateSettings, state.settings.agendaDayNotes, key, dayNoteDraft]);

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

  const appointmentsForDate = (date: Date) =>
    [...appointments.filter((a) => isSameDay(parseISO(a.date), date))].sort((a, b) => timeSortKey(a.time) - timeSortKey(b.time));

  const todayStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekApps = appointments.filter((a) => {
    const d = parseISO(a.date);
    return d >= todayStart && d <= addDays(todayStart, 6);
  });

  const dayItems = appointmentsForDate(selectedDate);
  const hasFiltered = appointments.length > 0;

  return (
    <AppShell title="Agenda">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Plan del día</h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Estructura tu día como en Notion: nota libre por fecha, citas en timeline y vistas extra cuando las necesites.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly ? (
              <Dialog>
                <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                  + Cita
                </DialogTrigger>
                <DialogContent className="max-w-3xl border-border bg-card">
                  <DialogHeader>
                    <DialogTitle>Nueva cita</DialogTitle>
                  </DialogHeader>
                  <AppointmentForm leads={leads} clients={clients} />
                </DialogContent>
              </Dialog>
            ) : null}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedDate(new Date())}>
              Ir a hoy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSelectedDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
                setView("semana");
              }}
            >
              Esta semana ({thisWeekApps.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setFilters((f) => ({ ...f, status: "PENDIENTE" }))}
            >
              Solo pendientes
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-zinc-950/40 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
            <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v ?? "ALL" }))}>
              <SelectTrigger className="h-9 w-full min-w-0 border-white/10 bg-transparent">
                <SelectValue placeholder="Tipo">
                  {(v) => (!v || v === "ALL" ? "Todos los tipos" : APPOINTMENT_TYPE_LABELS[v as AppointmentType] ?? v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {APPOINTMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {APPOINTMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v ?? "ALL" }))}>
              <SelectTrigger className="h-9 w-full min-w-0 border-white/10 bg-transparent">
                <SelectValue placeholder="Estado">
                  {(v) => (!v || v === "ALL" ? "Todos los estados" : APPOINTMENT_STATUS_LABELS[v as CrmAppointment["status"]] ?? v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">{APPOINTMENT_STATUS_LABELS.PENDIENTE}</SelectItem>
                <SelectItem value="COMPLETADA">{APPOINTMENT_STATUS_LABELS.COMPLETADA}</SelectItem>
                <SelectItem value="CANCELADA">{APPOINTMENT_STATUS_LABELS.CANCELADA}</SelectItem>
                <SelectItem value="NO_ASISTIO">{APPOINTMENT_STATUS_LABELS.NO_ASISTIO}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.seller} onValueChange={(v) => setFilters((f) => ({ ...f, seller: v ?? "ALL" }))}>
              <SelectTrigger className="h-9 w-full min-w-0 border-white/10 bg-transparent">
                <SelectValue placeholder="Vendedor">
                  {(v) =>
                    !v || v === "ALL"
                      ? "Todos"
                      : v === "__none"
                        ? "Sin asignar"
                        : state.sellers.find((s) => s.id === v)?.name ?? "Vendedor"
                  }
                </SelectValue>
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
        </div>

        <Tabs value={view} onValueChange={(v) => setView((v ?? "dia") as typeof view)} className="w-full">
          <TabsList className="h-auto w-fit gap-1 rounded-lg border border-white/[0.06] bg-zinc-950/60 p-1">
            <TabsTrigger value="dia" className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none">
              Día
            </TabsTrigger>
            <TabsTrigger value="semana" className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-zinc-800">
              Semana
            </TabsTrigger>
            <TabsTrigger value="mes" className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-zinc-800">
              Mes
            </TabsTrigger>
            <TabsTrigger value="lista" className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-zinc-800">
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dia" className="mt-6 focus-visible:outline-none">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
                      <ChevronLeftIcon className="size-4" />
                    </Button>
                    <div>
                      <p className="text-lg font-medium capitalize text-zinc-100">
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: es })}
                      </p>
                      {isToday(selectedDate) ? (
                        <p className="text-xs font-medium text-primary">Hoy</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{format(selectedDate, "yyyy-MM-dd")}</p>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarIcon className="size-4 opacity-70" />
                    <input
                      type="date"
                      className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm text-foreground"
                      value={key}
                      onChange={(e) => {
                        if (e.target.value) setSelectedDate(parseISO(e.target.value));
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-1">
                  <div className="rounded-lg p-4">
                    <Label className="text-xs font-medium uppercase tracking-wide text-amber-200/80">Intenciones del día</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Escribe libremente: prioridades, recordatorios, contexto. Se guarda al salir del campo.</p>
                    <Textarea
                      value={dayNoteDraft}
                      onChange={(e) => setDayNoteDraft(e.target.value)}
                      onBlur={persistDayNote}
                      disabled={readOnly}
                      placeholder={"• Cerrar propuesta X\n• Llamar a…\n• Preparar demo…"}
                      className="mt-3 min-h-[140px] resize-y border-white/10 bg-black/30 text-[15px] leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-zinc-400">Citas</h2>
                    <span className="text-xs text-muted-foreground">{dayItems.length} en este día</span>
                  </div>
                  {!hasFiltered ? (
                    <p className="rounded-lg border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
                      No hay citas con los filtros actuales. Ajusta filtros o crea una cita.
                    </p>
                  ) : dayItems.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
                      Nada agendado este día. Usa la nota de arriba para planear y «+ Cita» cuando toque.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dayItems.map((a) => (
                        <NotionAppointmentBlock
                          key={a.id}
                          a={a}
                          label={resolveName(a)}
                          selected={selected?.id === a.id}
                          onSelect={() => setSelected(a)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Semana</p>
                <div className="flex flex-col gap-1.5">
                  {week.map((day) => {
                    const n = appointmentsForDate(day).length;
                    const active = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "border-primary/50 bg-primary/10 text-zinc-50"
                            : "border-white/[0.06] bg-zinc-950/50 text-muted-foreground hover:border-white/10 hover:bg-zinc-900/50"
                        }`}
                      >
                        <span className="capitalize">{format(day, "EEE d", { locale: es })}</span>
                        <span className={`tabular-nums text-xs ${n ? "text-zinc-300" : "text-muted-foreground/60"}`}>{n}</span>
                      </button>
                    );
                  })}
                </div>

                <AppointmentDetailPanel
                  selected={selected}
                  resolveName={resolveName}
                  readOnly={readOnly}
                  updateAppointment={updateAppointment}
                  deleteAppointment={deleteAppointment}
                  onDeleted={() => setSelected(null)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="semana" className="mt-6 focus-visible:outline-none">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-7">
              {week.map((day) => {
                const items = appointmentsForDate(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`flex min-h-[220px] flex-col rounded-xl border p-3 ${
                      isSameDay(day, selectedDate) ? "border-primary/40 bg-primary/[0.04]" : "border-white/[0.06] bg-zinc-950/40"
                    }`}
                  >
                    <button type="button" className="mb-2 text-left" onClick={() => { setSelectedDate(day); setView("dia"); }}>
                      <p className="text-xs font-medium uppercase text-muted-foreground">{format(day, "EEE", { locale: es })}</p>
                      <p className="text-lg font-semibold text-zinc-100">{format(day, "d")}</p>
                      {isToday(day) ? <span className="text-[10px] font-medium text-primary">Hoy</span> : null}
                    </button>
                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                      {items.map((a) => (
                        <NotionAppointmentBlock key={a.id} a={a} compact label={resolveName(a)} selected={selected?.id === a.id} onSelect={() => setSelected(a)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 max-w-md">
              <AppointmentDetailPanel
                selected={selected}
                resolveName={resolveName}
                readOnly={readOnly}
                updateAppointment={updateAppointment}
                deleteAppointment={deleteAppointment}
                onDeleted={() => setSelected(null)}
              />
            </div>
          </TabsContent>

          <TabsContent value="mes" className="mt-6 focus-visible:outline-none">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium capitalize text-zinc-200">{format(selectedDate, "MMMM yyyy", { locale: es })}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setSelectedDate((d) => addDays(startOfMonth(d), -1))}>
                  ←
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate((d) => addDays(endOfMonth(d), 1))}>
                  →
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-medium uppercase text-muted-foreground">
                  {d}
                </div>
              ))}
              {monthDays.map((day) => {
                const dayItems = appointmentsForDate(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`min-h-[72px] rounded-lg border p-2 text-left transition ${
                      isSameMonth(day, selectedDate) ? "border-white/[0.06] bg-zinc-950/50 hover:border-white/12" : "border-transparent opacity-40"
                    } ${isSameDay(day, selectedDate) ? "ring-1 ring-primary/50" : ""}`}
                    onClick={() => { setSelectedDate(day); setView("dia"); }}
                  >
                    <p className="text-xs text-muted-foreground">{format(day, "d")}</p>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {dayItems.slice(0, 3).map((i) => (
                        <span key={i.id} className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                      ))}
                    </div>
                    {dayItems.length > 3 ? <p className="mt-0.5 text-[9px] text-muted-foreground">+{dayItems.length - 3}</p> : null}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="lista" className="mt-6 focus-visible:outline-none">
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="grid grid-cols-[1fr_72px_100px_1fr_88px_1fr] gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Fecha</span>
                <span>Hora</span>
                <span>Tipo</span>
                <span>Relación</span>
                <span>Estado</span>
                <span>Siguiente</span>
              </div>
              {[...appointments]
                .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || timeSortKey(a.time) - timeSortKey(b.time))
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="grid w-full grid-cols-[1fr_72px_100px_1fr_88px_1fr] gap-2 border-b border-white/[0.04] px-4 py-3 text-left text-sm last:border-0 hover:bg-zinc-900/60"
                    onClick={() => setSelected(a)}
                  >
                    <span className="text-muted-foreground">{format(parseISO(a.date), "d MMM yy", { locale: es })}</span>
                    <span className="tabular-nums">{a.time}</span>
                    <span className="truncate text-xs">{APPOINTMENT_TYPE_LABELS[a.type]}</span>
                    <span className="truncate">{resolveName(a)}</span>
                    <span className={`text-xs ${STATUS_MUTED[a.status]}`}>{APPOINTMENT_STATUS_LABELS[a.status]}</span>
                    <span className="truncate text-xs text-muted-foreground">{a.nextAction ?? "—"}</span>
                  </button>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function NotionAppointmentBlock({
  a,
  label,
  onSelect,
  compact,
  selected,
}: {
  a: CrmAppointment;
  label: string;
  onSelect: () => void;
  compact?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-lg border border-l-[3px] bg-zinc-900/40 text-left transition hover:bg-zinc-900/70 ${TYPE_ACCENT[a.type]} ${
        selected ? "border-white/15 ring-1 ring-primary/35" : "border-white/[0.06]"
      } ${compact ? "p-2.5" : "p-3.5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-medium text-zinc-100 ${compact ? "text-xs" : "text-sm"}`}>
            <span className="tabular-nums text-muted-foreground">{a.time}</span>
            {!compact ? <span className="text-muted-foreground"> · </span> : " "}
            <span>{a.title}</span>
          </p>
          <p className={`mt-1 text-muted-foreground ${compact ? "text-[11px]" : "text-xs"}`}>{label}</p>
          {a.nextAction && !compact ? <p className="mt-2 line-clamp-2 text-xs text-zinc-500">→ {a.nextAction}</p> : null}
        </div>
        <Badge variant="outline" className={`shrink-0 border text-[10px] font-normal ${TYPE_BADGE[a.type]}`}>
          {APPOINTMENT_TYPE_LABELS[a.type]}
        </Badge>
      </div>
      <p className={`mt-2 text-[11px] ${STATUS_MUTED[a.status]}`}>{APPOINTMENT_STATUS_LABELS[a.status]}</p>
    </button>
  );
}

function AppointmentDetailPanel({
  selected,
  resolveName,
  readOnly,
  updateAppointment,
  deleteAppointment,
  onDeleted,
}: {
  selected: CrmAppointment | null;
  resolveName: (a: CrmAppointment) => string;
  readOnly: boolean;
  updateAppointment: (id: string, patch: Partial<CrmAppointment>) => void;
  deleteAppointment: (id: string) => void;
  onDeleted: () => void;
}) {
  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
        Elige una cita para ver detalle y acciones.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/60 p-4">
      <p className="font-semibold leading-snug text-zinc-50">{selected.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {format(parseISO(selected.date), "EEEE d MMM", { locale: es })} · {selected.time}
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tipo</dt>
          <dd className="mt-0.5 text-zinc-200">{APPOINTMENT_TYPE_LABELS[selected.type]}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Relación</dt>
          <dd className="mt-0.5 text-zinc-200">{resolveName(selected)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Estado</dt>
          <dd className={`mt-0.5 ${STATUS_MUTED[selected.status]}`}>{APPOINTMENT_STATUS_LABELS[selected.status]}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Notas</dt>
          <dd className="mt-0.5 whitespace-pre-wrap text-zinc-400">{selected.notes ?? "—"}</dd>
        </div>
      </dl>
      {!readOnly ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="bg-primary text-black" onClick={() => updateAppointment(selected.id, { status: "COMPLETADA" })}>
            Completada
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateAppointment(selected.id, { status: "NO_ASISTIO" })}>
            No asistió
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateAppointment(selected.id, { status: "CANCELADA" })}>
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              deleteAppointment(selected.id);
              onDeleted();
            }}
          >
            Eliminar
          </Button>
        </div>
      ) : null}
      <div className="mt-3">
        <CopyButton text={`Cita: ${selected.title} el ${selected.date} ${selected.time}`} />
      </div>
    </div>
  );
}

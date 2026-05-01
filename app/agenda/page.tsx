"use client";

import { useEffect, useMemo, useState } from "react";
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
import { fetchJsonSafe } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

type Related = { id: string; businessName: string; contactName?: string; phone?: string; service?: string; city?: string };
type Appointment = {
  id: string;
  title: string;
  type: "DEMO" | "LLAMADA" | "SEGUIMIENTO" | "REVISION_MENSUAL" | "COBRO";
  date: string;
  time: string;
  duration: number;
  status: "PENDIENTE" | "COMPLETADA" | "CANCELADA" | "REAGENDADA";
  priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  notes?: string | null;
  nextAction?: string | null;
  reminder: "NONE" | "MIN_15" | "HOUR_1" | "DAY_1";
  meetingLink?: string | null;
  location?: string | null;
  leadId?: string | null;
  clientId?: string | null;
  lead?: Related | null;
  client?: Related | null;
};

const TYPE_COLORS: Record<Appointment["type"], string> = {
  DEMO: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  LLAMADA: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SEGUIMIENTO: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  REVISION_MENSUAL: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  COBRO: "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_COLORS: Record<Appointment["status"], string> = {
  PENDIENTE: "text-zinc-200",
  COMPLETADA: "text-emerald-300",
  CANCELADA: "text-red-300",
  REAGENDADA: "text-amber-300",
};

function quickMessage(item: Appointment) {
  const city = item.lead?.city ?? item.client?.city ?? "tu ciudad";
  if (item.type === "DEMO") return `Que onda, bro. Te confirmo la demo de ClientBoost para hoy a las ${item.time}. Te voy a mostrar como podemos ayudarte a conseguir mas llamadas desde Google.`;
  if (item.type === "SEGUIMIENTO") return `Que onda, bro. Te escribo para dar seguimiento a lo que vimos de tu negocio en ${city}. Lo revisamos rapido?`;
  if (item.type === "COBRO") return "Hola, te recuerdo que esta pendiente el pago de tu mensualidad de ClientBoost. Quedo atento para dejar todo activo y en seguimiento.";
  return `Confirmamos cita ${item.type.toLowerCase()} para hoy a las ${item.time}.`;
}

function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Related[]>([]);
  const [clients, setClients] = useState<Related[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [view, setView] = useState<"dia" | "semana" | "mes" | "lista">("semana");
  const [filters, setFilters] = useState({ type: "ALL", status: "ALL", relation: "ALL", priority: "ALL" });

  const load = async (extra?: Partial<typeof filters>) => {
    const f = { ...filters, ...extra };
    const qs = new URLSearchParams();
    if (f.type !== "ALL") qs.set("type", f.type);
    if (f.status !== "ALL") qs.set("status", f.status);
    if (f.relation !== "ALL") qs.set("relation", f.relation);
    if (f.priority !== "ALL") qs.set("priority", f.priority);
    setFilters(f);
    const [apps, leadsData, clientsData] = await Promise.all([
      fetchJsonSafe<Appointment[]>(`/api/appointments?${qs.toString()}`, []),
      fetchJsonSafe<Related[]>("/api/leads", []),
      fetchJsonSafe<Related[]>("/api/clients", []),
    ]);
    setAppointments(apps);
    setLeads(leadsData);
    setClients(clientsData);
  };

  useEffect(() => {
    load();
    if (window.innerWidth < 768) setView("lista");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const actionPatch = async (id: string, payload: Record<string, unknown>) => {
    await fetch(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    await load();
  };

  const createTaskFromAppointment = async () => {
    if (!selected) return;
    await fetch("/api/tasks", { method: "POST", body: JSON.stringify({ title: `Seguimiento ${selected.title}`, description: selected.nextAction || "Accion posterior a cita", status: "PENDIENTE", priority: selected.priority }) });
  };

  const completeDecision = async (decision: string) => {
    if (!selected) return;
    if (decision === "AGENDAR_SEGUIMIENTO") {
      const nextDate = addDays(parseISO(selected.date), 2);
      await fetch("/api/appointments", { method: "POST", body: JSON.stringify({ ...selected, id: undefined, title: `Follow-up ${selected.title}`, type: "SEGUIMIENTO", date: format(nextDate, "yyyy-MM-dd"), time: "10:00", status: "PENDIENTE" }) });
    }
    if (decision === "MOVER_PIPELINE" && selected.leadId) {
      await fetch(`/api/leads/${selected.leadId}`, { method: "PATCH", body: JSON.stringify({ stage: "DEMO_REALIZADA" }) });
    }
    if (decision === "CONVERTIR_CLIENTE" && selected.lead) {
      await fetch("/api/clients", { method: "POST", body: JSON.stringify({ businessName: selected.lead.businessName, contactName: selected.lead.contactName || selected.lead.businessName, phone: selected.lead.phone || "000", service: selected.lead.service || "General", city: selected.lead.city || "N/A", state: "TX", plan: "Plan base", setupFee: 400, monthlyFee: 200, status: "ACTIVO", startDate: new Date().toISOString().split("T")[0] }) });
    }
    if (decision === "PROPUESTA" && selected.leadId) {
      await fetch(`/api/leads/${selected.leadId}`, { method: "PATCH", body: JSON.stringify({ stage: "PROPUESTA_ENVIADA" }) });
    }
    if (decision === "PERDIDO" && selected.leadId) {
      await fetch(`/api/leads/${selected.leadId}`, { method: "PATCH", body: JSON.stringify({ stage: "CERRADO_PERDIDO" }) });
    }
    if (decision === "CREAR_TAREA") {
      await createTaskFromAppointment();
    }
    if (decision === "REGISTRAR_INGRESO" && selected.clientId) {
      await fetch("/api/finance", { method: "POST", body: JSON.stringify({ type: "INCOME", category: "Mensualidad", amount: 200, concept: `Cierre ${selected.title}`, date: new Date().toISOString().split("T")[0], clientId: selected.clientId }) });
    }
    await load();
  };

  return (
    <AppShell title="Agenda">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Agenda</h1>
            <p className="text-sm text-muted-foreground">Organiza demos, llamadas, seguimientos y revisiones para no perder ningun prospecto.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Crear cita</DialogTrigger>
              <DialogContent className="bg-card border-border max-w-3xl">
                <DialogHeader><DialogTitle>Nueva cita</DialogTitle></DialogHeader>
                <AppointmentForm onSaved={load} leads={leads} clients={clients} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => { setSelectedDate(new Date()); }}>Hoy</Button>
            <Button variant="outline" onClick={() => { setSelectedDate(new Date()); setView("semana"); }}>Esta semana</Button>
            <Button variant="outline" onClick={() => load({ status: "PENDIENTE" })}>Pendientes</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-3">
          <Select value={filters.type} onValueChange={(v) => load({ type: v })}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos los tipos</SelectItem><SelectItem value="DEMO">Demo</SelectItem><SelectItem value="LLAMADA">Llamada</SelectItem><SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem><SelectItem value="REVISION_MENSUAL">Revision mensual</SelectItem><SelectItem value="COBRO">Cobro</SelectItem></SelectContent></Select>
          <Select value={filters.status} onValueChange={(v) => load({ status: v })}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos los estados</SelectItem><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem><SelectItem value="CANCELADA">Cancelada</SelectItem><SelectItem value="REAGENDADA">Reagendada</SelectItem></SelectContent></Select>
          <Select value={filters.relation} onValueChange={(v) => load({ relation: v })}><SelectTrigger><SelectValue placeholder="Relacion" /></SelectTrigger><SelectContent><SelectItem value="ALL">Lead o cliente</SelectItem><SelectItem value="LEAD">Lead</SelectItem><SelectItem value="CLIENTE">Cliente</SelectItem></SelectContent></Select>
          <Select value={filters.priority} onValueChange={(v) => load({ priority: v })}><SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todas prioridades</SelectItem><SelectItem value="BAJA">Baja</SelectItem><SelectItem value="MEDIA">Media</SelectItem><SelectItem value="ALTA">Alta</SelectItem><SelectItem value="URGENTE">Urgente</SelectItem></SelectContent></Select>
        </div>

        {!appointments.length ? (
          <Card className="bg-card border-border">
            <CardContent className="py-10 space-y-5">
              <div className="grid grid-cols-7 gap-2 max-w-3xl">
                {weekDays(new Date()).map((d) => <div key={d.toISOString()} className="h-16 rounded-md border border-border bg-[#121212] p-2 text-xs">{format(d, "EEE d", { locale: es })}</div>)}
              </div>
              <p className="text-zinc-200">Agenda tu primera demo para empezar a mover el pipeline.</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Crear demo con lead caliente</Badge>
                <Badge variant="outline">Programar follow-up</Badge>
                <Badge variant="outline">Revision mensual con cliente</Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <div>
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                <TabsList>
                  <TabsTrigger value="dia">Dia</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mes</TabsTrigger>
                  <TabsTrigger value="lista">Lista</TabsTrigger>
                </TabsList>

                <TabsContent value="dia" className="mt-4">
                  <Card className="bg-card border-border"><CardHeader><CardTitle>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</CardTitle></CardHeader><CardContent className="space-y-2">{appointmentsForDate(selectedDate).map((a) => <AppointmentCard key={a.id} a={a} onClick={() => setSelected(a)} />)}</CardContent></Card>
                </TabsContent>

                <TabsContent value="semana" className="mt-4">
                  <div className="grid md:grid-cols-2 2xl:grid-cols-7 gap-3">
                    {week.map((day) => {
                      const dayItems = appointmentsForDate(day);
                      return (
                        <Card key={day.toISOString()} className="bg-card border-border min-h-52">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span>{format(day, "EEEE", { locale: es })}</span>
                              <span className="text-muted-foreground">{format(day, "d")}</span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{dayItems.length} citas</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {dayItems.map((a) => <AppointmentCard key={a.id} a={a} compact onClick={() => setSelected(a)} />)}
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
                        <button key={day.toISOString()} className={`rounded-lg border border-border min-h-24 text-left p-2 bg-[#101010] hover:border-primary/60 transition ${isSameMonth(day, selectedDate) ? "" : "opacity-50"}`} onClick={() => setSelectedDate(day)}>
                          <p className="text-xs text-muted-foreground">{format(day, "d")}</p>
                          <div className="mt-2 space-y-1">
                            {dayItems.slice(0, 2).map((i) => <div key={i.id} className="h-1.5 rounded bg-primary/70" />)}
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
                        <span>Fecha</span><span>Hora</span><span>Tipo</span><span>Lead/Cliente</span><span>Estado</span><span>Proxima accion</span>
                      </div>
                      {appointments.map((a) => (
                        <button key={a.id} className="w-full grid grid-cols-6 px-4 py-3 text-sm border-b border-border hover:bg-[#141414] text-left" onClick={() => setSelected(a)}>
                          <span>{format(parseISO(a.date), "dd/MM/yyyy")}</span>
                          <span>{a.time}</span>
                          <span>{a.type.replaceAll("_", " ")}</span>
                          <span>{a.client?.businessName ?? a.lead?.businessName ?? "-"}</span>
                          <span className={STATUS_COLORS[a.status]}>{a.status}</span>
                          <span>{a.nextAction ?? "-"}</span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <Card className="bg-card border-border sticky top-20 h-fit">
              <CardHeader><CardTitle>Detalle de cita</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!selected ? (
                  <>
                    <p className="text-sm text-muted-foreground">Selecciona una cita para ver informacion completa.</p>
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Citas del dia seleccionado</p>
                      {appointmentsForDate(selectedDate).length ? appointmentsForDate(selectedDate).map((a) => (
                        <button key={a.id} className="w-full rounded-md border border-border bg-[#111] px-3 py-2 text-left text-sm hover:border-primary/50" onClick={() => setSelected(a)}>
                          {a.time} - {a.title}
                        </button>
                      )) : <p className="text-xs text-muted-foreground">Sin citas este dia.</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold">{selected.title}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(selected.date), "EEEE d MMM", { locale: es })} - {selected.time}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={TYPE_COLORS[selected.type]}>{selected.type.replaceAll("_", " ")}</Badge>
                      <Badge variant="outline">{selected.priority}</Badge>
                      <Badge variant="outline" className={STATUS_COLORS[selected.status]}>{selected.status}</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Lead/Cliente:</span> {selected.client?.businessName ?? selected.lead?.businessName ?? "Sin relacion"}</p>
                      <p><span className="text-muted-foreground">Telefono:</span> {selected.client?.phone ?? selected.lead?.phone ?? "-"}</p>
                      <p><span className="text-muted-foreground">Servicio:</span> {selected.client?.service ?? selected.lead?.service ?? "-"}</p>
                      <p><span className="text-muted-foreground">Ciudad:</span> {selected.client?.city ?? selected.lead?.city ?? "-"}</p>
                      <p><span className="text-muted-foreground">Proxima accion:</span> {selected.nextAction ?? "-"}</p>
                      <p><span className="text-muted-foreground">Notas:</span> {selected.notes ?? "Sin notas"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => actionPatch(selected.id, { status: "COMPLETADA" })}>Marcar completada</Button>
                      <Button size="sm" variant="outline" onClick={() => actionPatch(selected.id, { status: "REAGENDADA" })}>Reagendar</Button>
                      <Button size="sm" variant="outline" onClick={() => actionPatch(selected.id, { status: "CANCELADA" })}>Cancelar</Button>
                      <Button size="sm" variant="outline" onClick={createTaskFromAppointment}>Crear tarea</Button>
                      <Button size="sm" variant="outline" onClick={() => { if (selected.leadId) window.location.href = "/leads"; if (selected.clientId) window.location.href = "/clients"; }}>Ir al lead/cliente</Button>
                      <Button size="sm" variant="outline" onClick={() => actionPatch(selected.id, { notes: `${selected.notes || ""}\nNota: llamada registrada.` })}>Registrar nota</Button>
                      <CopyButton text={quickMessage(selected)} />
                    </div>

                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Despues de completar, que sigue?</p>
                      <div className="grid gap-2">
                        <DecisionButton label="Agendar seguimiento" onClick={() => completeDecision("AGENDAR_SEGUIMIENTO")} />
                        <DecisionButton label="Mover lead en pipeline" onClick={() => completeDecision("MOVER_PIPELINE")} />
                        <DecisionButton label="Convertir lead en cliente" onClick={() => completeDecision("CONVERTIR_CLIENTE")} />
                        <DecisionButton label="Registrar propuesta enviada" onClick={() => completeDecision("PROPUESTA")} />
                        <DecisionButton label="Marcar como perdido" onClick={() => completeDecision("PERDIDO")} />
                        <DecisionButton label="Crear tarea" onClick={() => completeDecision("CREAR_TAREA")} />
                        <DecisionButton label="Registrar ingreso" onClick={() => completeDecision("REGISTRAR_INGRESO")} />
                      </div>
                    </div>
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

function DecisionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="w-full rounded-md border border-border bg-[#111] px-3 py-2 text-left text-sm hover:border-primary/50 hover:bg-[#151515] transition">{label}</button>;
}

function AppointmentCard({ a, onClick, compact = false }: { a: Appointment; onClick: () => void; compact?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full rounded-lg border border-border bg-[#121212] hover:bg-[#171717] transition text-left ${compact ? "p-2" : "p-3"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>{a.time} - {a.title}</p>
        <Badge className={TYPE_COLORS[a.type]}>{a.type.replaceAll("_", " ")}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{a.client?.businessName ?? a.lead?.businessName ?? "Sin relacion"} - {a.client?.city ?? a.lead?.city ?? "N/A"}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className={STATUS_COLORS[a.status]}>{a.status}</span>
        <span className="text-muted-foreground">{a.priority}</span>
        <span className="text-muted-foreground">{a.nextAction || "Sin proxima accion"}</span>
      </div>
    </button>
  );
}

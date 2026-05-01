"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadForm } from "@/components/forms/lead-form";
import { TaskForm } from "@/components/forms/task-form";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { EmptyState } from "@/components/ui/empty-state";
import { useCrm } from "@/components/providers/crm-provider";
import { filterLeadsForUser, isReadOnly } from "@/lib/crm/permissions";
import {
  LEAD_SECTORS,
  LEAD_SECTOR_LABELS,
  LEAD_SOURCES,
  LEAD_STAGES,
  PRIORITIES,
  type LeadSector,
  type LeadSource,
  type LeadStage,
  type Priority,
} from "@/lib/crm/types";

const stageOrder = LEAD_STAGES;

const priorityClass: Record<Priority, string> = {
  BAJA: "text-zinc-300 border-zinc-600",
  MEDIA: "text-sky-300 border-sky-600/50",
  ALTA: "text-amber-300 border-amber-600/50",
  URGENTE: "text-red-300 border-red-600/50",
};

export default function LeadsPage() {
  const {
    state,
    currentSeller,
    updateLead,
    deleteLead,
    moveLeadStage,
    addLeadInternalNote,
    addContactHistory,
    convertLeadToClient,
  } = useCrm();
  const readOnly = isReadOnly(currentSeller);

  const leads = useMemo(() => filterLeadsForUser(state.leads, state), [state]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => (selectedId ? state.leads.find((l) => l.id === selectedId) ?? null : null), [state.leads, selectedId]);
  const [query, setQuery] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [contactDraft, setContactDraft] = useState({ channel: "WHATSAPP", note: "" });
  const [filters, setFilters] = useState({
    stage: "ALL",
    source: "ALL",
    priority: "ALL",
    seller: "ALL",
    sector: "ALL",
    dateFrom: "",
  });

  const sellers = state.sellers.filter((s) => s.role === "VENDEDOR" || s.role === "ADMIN");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const seller = lead.assignedSellerId ? state.sellers.find((s) => s.id === lead.assignedSellerId)?.name ?? "" : "";
      const sectorLabel = lead.sector ? LEAD_SECTOR_LABELS[lead.sector] : "";
      const text =
        `${lead.contactName} ${lead.businessName} ${lead.phone} ${lead.email ?? ""} ${lead.city} ${lead.service} ${sectorLabel} ${seller}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      const matchStage = filters.stage === "ALL" || lead.stage === filters.stage;
      const matchSource = filters.source === "ALL" || lead.source === filters.source;
      const matchPri = filters.priority === "ALL" || lead.priority === filters.priority;
      const matchSeller =
        filters.seller === "ALL" ||
        (filters.seller === "__unassigned" ? !lead.assignedSellerId : lead.assignedSellerId === filters.seller);
      const matchSector =
        filters.sector === "ALL" ||
        (filters.sector === "__none" ? !lead.sector : lead.sector === (filters.sector as LeadSector));
      const matchDate =
        !filters.dateFrom || !lead.createdAt || parseISO(lead.createdAt) >= parseISO(filters.dateFrom + "T00:00:00");
      return matchQuery && matchStage && matchSource && matchPri && matchSeller && matchSector && matchDate;
    });
  }, [leads, query, filters, state.sellers]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    const urgent = filtered.filter((l) => l.priority === "URGENTE").length;
    const demos = filtered.filter((l) => l.stage === "DEMO_AGENDADA").length;
    const valor = filtered.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    return { total, urgent, demos, valor };
  }, [filtered]);

  const relLeads = leads.map((l) => ({ id: l.id, businessName: l.businessName }));
  const relClients = state.clients.map((c) => ({ id: c.id, businessName: c.businessName }));

  return (
    <AppShell title="Leads">
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads CRM</h1>
            <p className="text-sm text-muted-foreground">Captura, asigna y acompaña cada oportunidad hasta el cierre.</p>
          </div>
          {!readOnly ? (
            <Dialog>
              <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                Nuevo lead
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Nuevo lead</DialogTitle>
                </DialogHeader>
                <LeadForm />
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Leads visibles" value={String(metrics.total)} helper="Según filtros y rol" />
          <Metric title="Prioridad urgente" value={String(metrics.urgent)} helper="Requieren atención" />
          <Metric title="Demos agendadas" value={String(metrics.demos)} helper="En etapa demo" />
          <Metric title="Valor estimado" value={`$${metrics.valor.toFixed(0)}`} helper="Suma visible" />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-5 grid md:grid-cols-2 xl:grid-cols-7 gap-3">
            <Input
              placeholder="Buscar: nombre, negocio, teléfono, ciudad, servicio, sector, fuente o vendedor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="xl:col-span-2"
            />
            <Select value={filters.stage} onValueChange={(v) => setFilters((p) => ({ ...p, stage: v ?? "ALL" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las etapas</SelectItem>
                {stageOrder.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.source} onValueChange={(v) => setFilters((p) => ({ ...p, source: v ?? "ALL" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las fuentes</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(v) => setFilters((p) => ({ ...p, priority: v ?? "ALL" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.seller} onValueChange={(v) => setFilters((p) => ({ ...p, seller: v ?? "ALL" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="__unassigned">Sin asignar</SelectItem>
                {sellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.sector} onValueChange={(v) => setFilters((p) => ({ ...p, sector: v ?? "ALL" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los sectores</SelectItem>
                <SelectItem value="__none">Sin sector</SelectItem>
                {LEAD_SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_SECTOR_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          </CardContent>
        </Card>

        {!filtered.length ? (
          <EmptyState
            title="Sin resultados"
            description="Ajusta filtros o crea un lead para poblar el embudo comercial."
            cta="Nuevo lead"
          />
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_400px] gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Listado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[72vh] overflow-y-auto pr-1">
                {filtered.map((lead) => (
                  <div
                    key={lead.id}
                    className={`rounded-lg border px-3 py-3 transition ${selectedId === lead.id ? "border-primary/70 bg-[#141414]" : "border-border bg-[#101010]"}`}
                  >
                    <button type="button" className="w-full text-left" onClick={() => setSelectedId(lead.id)}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{lead.businessName}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.contactName} · {lead.city}
                          </p>
                        </div>
                        <Badge variant="outline" className={priorityClass[lead.priority]}>
                          {lead.priority}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{lead.stage.replaceAll("_", " ")}</span>
                        <span>•</span>
                        <span>{lead.source}</span>
                        <span>•</span>
                        <span>{lead.service}</span>
                        {lead.sector ? (
                          <>
                            <span>•</span>
                            <span>{LEAD_SECTOR_LABELS[lead.sector]}</span>
                          </>
                        ) : null}
                        <span>•</span>
                        <span>{lead.estimatedValue ? `$${lead.estimatedValue}` : "Sin valor"}</span>
                      </div>
                    </button>
                    {!readOnly ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => moveLeadStage(lead.id, nextStage(lead.stage))}>
                          Avanzar etapa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            deleteLead(lead.id);
                            if (selectedId === lead.id) setSelectedId(null);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border xl:sticky xl:top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-base">Detalle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Selecciona un lead para gestionarlo.</p>
                ) : readOnly ? (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-zinc-200">{selected.businessName}</p>
                    <p>
                      {selected.contactName} · {selected.phone}
                    </p>
                    <p>Etapa: {selected.stage.replaceAll("_", " ")}</p>
                    {selected.sector ? <p>Sector: {LEAD_SECTOR_LABELS[selected.sector]}</p> : null}
                    <p className="text-xs pt-2">Vista solo lectura (rol Viewer).</p>
                  </div>
                ) : (
                  <>
                    <Input
                      value={selected.businessName}
                      onChange={(e) => updateLead(selected.id, { businessName: e.target.value })}
                      placeholder="Negocio"
                    />
                    <Input
                      value={selected.contactName}
                      onChange={(e) => updateLead(selected.id, { contactName: e.target.value })}
                      placeholder="Contacto"
                    />
                    <Input value={selected.phone} onChange={(e) => updateLead(selected.id, { phone: e.target.value })} placeholder="Teléfono" />
                    <Input
                      value={selected.email ?? ""}
                      onChange={(e) => updateLead(selected.id, { email: e.target.value || null })}
                      placeholder="Email"
                    />
                    <Input value={selected.service} onChange={(e) => updateLead(selected.id, { service: e.target.value })} placeholder="Servicio" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={selected.city} onChange={(e) => updateLead(selected.id, { city: e.target.value })} placeholder="Ciudad" />
                      <Select
                        value={selected.sector ?? "__none"}
                        onValueChange={(v) =>
                          updateLead(selected.id, { sector: v === "__none" ? null : (v as LeadSector) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Sin especificar</SelectItem>
                          {LEAD_SECTORS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {LEAD_SECTOR_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={selected.source}
                        onValueChange={(v) => updateLead(selected.id, { source: (v ?? selected.source) as LeadSource })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selected.priority}
                        onValueChange={(v) => updateLead(selected.id, { priority: (v ?? selected.priority) as Priority })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Select
                      value={selected.stage}
                      onValueChange={(v) => updateLead(selected.id, { stage: (v ?? selected.stage) as LeadStage })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOrder.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selected.assignedSellerId ?? "__none"}
                      onValueChange={(v) =>
                        updateLead(selected.id, { assignedSellerId: v === "__none" ? null : (v ?? null) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Sin asignar</SelectItem>
                        {sellers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={selected.estimatedValue ?? ""}
                      onChange={(e) =>
                        updateLead(selected.id, { estimatedValue: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      placeholder="Valor estimado"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={selected.lastContactAt ? selected.lastContactAt.slice(0, 10) : ""}
                        onChange={(e) =>
                          updateLead(selected.id, {
                            lastContactAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                          })
                        }
                      />
                      <Input
                        type="date"
                        value={selected.nextFollowUpAt ? selected.nextFollowUpAt.slice(0, 10) : ""}
                        onChange={(e) =>
                          updateLead(selected.id, {
                            nextFollowUpAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                          })
                        }
                      />
                    </div>
                    <Input
                      value={selected.nextAction ?? ""}
                      onChange={(e) => updateLead(selected.id, { nextAction: e.target.value || null })}
                      placeholder="Próxima acción"
                    />
                    {selected.stage === "CERRADO_PERDIDO" ? (
                      <Input
                        value={selected.lossReason ?? ""}
                        onChange={(e) => updateLead(selected.id, { lossReason: e.target.value || null })}
                        placeholder="Motivo de pérdida"
                      />
                    ) : null}
                    <Textarea
                      value={selected.notes ?? ""}
                      onChange={(e) => updateLead(selected.id, { notes: e.target.value })}
                      placeholder="Notas generales"
                    />

                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Notas internas</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selected.internalNotes.map((n) => (
                          <div key={n.id} className="text-xs rounded-md border border-border/60 p-2 bg-[#111]">
                            {n.content}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Nueva nota interna" className="min-h-[60px]" />
                        <Button
                          type="button"
                          className="shrink-0 bg-primary text-black"
                          onClick={() => {
                            if (!noteDraft.trim() || !selected) return;
                            addLeadInternalNote(selected.id, noteDraft.trim());
                            setNoteDraft("");
                          }}
                        >
                          Añadir
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Historial de contacto</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selected.contactHistory.map((c) => (
                          <div key={c.id} className="text-xs rounded-md border border-border/60 p-2 bg-[#111]">
                            <span className="text-primary">{c.channel}</span> · {format(parseISO(c.createdAt), "d MMM HH:mm", { locale: es })}
                            <p className="mt-1 text-zinc-200">{c.note}</p>
                          </div>
                        ))}
                      </div>
                      <Select value={contactDraft.channel} onValueChange={(v) => setContactDraft((d) => ({ ...d, channel: v ?? d.channel }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="LLAMADA">Llamada</SelectItem>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={contactDraft.note}
                        onChange={(e) => setContactDraft((d) => ({ ...d, note: e.target.value }))}
                        placeholder="Qué pasó en el contacto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!contactDraft.note.trim() || !selected) return;
                          addContactHistory(selected.id, { channel: contactDraft.channel, note: contactDraft.note.trim() });
                          setContactDraft({ channel: contactDraft.channel, note: "" });
                        }}
                      >
                        Registrar contacto
                      </Button>
                    </div>

                    <div className="grid gap-2 border-t border-border pt-3">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Dialog>
                          <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm hover:bg-zinc-900">
                            Agendar demo
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Demo desde lead</DialogTitle>
                            </DialogHeader>
                            <AppointmentForm leads={relLeads} clients={relClients} initialLeadId={selected.id} />
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm hover:bg-zinc-900">
                            Crear tarea
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Tarea ligada al lead</DialogTitle>
                            </DialogHeader>
                            <TaskForm key={selected.id} initialLeadId={selected.id} />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          convertLeadToClient(selected.id);
                        }}
                      >
                        Convertir en cliente
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creado: {format(parseISO(selected.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                    </p>
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

function nextStage(stage: LeadStage): LeadStage {
  const i = stageOrder.indexOf(stage);
  return stageOrder[Math.min(i + 1, stageOrder.length - 1)];
}

function Metric({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{helper}</p>
      </CardContent>
    </Card>
  );
}

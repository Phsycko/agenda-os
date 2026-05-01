"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
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
import { fetchJsonSafe } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

type Lead = {
  id: string;
  contactName: string;
  businessName: string;
  phone: string;
  email?: string | null;
  service: string;
  city: string;
  state: string;
  source: "FACEBOOK" | "INSTAGRAM" | "GOOGLE_MAPS" | "REFERIDO" | "WEB" | "OTRO";
  temperature: "FRIO" | "TIBIO" | "CALIENTE";
  stage:
    | "NUEVO"
    | "CONTACTADO"
    | "INTERESADO"
    | "DEMO_AGENDADA"
    | "DEMO_REALIZADA"
    | "PROPUESTA_ENVIADA"
    | "CERRADO_GANADO"
    | "CERRADO_PERDIDO";
  estimatedValue?: number | null;
  notes?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  createdAt: string;
};

const stageOrder: Lead["stage"][] = ["NUEVO", "CONTACTADO", "INTERESADO", "DEMO_AGENDADA", "DEMO_REALIZADA", "PROPUESTA_ENVIADA", "CERRADO_GANADO", "CERRADO_PERDIDO"];

const tempClass: Record<Lead["temperature"], string> = {
  FRIO: "text-zinc-300 border-zinc-600",
  TIBIO: "text-amber-300 border-amber-600/60",
  CALIENTE: "text-emerald-300 border-emerald-600/60",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ stage: "ALL", source: "ALL", temp: "ALL", city: "ALL" });

  const load = async () => {
    const data = await fetchJsonSafe<Lead[]>("/api/leads", []);
    setLeads(data);
    if (data.length && !selected) setSelected(data[0]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(() => ["ALL", ...new Set(leads.map((l) => l.city || "Sin ciudad"))], [leads]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const text = `${lead.contactName} ${lead.businessName} ${lead.phone} ${lead.city} ${lead.service}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      const matchStage = filters.stage === "ALL" || lead.stage === filters.stage;
      const matchSource = filters.source === "ALL" || lead.source === filters.source;
      const matchTemp = filters.temp === "ALL" || lead.temperature === filters.temp;
      const matchCity = filters.city === "ALL" || (lead.city || "Sin ciudad") === filters.city;
      return matchQuery && matchStage && matchSource && matchTemp && matchCity;
    });
  }, [leads, query, filters]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    const calientes = filtered.filter((l) => l.temperature === "CALIENTE").length;
    const demos = filtered.filter((l) => l.stage === "DEMO_AGENDADA").length;
    const valor = filtered.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    return { total, calientes, demos, valor };
  }, [filtered]);

  const patchLead = async (id: string, payload: Partial<Lead>) => {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
    if (selected?.id === id) {
      const fresh = await fetchJsonSafe<Lead>(`/api/leads/${id}`, selected);
      setSelected(fresh);
    }
  };

  const moveStage = async (lead: Lead) => {
    const idx = stageOrder.indexOf(lead.stage);
    const next = stageOrder[Math.min(idx + 1, stageOrder.length - 1)];
    await patchLead(lead.id, { stage: next });
  };

  const quickFollowup = async (lead: Lead) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    await patchLead(lead.id, { nextFollowUpAt: nextDate.toISOString() as unknown as string, stage: "CONTACTADO" });
  };

  const saveDetail = async () => {
    if (!selected) return;
    await patchLead(selected.id, selected);
  };

  return (
    <AppShell title="Leads">
      <div className="space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Leads CRM</h1>
            <p className="text-sm text-muted-foreground">Centro comercial para capturar, calificar y mover oportunidades hasta cierre.</p>
          </div>
          <Dialog>
            <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Nuevo lead rapido</DialogTrigger>
            <DialogContent className="max-w-3xl bg-card border-border">
              <DialogHeader><DialogTitle>Nuevo lead</DialogTitle></DialogHeader>
              <LeadForm onSaved={load} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Leads visibles" value={String(metrics.total)} helper="Segun filtros" />
          <Metric title="Calientes" value={String(metrics.calientes)} helper="Prioridad comercial" />
          <Metric title="Demos agendadas" value={String(metrics.demos)} helper="En pipeline" />
          <Metric title="Valor estimado" value={`$${metrics.valor.toFixed(0)}`} helper="Potencial bruto" />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-5 grid md:grid-cols-2 xl:grid-cols-5 gap-3">
            <Input
              placeholder="Buscar por nombre, negocio, telefono, ciudad o servicio"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="xl:col-span-2"
            />

            <Select value={filters.stage} onValueChange={(v) => setFilters((prev) => ({ ...prev, stage: v }))}>
              <SelectTrigger><SelectValue placeholder="Etapa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas etapas</SelectItem>
                {stageOrder.map((stage) => <SelectItem key={stage} value={stage}>{stage.replaceAll("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.source} onValueChange={(v) => setFilters((prev) => ({ ...prev, source: v }))}>
              <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos origenes</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="GOOGLE_MAPS">Google Maps</SelectItem>
                <SelectItem value="REFERIDO">Referido</SelectItem>
                <SelectItem value="WEB">Web</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.temp} onValueChange={(v) => setFilters((prev) => ({ ...prev, temp: v }))}>
              <SelectTrigger><SelectValue placeholder="Temperatura" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas temperaturas</SelectItem>
                <SelectItem value="FRIO">Frio</SelectItem>
                <SelectItem value="TIBIO">Tibio</SelectItem>
                <SelectItem value="CALIENTE">Caliente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.city} onValueChange={(v) => setFilters((prev) => ({ ...prev, city: v }))}>
              <SelectTrigger><SelectValue placeholder="Ciudad" /></SelectTrigger>
              <SelectContent>
                {cities.map((city) => <SelectItem key={city} value={city}>{city === "ALL" ? "Todas ciudades" : city}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!filtered.length ? (
          <EmptyState
            title="No hay leads con estos filtros"
            description="Ajusta filtros o crea tu primer lead para empezar a mover el pipeline."
            cta="Crear primer lead"
          />
        ) : (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-4">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-base">Pipeline operativo de leads</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {filtered.map((lead) => (
                  <div
                    key={lead.id}
                    className={`rounded-lg border px-3 py-3 transition ${selected?.id === lead.id ? "border-primary/70 bg-[#141414]" : "border-border bg-[#101010]"}`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(lead)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(lead);
                        }
                      }}
                      className="w-full cursor-pointer text-left rounded-md outline-none hover:bg-[#151515]/80 focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{lead.businessName}</p>
                          <p className="text-xs text-muted-foreground">{lead.contactName} · {lead.city}</p>
                        </div>
                        <Badge variant="outline" className={tempClass[lead.temperature]}>{lead.temperature}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{lead.stage.replaceAll("_", " ")}</span>
                        <span>•</span>
                        <span>{lead.source}</span>
                        <span>•</span>
                        <span>{lead.service}</span>
                        <span>•</span>
                        <span>{lead.estimatedValue ? `$${lead.estimatedValue}` : "Sin valor"}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => moveStage(lead)}>Mover etapa</Button>
                      <Button size="sm" variant="outline" onClick={() => quickFollowup(lead)}>Follow-up +2 dias</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
                          if (selected?.id === lead.id) setSelected(null);
                          load();
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border sticky top-20 h-fit">
              <CardHeader><CardTitle className="text-base">Ficha de lead</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Selecciona un lead para gestionarlo.</p>
                ) : (
                  <>
                    <Input value={selected.businessName} onChange={(e) => setSelected({ ...selected, businessName: e.target.value })} placeholder="Negocio" />
                    <Input value={selected.contactName} onChange={(e) => setSelected({ ...selected, contactName: e.target.value })} placeholder="Contacto" />
                    <Input value={selected.phone} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} placeholder="Telefono" />
                    <Input value={selected.email ?? ""} onChange={(e) => setSelected({ ...selected, email: e.target.value })} placeholder="Email" />
                    <Input value={selected.service} onChange={(e) => setSelected({ ...selected, service: e.target.value })} placeholder="Servicio" />

                    <div className="grid grid-cols-2 gap-2">
                      <Input value={selected.city} onChange={(e) => setSelected({ ...selected, city: e.target.value })} placeholder="Ciudad" />
                      <Input value={selected.state} onChange={(e) => setSelected({ ...selected, state: e.target.value })} placeholder="Estado" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={selected.temperature} onValueChange={(v) => setSelected({ ...selected, temperature: v as Lead["temperature"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FRIO">Frio</SelectItem>
                          <SelectItem value="TIBIO">Tibio</SelectItem>
                          <SelectItem value="CALIENTE">Caliente</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selected.stage} onValueChange={(v) => setSelected({ ...selected, stage: v as Lead["stage"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {stageOrder.map((stage) => <SelectItem key={stage} value={stage}>{stage.replaceAll("_", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={selected.lastContactAt ? selected.lastContactAt.slice(0, 10) : ""}
                        onChange={(e) => setSelected({ ...selected, lastContactAt: e.target.value })}
                      />
                      <Input
                        type="date"
                        value={selected.nextFollowUpAt ? selected.nextFollowUpAt.slice(0, 10) : ""}
                        onChange={(e) => setSelected({ ...selected, nextFollowUpAt: e.target.value })}
                      />
                    </div>

                    <Textarea value={selected.notes ?? ""} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} placeholder="Notas" />

                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Acciones comerciales</p>
                      <div className="grid gap-2">
                        <Button variant="outline" onClick={() => patchLead(selected.id, { stage: "CONTACTADO", lastContactAt: new Date().toISOString() as unknown as string })}>Marcar contactado hoy</Button>
                        <Button variant="outline" onClick={() => patchLead(selected.id, { stage: "DEMO_AGENDADA" })}>Listo para demo</Button>
                        <Button variant="outline" onClick={() => patchLead(selected.id, { stage: "CERRADO_GANADO" })}>Marcar ganado</Button>
                        <Button variant="outline" onClick={() => patchLead(selected.id, { stage: "CERRADO_PERDIDO" })}>Marcar perdido</Button>
                      </div>
                    </div>

                    <Button className="w-full bg-primary text-black font-semibold" onClick={saveDetail}>Guardar cambios</Button>
                    <p className="text-xs text-muted-foreground">Creado: {format(new Date(selected.createdAt), "d MMM yyyy HH:mm", { locale: es })}</p>
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

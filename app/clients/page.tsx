"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { isReadOnly } from "@/lib/crm/permissions";
import type { ClientStatus, CrmClient } from "@/lib/crm/types";

export default function ClientsPage() {
  const { state, currentSeller, updateClient, deleteClient, addClientMovement, addMonthlyPayment } = useCrm();
  const readOnly = isReadOnly(currentSeller);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => state.clients.find((c) => c.id === selectedId) ?? null, [state.clients, selectedId]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return state.clients.filter((c) => `${c.businessName} ${c.contactName} ${c.phone} ${c.city}`.toLowerCase().includes(t));
  }, [state.clients, q]);

  const [movNote, setMovNote] = useState("");
  const [pay, setPay] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 0, notes: "" });

  return (
    <AppShell title="Clientes">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">Cuentas activas convertidas desde leads o creadas manualmente.</p>
          </div>
          {!readOnly ? (
            <Dialog>
              <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                Crear cliente
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Nuevo cliente</DialogTitle>
                </DialogHeader>
                <ClientForm />
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        <Input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

        {!filtered.length ? (
          <EmptyState title="Sin clientes" description="Convierte un lead ganado o crea un cliente manualmente." />
        ) : (
          <div className="grid xl:grid-cols-[1fr_380px] gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b border-border px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="col-span-4">Negocio</span>
                  <span className="col-span-2">Estado</span>
                  <span className="col-span-3">Mensualidad</span>
                  <span className="col-span-3">Inicio</span>
                </div>
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full grid grid-cols-12 px-4 py-3 text-left text-sm border-b border-border hover:bg-[#141414] ${selectedId === c.id ? "bg-[#161616]" : ""}`}
                  >
                    <span className="col-span-4 font-medium truncate">{c.businessName}</span>
                    <span className="col-span-2">
                      <Badge variant="outline">{c.status}</Badge>
                    </span>
                    <span className="col-span-3">${c.monthlyFee}</span>
                    <span className="col-span-3 text-muted-foreground">{c.startDate}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border xl:sticky xl:top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-base">Detalle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Selecciona un cliente.</p>
                ) : readOnly ? (
                  <p className="text-sm text-muted-foreground">Solo lectura.</p>
                ) : (
                  <>
                    <ClientDetailEditor
                      client={selected}
                      onPatch={(patch) => updateClient(selected.id, patch)}
                      sellers={state.sellers.filter((s) => s.role === "VENDEDOR" || s.role === "ADMIN")}
                    />
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs uppercase text-muted-foreground">Historial</p>
                      <div className="space-y-1 max-h-28 overflow-y-auto text-xs">
                        {selected.movementHistory.map((m) => (
                          <div key={m.id} className="border border-border/60 rounded p-2">
                            {format(parseISO(m.createdAt), "d MMM", { locale: es })} — {m.note}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={movNote} onChange={(e) => setMovNote(e.target.value)} placeholder="Nuevo movimiento / nota" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (!movNote.trim()) return;
                            addClientMovement(selected.id, movNote.trim());
                            setMovNote("");
                          }}
                        >
                          Registrar
                        </Button>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs uppercase text-muted-foreground">Pago mensual</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={pay.month} onChange={(e) => setPay((p) => ({ ...p, month: Number(e.target.value) }))} />
                        <Input type="number" value={pay.year} onChange={(e) => setPay((p) => ({ ...p, year: Number(e.target.value) }))} />
                        <Input type="number" value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: Number(e.target.value) }))} />
                      </div>
                      <Input value={pay.notes} onChange={(e) => setPay((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas del pago" />
                      <Button
                        type="button"
                        className="bg-primary text-black"
                        onClick={() => {
                          addMonthlyPayment(selected.id, {
                            month: pay.month,
                            year: pay.year,
                            amount: pay.amount,
                            paidAt: new Date().toISOString(),
                            notes: pay.notes || null,
                          });
                        }}
                      >
                        Registrar pago
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteClient(selected.id)}>
                      Eliminar cliente
                    </Button>
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

function ClientDetailEditor({
  client,
  onPatch,
  sellers,
}: {
  client: CrmClient;
  onPatch: (p: Partial<CrmClient>) => void;
  sellers: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-2">
      <Input value={client.businessName} onChange={(e) => onPatch({ businessName: e.target.value })} />
      <Input value={client.contactName} onChange={(e) => onPatch({ contactName: e.target.value })} />
      <Input value={client.phone} onChange={(e) => onPatch({ phone: e.target.value })} />
      <Input value={client.email ?? ""} onChange={(e) => onPatch({ email: e.target.value || null })} />
      <Input value={client.city} onChange={(e) => onPatch({ city: e.target.value })} />
      <Input value={client.serviceContracted} onChange={(e) => onPatch({ serviceContracted: e.target.value })} />
      <Input type="number" value={client.monthlyFee} onChange={(e) => onPatch({ monthlyFee: Number(e.target.value) })} />
      <Input type="number" value={client.initialPayment} onChange={(e) => onPatch({ initialPayment: Number(e.target.value) })} />
      <Input type="date" value={client.startDate.slice(0, 10)} onChange={(e) => onPatch({ startDate: e.target.value })} />
      <Select value={client.status} onValueChange={(v) => onPatch({ status: (v ?? client.status) as ClientStatus })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVO">Activo</SelectItem>
          <SelectItem value="PAUSADO">Pausado</SelectItem>
          <SelectItem value="CANCELADO">Cancelado</SelectItem>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
        </SelectContent>
      </Select>
      <Select value={client.sellerId ?? "__none"} onValueChange={(v) => onPatch({ sellerId: v === "__none" ? null : v })}>
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
      <Textarea value={client.notes ?? ""} onChange={(e) => onPatch({ notes: e.target.value })} placeholder="Notas" />
    </div>
  );
}

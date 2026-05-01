"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import type { PersonalItem, PersonalType } from "@/lib/crm/types";

const priorityColor = {
  BAJA: "text-zinc-300",
  MEDIA: "text-blue-300",
  ALTA: "text-amber-300",
  URGENTE: "text-red-300",
};

export default function PersonalPage() {
  const { state, createPersonal, updatePersonal, deletePersonal } = useCrm();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    type: "TASK" as PersonalType,
    title: "",
    content: "",
    date: "",
    time: "",
    priority: "MEDIA" as PersonalItem["priority"],
  });

  const filtered = useMemo(
    () => state.personalItems.filter((i) => `${i.title} ${i.content || ""}`.toLowerCase().includes(query.toLowerCase())),
    [state.personalItems, query],
  );

  const byType = (t: PersonalType) => filtered.filter((i) => i.type === t);

  const createItem = () => {
    if (!form.title.trim()) return;
    createPersonal({
      type: form.type,
      title: form.title.trim(),
      content: form.content || null,
      date: form.date || null,
      time: form.time || null,
      priority: form.priority,
      status: "PENDIENTE",
    });
    setForm({ type: "TASK", title: "", content: "", date: "", time: "", priority: "MEDIA" });
  };

  return (
    <AppShell title="Personal">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sistema personal</h1>
          <p className="text-sm text-muted-foreground">Separado del CRM comercial. No se mezcla con leads ni clientes.</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Captura rápida</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 xl:grid-cols-6 gap-3">
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: (v ?? f.type) as PersonalType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTE">Nota</SelectItem>
                <SelectItem value="TASK">Tarea personal</SelectItem>
                <SelectItem value="REMINDER">Recordatorio</SelectItem>
                <SelectItem value="EVENT">Evento personal</SelectItem>
              </SelectContent>
            </Select>
            <Input className="xl:col-span-2" placeholder="Título" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: (v ?? f.priority) as PersonalItem["priority"] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJA">Baja</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Textarea className="md:col-span-2 xl:col-span-5" placeholder="Detalle" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
            <Button className="bg-primary text-black font-semibold" onClick={createItem}>
              Guardar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <Input placeholder="Buscar en lo personal" value={query} onChange={(e) => setQuery(e.target.value)} />
          </CardContent>
        </Card>

        <Tabs defaultValue="agenda">
          <TabsList>
            <TabsTrigger value="agenda">Eventos</TabsTrigger>
            <TabsTrigger value="tareas">Tareas</TabsTrigger>
            <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>
          <TabsContent value="agenda" className="mt-4">
            <ItemsGrid items={byType("EVENT")} patch={updatePersonal} remove={deletePersonal} />
          </TabsContent>
          <TabsContent value="tareas" className="mt-4">
            <ItemsGrid items={byType("TASK")} patch={updatePersonal} remove={deletePersonal} />
          </TabsContent>
          <TabsContent value="recordatorios" className="mt-4">
            <ItemsGrid items={byType("REMINDER")} patch={updatePersonal} remove={deletePersonal} />
          </TabsContent>
          <TabsContent value="notas" className="mt-4">
            <ItemsGrid items={byType("NOTE")} patch={updatePersonal} remove={deletePersonal} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function ItemsGrid({
  items,
  patch,
  remove,
}: {
  items: PersonalItem[];
  patch: (id: string, p: Partial<PersonalItem>) => void;
  remove: (id: string) => void;
}) {
  if (!items.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">No hay elementos aquí todavía.</CardContent>
      </Card>
    );
  }
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {items.map((item) => (
        <Card key={item.id} className="bg-card border-border">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{item.title}</p>
              <Badge variant="outline" className={priorityColor[item.priority]}>
                {item.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.date ? format(parseISO(item.date), "d MMM yyyy", { locale: es }) : "Sin fecha"}
              {item.time ? ` · ${item.time}` : ""}
            </p>
            {item.content ? <p className="text-sm text-zinc-200">{item.content}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => patch(item.id, { status: item.status === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA" })}>
                {item.status === "COMPLETADA" ? "Reabrir" : "Completar"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

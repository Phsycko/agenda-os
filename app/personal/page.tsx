"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchJsonSafe } from "@/lib/utils";

type PersonalItem = {
  id: string;
  type: "EVENT" | "TASK" | "NOTE";
  title: string;
  content?: string;
  date?: string;
  time?: string;
  status: "PENDIENTE" | "COMPLETADA" | "CANCELADA";
  priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

const priorityColor = {
  BAJA: "text-zinc-300",
  MEDIA: "text-blue-300",
  ALTA: "text-amber-300",
  URGENTE: "text-red-300",
};

export default function PersonalPage() {
  const [items, setItems] = useState<PersonalItem[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    type: "TASK",
    title: "",
    content: "",
    date: "",
    time: "",
    priority: "MEDIA",
  });

  const load = async () => {
    const data = await fetchJsonSafe<PersonalItem[]>("/api/personal", []);
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => `${i.title} ${i.content || ""}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const byType = {
    agenda: filtered.filter((i) => i.type === "EVENT"),
    tareas: filtered.filter((i) => i.type === "TASK"),
    notas: filtered.filter((i) => i.type === "NOTE"),
  };

  const createItem = async () => {
    if (!form.title.trim()) return;
    await fetch("/api/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        title: form.title,
        content: form.content,
        date: form.date || undefined,
        time: form.time || undefined,
        priority: form.priority,
      }),
    });
    setForm({ type: "TASK", title: "", content: "", date: "", time: "", priority: "MEDIA" });
    load();
  };

  const patch = async (id: string, payload: Partial<PersonalItem>) => {
    await fetch(`/api/personal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/personal/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AppShell title="Personal">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Mi Sistema Personal</h1>
          <p className="text-sm text-muted-foreground">Tu agenda, tareas y notas de vida diaria en el mismo sistema de trabajo.</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Captura rapida personal</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 xl:grid-cols-6 gap-3">
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v ?? f.type }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EVENT">Agenda personal</SelectItem>
                <SelectItem value="TASK">Tarea personal</SelectItem>
                <SelectItem value="NOTE">Nota personal</SelectItem>
              </SelectContent>
            </Select>
            <Input className="xl:col-span-2" placeholder="Titulo" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v ?? f.priority }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJA">Baja</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Textarea className="md:col-span-2 xl:col-span-5" placeholder="Notas / detalle" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
            <Button className="bg-primary text-black font-semibold" onClick={createItem}>Guardar en mi sistema</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <Input placeholder="Buscar en agenda, tareas o notas personales" value={query} onChange={(e) => setQuery(e.target.value)} />
          </CardContent>
        </Card>

        <Tabs defaultValue="agenda">
          <TabsList>
            <TabsTrigger value="agenda">Agenda personal</TabsTrigger>
            <TabsTrigger value="tareas">Tareas personales</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-4">
            <ItemsGrid items={byType.agenda} patch={patch} remove={remove} />
          </TabsContent>
          <TabsContent value="tareas" className="mt-4">
            <ItemsGrid items={byType.tareas} patch={patch} remove={remove} />
          </TabsContent>
          <TabsContent value="notas" className="mt-4">
            <ItemsGrid items={byType.notas} patch={patch} remove={remove} />
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
  patch: (id: string, payload: Partial<PersonalItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  if (!items.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No hay elementos aqui todavia. Crea uno arriba y empieza a organizar tu vida personal.
        </CardContent>
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
              <Badge variant="outline" className={priorityColor[item.priority]}>{item.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.date ? format(new Date(item.date), "d MMM yyyy", { locale: es }) : "Sin fecha"}
              {item.time ? ` - ${item.time}` : ""}
            </p>
            {item.content ? <p className="text-sm text-zinc-200">{item.content}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => patch(item.id, { status: item.status === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA" })}>
                {item.status === "COMPLETADA" ? "Reabrir" : "Completar"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>Eliminar</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import { tasksBuckets } from "@/lib/crm/selectors";
import { isReadOnly } from "@/lib/crm/permissions";
import type { CrmTask } from "@/lib/crm/types";
import { EmptyState } from "@/components/ui/empty-state";

export default function TareasPage() {
  const { state, currentSeller, updateTask, deleteTask } = useCrm();
  const readOnly = isReadOnly(currentSeller);
  const { myToday, overdue, upcoming, completed, all } = tasksBuckets(state, currentSeller);

  const [filterSeller, setFilterSeller] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPri, setFilterPri] = useState("ALL");

  const visible = useMemo(() => {
    return all.filter((t) => {
      const okS = filterSeller === "ALL" || t.sellerId === filterSeller || (filterSeller === "__none" && !t.sellerId);
      const okSt = filterStatus === "ALL" || t.status === filterStatus;
      const okP = filterPri === "ALL" || t.priority === filterPri;
      return okS && okSt && okP;
    });
  }, [all, filterSeller, filterStatus, filterPri]);

  return (
    <AppShell title="Tareas">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tareas comerciales</h1>
            <p className="text-sm text-muted-foreground">Ejecución diaria ligada a leads y clientes.</p>
          </div>
          {!readOnly ? (
            <Dialog>
              <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                Crear tarea
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Nueva tarea</DialogTitle>
                </DialogHeader>
                <TaskForm />
              </DialogContent>
            </Dialog>
          ) : null}
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="EN_PROGRESO">En proceso</SelectItem>
              <SelectItem value="COMPLETADA">Completada</SelectItem>
              <SelectItem value="VENCIDA">Vencida</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPri} onValueChange={(v) => setFilterPri(v ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="BAJA">Baja</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="URGENTE">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeller} onValueChange={(v) => setFilterSeller(v ?? "ALL")}>
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

        <div className="grid xl:grid-cols-2 gap-4">
          <TaskColumn title="Mis tareas hoy" items={myToday} empty="Nada programado para hoy." onUpdate={updateTask} onDelete={deleteTask} readOnly={readOnly} />
          <TaskColumn title="Vencidas" items={overdue} empty="Sin tareas vencidas." onUpdate={updateTask} onDelete={deleteTask} readOnly={readOnly} />
          <TaskColumn title="Próximas (semana)" items={upcoming} empty="Sin tareas próximas." onUpdate={updateTask} onDelete={deleteTask} readOnly={readOnly} />
          <TaskColumn title="Completadas recientes" items={completed} empty="Aún no completas tareas." onUpdate={updateTask} onDelete={deleteTask} readOnly={readOnly} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Todas ({visible.length})</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            {!visible.length ? (
              <EmptyState title="Sin tareas" description="Crea tareas desde aquí o desde el botón superior." />
            ) : (
              visible.map((t) => (
                <Card key={t.id} className="bg-[#101010] border-border">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-sm">{t.title}</p>
                      <Badge variant="outline">{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    <p className="text-xs">
                      {t.status} · vence {t.dueDate?.slice(0, 10) ?? "—"}
                    </p>
                    {!readOnly ? (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => updateTask(t.id, { status: "COMPLETADA" })}>
                          Completar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTask(t.id)}>
                          Eliminar
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function TaskColumn({
  title,
  items,
  empty,
  onUpdate,
  onDelete,
  readOnly,
}: {
  title: string;
  items: CrmTask[];
  empty: string;
  onUpdate: (id: string, p: Partial<CrmTask>) => void;
  onDelete: (id: string) => void;
  readOnly: boolean;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {!items.length ? <p className="text-xs text-muted-foreground">{empty}</p> : null}
        {items.map((t) => (
          <div key={t.id} className="rounded-md border border-border/70 p-2 text-sm">
            <p className="font-medium">{t.title}</p>
            <p className="text-xs text-muted-foreground">{t.status}</p>
            {!readOnly ? (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdate(t.id, { status: "COMPLETADA" })}>
                  Hecho
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onDelete(t.id)}>
                  Borrar
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

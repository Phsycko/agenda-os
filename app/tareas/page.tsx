"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
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
  const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);

  const openedTask = useMemo(() => (openedTaskId ? state.tasks.find((t) => t.id === openedTaskId) ?? null : null), [state.tasks, openedTaskId]);

  const visible = useMemo(() => {
    return all.filter((t) => {
      const okS = filterSeller === "ALL" || t.sellerId === filterSeller || (filterSeller === "__none" && !t.sellerId);
      const okSt = filterStatus === "ALL" || t.status === filterStatus;
      const okP = filterPri === "ALL" || t.priority === filterPri;
      return okS && okSt && okP;
    });
  }, [all, filterSeller, filterStatus, filterPri]);

  const resolveLead = (id: string | null) => (id ? state.leads.find((l) => l.id === id)?.businessName : null);
  const resolveClient = (id: string | null) => (id ? state.clients.find((c) => c.id === id)?.businessName : null);
  const resolveSeller = (id: string | null) => (id ? state.sellers.find((s) => s.id === id)?.name : null);

  return (
    <AppShell title="Tareas">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tareas comerciales</h1>
            <p className="text-sm text-muted-foreground">Ejecución diaria ligada a leads y clientes. Pulsa una tarea para verla o editarla.</p>
          </div>
          {!readOnly ? (
            <Dialog>
              <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                Crear tarea
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nueva tarea</DialogTitle>
                </DialogHeader>
                <TaskForm skipGlobalModal />
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
          <TaskColumn
            title="Mis tareas hoy"
            items={myToday}
            empty="Nada programado para hoy."
            onUpdate={updateTask}
            onDelete={deleteTask}
            readOnly={readOnly}
            onOpen={setOpenedTaskId}
          />
          <TaskColumn
            title="Vencidas"
            items={overdue}
            empty="Sin tareas vencidas."
            onUpdate={updateTask}
            onDelete={deleteTask}
            readOnly={readOnly}
            onOpen={setOpenedTaskId}
          />
          <TaskColumn
            title="Próximas (semana)"
            items={upcoming}
            empty="Sin tareas próximas."
            onUpdate={updateTask}
            onDelete={deleteTask}
            readOnly={readOnly}
            onOpen={setOpenedTaskId}
          />
          <TaskColumn
            title="Completadas recientes"
            items={completed}
            empty="Aún no completas tareas."
            onUpdate={updateTask}
            onDelete={deleteTask}
            readOnly={readOnly}
            onOpen={setOpenedTaskId}
          />
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
                <TaskCard
                  key={t.id}
                  task={t}
                  readOnly={readOnly}
                  onOpen={() => setOpenedTaskId(t.id)}
                  onComplete={() => updateTask(t.id, { status: "COMPLETADA" })}
                  onDelete={() => deleteTask(t.id)}
                  dueLabel={t.dueDate ? t.dueDate.slice(0, 10) : "Sin fecha"}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(openedTaskId)} onOpenChange={(open) => !open && setOpenedTaskId(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openedTask ? openedTask.title : "Tarea"}</DialogTitle>
          </DialogHeader>
          {openedTask ? (
            readOnly ? (
              <TaskReadOnly
                task={openedTask}
                leadName={resolveLead(openedTask.leadId)}
                clientName={resolveClient(openedTask.clientId)}
                sellerName={resolveSeller(openedTask.sellerId)}
              />
            ) : (
              <TaskForm key={openedTask.id} task={openedTask} skipGlobalModal onClose={() => setOpenedTaskId(null)} />
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function TaskReadOnly({
  task,
  leadName,
  clientName,
  sellerName,
}: {
  task: CrmTask;
  leadName: string | null | undefined;
  clientName: string | null | undefined;
  sellerName: string | null | undefined;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{task.priority}</Badge>
        <Badge variant="outline">{task.status.replaceAll("_", " ")}</Badge>
      </div>
      {task.description ? <p className="text-zinc-200 whitespace-pre-wrap">{task.description}</p> : <p className="text-muted-foreground">Sin descripción.</p>}
      <dl className="grid gap-2 text-muted-foreground">
        <div>
          <dt className="text-xs uppercase tracking-wide">Vence</dt>
          <dd className="text-zinc-200">
            {task.dueDate ? format(parseISO(task.dueDate), "d MMM yyyy", { locale: es }) : "Sin fecha límite"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Vendedor</dt>
          <dd className="text-zinc-200">{sellerName ?? "Sin asignar"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Lead</dt>
          <dd className="text-zinc-200">{leadName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Cliente</dt>
          <dd className="text-zinc-200">{clientName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Creada</dt>
          <dd className="text-zinc-200">{format(parseISO(task.createdAt), "d MMM yyyy HH:mm", { locale: es })}</dd>
        </div>
      </dl>
    </div>
  );
}

function TaskCard({
  task,
  readOnly,
  onOpen,
  onComplete,
  onDelete,
  dueLabel,
}: {
  task: CrmTask;
  readOnly: boolean;
  onOpen: () => void;
  onComplete: () => void;
  onDelete: () => void;
  dueLabel: string;
}) {
  return (
    <Card className="bg-[#101010] border-border transition hover:border-primary/40">
      <CardContent className="pt-4 space-y-2">
        <button type="button" onClick={onOpen} className="w-full text-left rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          <div className="flex justify-between gap-2">
            <p className="font-semibold text-sm text-zinc-100">{task.title}</p>
            <Badge variant="outline">{task.priority}</Badge>
          </div>
          {task.description ? <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p> : null}
          <p className="text-xs text-primary/90 mt-2">
            {task.status.replaceAll("_", " ")} · vence {dueLabel}
          </p>
          <span className="text-[11px] text-muted-foreground">Clic para abrir y editar</span>
        </button>
        {!readOnly ? (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            <Button size="sm" variant="outline" onClick={onOpen}>
              Ver / editar
            </Button>
            <Button size="sm" variant="outline" onClick={onComplete}>
              Completar
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Eliminar
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="mt-2" onClick={onOpen}>
            Ver detalle
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TaskColumn({
  title,
  items,
  empty,
  onUpdate,
  onDelete,
  readOnly,
  onOpen,
}: {
  title: string;
  items: CrmTask[];
  empty: string;
  onUpdate: (id: string, p: Partial<CrmTask>) => void;
  onDelete: (id: string) => void;
  readOnly: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {!items.length ? <p className="text-xs text-muted-foreground">{empty}</p> : null}
        {items.map((t) => (
          <div key={t.id} className="rounded-md border border-border/70 p-2 text-sm space-y-2">
            <button type="button" className="w-full text-left font-medium hover:text-primary transition" onClick={() => onOpen(t.id)}>
              {t.title}
            </button>
            <p className="text-xs text-muted-foreground">{t.status.replaceAll("_", " ")} · {t.dueDate ? t.dueDate.slice(0, 10) : "sin fecha"}</p>
            {!readOnly ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpen(t.id)}>
                  Abrir
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdate(t.id, { status: "COMPLETADA" })}>
                  Hecho
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onDelete(t.id)}>
                  Borrar
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpen(t.id)}>
                Ver
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

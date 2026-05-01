"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { taskSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { PRIORITIES, TASK_STATUSES, type CrmTask, type Priority, type TaskStatus } from "@/lib/crm/types";

function taskToFormValues(task: CrmTask | null | undefined) {
  if (!task) {
    return {
      title: "",
      description: "",
      status: "PENDIENTE" as TaskStatus,
      priority: "MEDIA" as Priority,
      dueDate: "",
      leadId: "",
      clientId: "",
      sellerId: "",
    };
  }
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    leadId: task.leadId ?? "",
    clientId: task.clientId ?? "",
    sellerId: task.sellerId ?? "",
  };
}

export function TaskForm({
  onSaved,
  onClose,
  initialLeadId,
  task,
  skipGlobalModal,
}: {
  onSaved?: () => void;
  onClose?: () => void;
  initialLeadId?: string | null;
  /** Si viene definida, el formulario edita esa tarea en lugar de crear una nueva */
  task?: CrmTask | null;
  /** No cerrar el modal global del topbar al guardar (p. ej. edición desde /tareas) */
  skipGlobalModal?: boolean;
}) {
  const { createTask, updateTask, state, setModalOpen } = useCrm();
  const isEdit = Boolean(task);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: taskToFormValues(task),
  });

  useEffect(() => {
    if (task) form.reset(taskToFormValues(task));
    // Solo al abrir otra tarea (por id), no en cada render del objeto `task`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  useEffect(() => {
    if (!initialLeadId || isEdit) return;
    form.setValue("leadId", initialLeadId);
    if (!form.getValues("title")) form.setValue("title", "Seguimiento de lead");
  }, [initialLeadId, isEdit, form]);

  const close = () => {
    onClose?.();
    if (!skipGlobalModal) setModalOpen(null);
  };

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((v) => {
        const payload = {
          title: v.title,
          description: v.description || null,
          status: (v.status as TaskStatus) || "PENDIENTE",
          priority: (v.priority as Priority) || "MEDIA",
          dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : null,
          leadId: v.leadId || null,
          clientId: v.clientId || null,
          sellerId: v.sellerId || null,
        };
        if (task) {
          updateTask(task.id, payload);
        } else {
          createTask(payload);
          form.reset(taskToFormValues(undefined));
        }
        onSaved?.();
        close();
      })}
    >
      <Input placeholder="Título" {...form.register("title")} />
      <Textarea placeholder="Descripción" {...form.register("description")} />
      <div className="grid grid-cols-2 gap-3">
        <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", (v ?? "PENDIENTE") as TaskStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={form.watch("priority")} onValueChange={(v) => form.setValue("priority", (v ?? "MEDIA") as Priority)}>
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
      <div>
        <p className="text-xs text-muted-foreground mb-1">Fecha límite</p>
        <Input type="date" {...form.register("dueDate")} />
      </div>
      <Select
        value={form.watch("sellerId") ? form.watch("sellerId") : "__none"}
        onValueChange={(v) => form.setValue("sellerId", v === "__none" ? "" : (v ?? ""))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Vendedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin asignar</SelectItem>
          {state.sellers.filter((s) => s.active && (s.role === "VENDEDOR" || s.role === "ADMIN")).map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={form.watch("leadId") ? form.watch("leadId") : "__none"}
        onValueChange={(v) => form.setValue("leadId", v === "__none" ? "" : (v ?? ""))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Relacionar lead" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin lead</SelectItem>
          {state.leads.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={form.watch("clientId") ? form.watch("clientId") : "__none"}
        onValueChange={(v) => form.setValue("clientId", v === "__none" ? "" : (v ?? ""))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Relacionar cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin cliente</SelectItem>
          {state.clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" className="bg-primary text-black">
        {isEdit ? "Guardar cambios" : "Guardar tarea"}
      </Button>
    </form>
  );
}

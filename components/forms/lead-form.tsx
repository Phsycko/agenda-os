"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { LEAD_SOURCES, LEAD_STAGES, PRIORITIES, type LeadSource, type LeadStage, type Priority } from "@/lib/crm/types";
import { leadSchema } from "@/lib/validations";

export function LeadForm({ onSaved, onClose }: { onSaved?: () => void; onClose?: () => void }) {
  const { createLead, state, setModalOpen } = useCrm();
  const form = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contactName: "",
      businessName: "",
      phone: "",
      email: "",
      service: "",
      city: "",
      state: "",
      source: "OTRO" as string,
      priority: "MEDIA" as string,
      stage: "NUEVO" as string,
      notes: "",
      assignedSellerId: "",
      estimatedValue: undefined as unknown as number,
      lastContactAt: "",
      nextFollowUpAt: "",
      nextAction: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createLead({
      contactName: values.contactName?.trim() || "",
      businessName: values.businessName?.trim() || "",
      phone: values.phone?.trim() || "",
      email: values.email || null,
      service: values.service?.trim() || "",
      city: values.city?.trim() || "",
      source: (values.source as LeadSource) || "OTRO",
      stage: (values.stage as LeadStage) || "NUEVO",
      priority: (values.priority as Priority) || "MEDIA",
      notes: values.notes || null,
      estimatedValue: values.estimatedValue ?? null,
      lastContactAt: values.lastContactAt ? new Date(values.lastContactAt).toISOString() : null,
      nextFollowUpAt: values.nextFollowUpAt ? new Date(values.nextFollowUpAt).toISOString() : null,
      nextAction: values.nextAction?.trim() || null,
      assignedSellerId: values.assignedSellerId?.trim() ? values.assignedSellerId : null,
    });
    form.reset();
    onSaved?.();
    onClose?.();
    setModalOpen(null);
  });

  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
      <Input placeholder="Nombre del contacto" {...form.register("contactName")} />
      <Input placeholder="Nombre del negocio" {...form.register("businessName")} />
      <Input placeholder="Teléfono" {...form.register("phone")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Servicio de interés" {...form.register("service")} />
      <Input placeholder="Ciudad" {...form.register("city")} />
      <Input placeholder="Estado / región" {...form.register("state")} />
      <Input type="number" placeholder="Valor estimado" {...form.register("estimatedValue")} />

      <Select defaultValue="OTRO" onValueChange={(v) => form.setValue("source", v ?? "OTRO")}>
        <SelectTrigger>
          <SelectValue placeholder="Fuente" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="MEDIA" onValueChange={(v) => form.setValue("priority", v ?? "MEDIA")}>
        <SelectTrigger>
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="NUEVO" onValueChange={(v) => form.setValue("stage", v ?? "NUEVO")}>
        <SelectTrigger>
          <SelectValue placeholder="Etapa" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STAGES.map((st) => (
            <SelectItem key={st} value={st}>
              {st.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("assignedSellerId", v === "__none" ? "" : (v ?? ""))}>
        <SelectTrigger>
          <SelectValue placeholder="Vendedor asignado" />
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

      <Input type="date" placeholder="Último contacto" {...form.register("lastContactAt")} />
      <Input type="date" placeholder="Próximo seguimiento" {...form.register("nextFollowUpAt")} />
      <Input className="md:col-span-2" placeholder="Próxima acción" {...form.register("nextAction")} />

      <Textarea className="md:col-span-2" placeholder="Notas" {...form.register("notes")} />

      {form.formState.errors.contactName ? (
        <p className="md:col-span-2 text-sm text-red-300">{form.formState.errors.contactName.message}</p>
      ) : null}

      <Button type="submit" className="md:col-span-2 bg-primary hover:bg-primary/90 text-black font-semibold">
        Guardar lead
      </Button>
    </form>
  );
}

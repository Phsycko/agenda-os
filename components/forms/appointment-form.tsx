"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { appointmentCrmSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, type AppointmentStatus, type AppointmentType } from "@/lib/crm/types";

type Relation = { id: string; businessName: string };

export function AppointmentForm({
  onSaved,
  leads,
  clients,
  onClose,
  initialLeadId,
}: {
  onSaved?: () => void;
  leads: Relation[];
  clients: Relation[];
  onClose?: () => void;
  initialLeadId?: string | null;
}) {
  const { createAppointment, state, setModalOpen } = useCrm();
  const form = useForm({
    resolver: zodResolver(appointmentCrmSchema),
    defaultValues: {
      title: "",
      type: "DEMO" as AppointmentType,
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      status: "PENDIENTE" as AppointmentStatus,
      notes: "",
      nextAction: "",
      leadId: "__none" as string | null,
      clientId: "__none" as string | null,
      sellerId: "__none" as string | null,
    },
  });

  useEffect(() => {
    if (!initialLeadId) return;
    form.setValue("leadId", initialLeadId);
    form.setValue("type", "DEMO");
    form.setValue("title", "Demo comercial");
  }, [initialLeadId, form]);

  const submit = form.handleSubmit((v) => {
    createAppointment({
      title: v.title,
      type: v.type as AppointmentType,
      date: v.date,
      time: v.time,
      status: v.status as AppointmentStatus,
      notes: v.notes || null,
      nextAction: v.nextAction || null,
      leadId: !v.leadId || v.leadId === "__none" ? null : v.leadId,
      clientId: !v.clientId || v.clientId === "__none" ? null : v.clientId,
      sellerId: !v.sellerId || v.sellerId === "__none" ? null : v.sellerId,
    });
    form.reset();
    onSaved?.();
    onClose?.();
    setModalOpen(null);
  });

  return (
    <form className="grid md:grid-cols-2 gap-3" onSubmit={submit}>
      <Input placeholder="Título" {...form.register("title")} className="md:col-span-2" />

      <Select defaultValue="DEMO" onValueChange={(v) => form.setValue("type", (v ?? "DEMO") as AppointmentType)}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          {APPOINTMENT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="PENDIENTE" onValueChange={(v) => form.setValue("status", (v ?? "PENDIENTE") as AppointmentStatus)}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {APPOINTMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input type="date" {...form.register("date")} />
      <Input type="time" {...form.register("time")} />

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("sellerId", v ?? "__none")}>
        <SelectTrigger>
          <SelectValue placeholder="Vendedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin asignar</SelectItem>
          {state.sellers.filter((x) => x.active && (x.role === "VENDEDOR" || x.role === "ADMIN")).map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("leadId", v ?? "__none")}>
        <SelectTrigger>
          <SelectValue placeholder="Lead" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin lead</SelectItem>
          {leads.map((lead) => (
            <SelectItem key={lead.id} value={lead.id}>
              {lead.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("clientId", v ?? "__none")}>
        <SelectTrigger>
          <SelectValue placeholder="Cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin cliente</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Próxima acción" {...form.register("nextAction")} className="md:col-span-2" />
      <Textarea placeholder="Notas" {...form.register("notes")} className="md:col-span-2" />

      <Button type="submit" className="md:col-span-2 bg-primary text-black font-semibold">
        Guardar cita
      </Button>
    </form>
  );
}

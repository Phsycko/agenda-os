"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { appointmentSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Relation = { id: string; businessName: string };

export function AppointmentForm({
  onSaved,
  leads,
  clients,
}: {
  onSaved: () => void;
  leads: Relation[];
  clients: Relation[];
}) {
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      type: "DEMO",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      duration: 45,
      status: "PENDIENTE",
      priority: "MEDIA",
      notes: "",
      nextAction: "",
      reminder: "MIN_15",
      meetingLink: "",
      location: "",
      leadId: "__none",
      clientId: "__none",
    },
  });

  const submit = form.handleSubmit(async (v) => {
    await fetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify(v),
    });
    onSaved();
    form.reset();
  });

  return (
    <form className="grid md:grid-cols-2 gap-3" onSubmit={submit}>
      <Input placeholder="Titulo" {...form.register("title")} className="md:col-span-2" />

      <Select defaultValue="DEMO" onValueChange={(v) => form.setValue("type", v as z.infer<typeof appointmentSchema>["type"])}>
        <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="DEMO">Demo</SelectItem>
          <SelectItem value="LLAMADA">Llamada</SelectItem>
          <SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem>
          <SelectItem value="REVISION_MENSUAL">Revision mensual</SelectItem>
          <SelectItem value="COBRO">Cobro</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="PENDIENTE" onValueChange={(v) => form.setValue("status", v as z.infer<typeof appointmentSchema>["status"])}>
        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
          <SelectItem value="COMPLETADA">Completada</SelectItem>
          <SelectItem value="CANCELADA">Cancelada</SelectItem>
          <SelectItem value="REAGENDADA">Reagendada</SelectItem>
        </SelectContent>
      </Select>

      <Input type="date" {...form.register("date")} />
      <Input type="time" {...form.register("time")} />
      <Input type="number" min={15} step={15} placeholder="Duracion (min)" {...form.register("duration")} />

      <Select defaultValue="MEDIA" onValueChange={(v) => form.setValue("priority", v as z.infer<typeof appointmentSchema>["priority"])}>
        <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="BAJA">Baja</SelectItem>
          <SelectItem value="MEDIA">Media</SelectItem>
          <SelectItem value="ALTA">Alta</SelectItem>
          <SelectItem value="URGENTE">Urgente</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="MIN_15" onValueChange={(v) => form.setValue("reminder", v as z.infer<typeof appointmentSchema>["reminder"])}>
        <SelectTrigger><SelectValue placeholder="Recordatorio" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">Sin recordatorio</SelectItem>
          <SelectItem value="MIN_15">15 minutos antes</SelectItem>
          <SelectItem value="HOUR_1">1 hora antes</SelectItem>
          <SelectItem value="DAY_1">1 dia antes</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("leadId", v)}>
        <SelectTrigger><SelectValue placeholder="Relacionar con lead" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin lead</SelectItem>
          {leads.map((lead) => <SelectItem key={lead.id} value={lead.id}>{lead.businessName}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select defaultValue="__none" onValueChange={(v) => form.setValue("clientId", v)}>
        <SelectTrigger><SelectValue placeholder="Relacionar con cliente" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin cliente</SelectItem>
          {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.businessName}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input placeholder="Link de llamada (opcional)" {...form.register("meetingLink")} className="md:col-span-2" />
      <Input placeholder="Ubicacion (opcional)" {...form.register("location")} className="md:col-span-2" />
      <Input placeholder="Proxima accion" {...form.register("nextAction")} className="md:col-span-2" />
      <Textarea placeholder="Notas" {...form.register("notes")} className="md:col-span-2" />

      <Button type="submit" className="md:col-span-2 bg-primary text-black font-semibold">Guardar cita</Button>
    </form>
  );
}

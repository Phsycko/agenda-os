"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadSchema } from "@/lib/validations";

export function LeadForm({ onSaved }: { onSaved: () => void }) {
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
      source: "OTRO",
      temperature: "TIBIO",
      stage: "NUEVO",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) return;
    form.reset();
    onSaved();
  });

  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
      <Input placeholder="Nombre del contacto (opcional)" {...form.register("contactName")} />
      <Input placeholder="Nombre del negocio (opcional)" {...form.register("businessName")} />
      <Input placeholder="Telefono" {...form.register("phone")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Servicio" {...form.register("service")} />
      <Input placeholder="Ciudad" {...form.register("city")} />
      <Input placeholder="Estado" {...form.register("state")} />
      <Input type="number" placeholder="Valor estimado" {...form.register("estimatedValue")} />

      <Select defaultValue="OTRO" onValueChange={(v) => form.setValue("source", v ?? "OTRO")}>
        <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="FACEBOOK">Facebook</SelectItem>
          <SelectItem value="INSTAGRAM">Instagram</SelectItem>
          <SelectItem value="GOOGLE_MAPS">Google Maps</SelectItem>
          <SelectItem value="REFERIDO">Referido</SelectItem>
          <SelectItem value="WEB">Web</SelectItem>
          <SelectItem value="OTRO">Otro</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="TIBIO" onValueChange={(v) => form.setValue("temperature", v ?? "TIBIO")}>
        <SelectTrigger><SelectValue placeholder="Temperatura" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="FRIO">Frio</SelectItem>
          <SelectItem value="TIBIO">Tibio</SelectItem>
          <SelectItem value="CALIENTE">Caliente</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="NUEVO" onValueChange={(v) => form.setValue("stage", v ?? "NUEVO")}>
        <SelectTrigger><SelectValue placeholder="Etapa" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="NUEVO">Nuevo</SelectItem>
          <SelectItem value="CONTACTADO">Contactado</SelectItem>
          <SelectItem value="INTERESADO">Interesado</SelectItem>
          <SelectItem value="DEMO_AGENDADA">Demo agendada</SelectItem>
          <SelectItem value="DEMO_REALIZADA">Demo realizada</SelectItem>
          <SelectItem value="PROPUESTA_ENVIADA">Propuesta enviada</SelectItem>
          <SelectItem value="CERRADO_GANADO">Cerrado ganado</SelectItem>
          <SelectItem value="CERRADO_PERDIDO">Cerrado perdido</SelectItem>
        </SelectContent>
      </Select>

      <Input type="date" placeholder="Ultimo contacto" {...form.register("lastContactAt")} />
      <Input type="date" placeholder="Proximo seguimiento" {...form.register("nextFollowUpAt")} />

      <Textarea className="md:col-span-2" placeholder="Notas internas" {...form.register("notes")} />

      {form.formState.errors.contactName ? (
        <p className="md:col-span-2 text-sm text-red-300">{form.formState.errors.contactName.message}</p>
      ) : null}

      <Button type="submit" className="md:col-span-2 bg-primary hover:bg-primary/90 text-black font-semibold">Guardar lead rapido</Button>
    </form>
  );
}

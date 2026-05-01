"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { clientSchema } from "@/lib/validations";

export function ClientForm({ onSaved }: { onSaved: () => void }) {
  const form = useForm({ resolver: zodResolver(clientSchema), defaultValues: { businessName: "", contactName: "", phone: "", email: "", service: "", city: "", state: "", plan: "Plan base", setupFee: 400, monthlyFee: 200, status: "ACTIVO", startDate: new Date().toISOString().split("T")[0] } });
  const onSubmit = form.handleSubmit(async (values) => { await fetch("/api/clients", { method: "POST", body: JSON.stringify(values) }); form.reset(); onSaved(); });
  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
      <Input placeholder="Negocio" {...form.register("businessName")} />
      <Input placeholder="Contacto" {...form.register("contactName")} />
      <Input placeholder="Telefono" {...form.register("phone")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Servicio" {...form.register("service")} />
      <Input placeholder="Ciudad" {...form.register("city")} />
      <Input placeholder="Estado" {...form.register("state")} />
      <Input placeholder="Plan" {...form.register("plan")} />
      <Input type="number" placeholder="Setup" {...form.register("setupFee")} />
      <Input type="number" placeholder="Mensualidad" {...form.register("monthlyFee")} />
      <Input type="date" {...form.register("startDate")} />
      <Select defaultValue="ACTIVO" onValueChange={(v) => form.setValue("status", v ?? "ACTIVO")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVO">Activo</SelectItem><SelectItem value="PAUSADO">Pausado</SelectItem><SelectItem value="CANCELADO">Cancelado</SelectItem></SelectContent></Select>
      <Textarea className="md:col-span-2" placeholder="Notas internas" {...form.register("internalNotes")} />
      <Button type="submit" className="md:col-span-2 bg-primary text-black">Guardar cliente</Button>
    </form>
  );
}

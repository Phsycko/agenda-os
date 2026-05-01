"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { crmClientFormSchema } from "@/lib/validations";
import type { ClientStatus } from "@/lib/crm/types";

export function ClientForm({ onSaved, onClose }: { onSaved?: () => void; onClose?: () => void }) {
  const { createClient, state, setModalOpen } = useCrm();
  const form = useForm({
    resolver: zodResolver(crmClientFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      phone: "",
      email: "",
      city: "",
      serviceContracted: "",
      monthlyFee: 0,
      initialPayment: 0,
      status: "ACTIVO" as ClientStatus,
      startDate: new Date().toISOString().split("T")[0],
      sellerId: "__none" as string | null,
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createClient({
      businessName: values.businessName,
      contactName: values.contactName,
      phone: values.phone,
      email: values.email || null,
      city: values.city,
      serviceContracted: values.serviceContracted,
      monthlyFee: values.monthlyFee,
      initialPayment: values.initialPayment,
      status: values.status,
      startDate: values.startDate,
      sellerId: !values.sellerId || values.sellerId === "__none" ? null : values.sellerId,
      notes: values.notes || null,
      convertedFromLeadId: null,
    });
    form.reset();
    onSaved?.();
    onClose?.();
    setModalOpen(null);
  });

  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
      <Input placeholder="Negocio" {...form.register("businessName")} />
      <Input placeholder="Contacto principal" {...form.register("contactName")} />
      <Input placeholder="Teléfono" {...form.register("phone")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Ciudad" {...form.register("city")} />
      <Input placeholder="Servicio contratado" {...form.register("serviceContracted")} />
      <Input type="number" placeholder="Mensualidad" {...form.register("monthlyFee")} />
      <Input type="number" placeholder="Pago inicial" {...form.register("initialPayment")} />
      <Input type="date" {...form.register("startDate")} />
      <Select defaultValue="ACTIVO" onValueChange={(v) => form.setValue("status", (v ?? "ACTIVO") as ClientStatus)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVO">Activo</SelectItem>
          <SelectItem value="PAUSADO">Pausado</SelectItem>
          <SelectItem value="CANCELADO">Cancelado</SelectItem>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="__none" onValueChange={(v) => form.setValue("sellerId", v === "__none" ? null : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Vendedor responsable" />
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
      <Textarea className="md:col-span-2" placeholder="Notas" {...form.register("notes")} />
      <Button type="submit" className="md:col-span-2 bg-primary text-black">
        Guardar cliente
      </Button>
    </form>
  );
}

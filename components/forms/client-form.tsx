"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/components/providers/crm-provider";
import { LeadNichePicker } from "@/components/forms/lead-niche-picker";
import { isValidLeadNicheId } from "@/lib/crm/lead-niches";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/lib/crm/types";
import { crmClientFormSchema } from "@/lib/validations";

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
      sector: "",
      serviceContracted: "",
      monthlyFee: 0,
      initialPayment: 0,
      status: "ACTIVO" as ClientStatus,
      startDate: new Date().toISOString().split("T")[0],
      sellerId: "",
      notes: "",
    },
  });

  const [status, sellerId, sector] = useWatch({
    control: form.control,
    name: ["status", "sellerId", "sector"],
  });

  const onSubmit = form.handleSubmit((values) => {
    createClient({
      businessName: values.businessName,
      contactName: values.contactName,
      phone: values.phone,
      email: values.email || null,
      city: values.city,
      sector: values.sector && isValidLeadNicheId(values.sector) ? values.sector : null,
      serviceContracted: values.serviceContracted,
      monthlyFee: values.monthlyFee,
      initialPayment: values.initialPayment,
      status: values.status,
      startDate: values.startDate,
      sellerId: values.sellerId?.trim() ? values.sellerId : null,
      notes: values.notes || null,
      convertedFromLeadId: null,
    });
    form.reset();
    onSaved?.();
    onClose?.();
    setModalOpen(null);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2 rounded-xl border border-border/70 bg-[#0a0a0a] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Negocio y contacto</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Nombre del negocio</Label>
            <Input className="h-9" placeholder="Negocio" {...form.register("businessName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Contacto principal</Label>
            <Input className="h-9" placeholder="Nombre" {...form.register("contactName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Teléfono</Label>
            <Input className="h-9" placeholder="Teléfono" {...form.register("phone")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input className="h-9" placeholder="Email" {...form.register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ciudad</Label>
            <Input className="h-9" placeholder="Ciudad" {...form.register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Giro / nicho</Label>
            <LeadNichePicker
              value={sector && isValidLeadNicheId(sector) ? sector : null}
              onChange={(next) => form.setValue("sector", next ?? "")}
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-2 rounded-xl border border-border/70 bg-[#0a0a0a] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Contrato</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Servicio contratado</Label>
            <Input className="h-9" placeholder="Ej. SEO + Ads" {...form.register("serviceContracted")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Mensualidad (USD)</Label>
            <Input className="h-9" type="number" placeholder="0" {...form.register("monthlyFee")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pago inicial (USD)</Label>
            <Input className="h-9" type="number" placeholder="0" {...form.register("initialPayment")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Inicio de contrato</Label>
            <Input className="h-9" type="date" {...form.register("startDate")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select value={status || "ACTIVO"} onValueChange={(v) => form.setValue("status", (v ?? "ACTIVO") as ClientStatus)}>
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue>
                  {(v) => (v ? CLIENT_STATUS_LABELS[v as ClientStatus] ?? String(v) : "")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(["ACTIVO", "PAUSADO", "CANCELADO", "PENDIENTE"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {CLIENT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Vendedor responsable</Label>
            <Select
              value={sellerId?.trim() ? sellerId : "__none"}
              onValueChange={(v) => form.setValue("sellerId", v === "__none" ? "" : (v ?? ""))}
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Sin asignar">
                  {(v) =>
                    !v || v === "__none"
                      ? "Sin asignar"
                      : state.sellers.find((s) => s.id === v)?.name ?? "Vendedor"
                  }
                </SelectValue>
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
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Notas</Label>
        <Textarea className="min-h-[88px] resize-y" placeholder="Contexto del cliente…" {...form.register("notes")} />
      </div>

      <Button type="submit" className="md:col-span-2 bg-primary text-black font-semibold">
        Guardar cliente
      </Button>
    </form>
  );
}

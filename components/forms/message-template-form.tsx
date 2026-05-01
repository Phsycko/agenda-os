"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { templateCrmSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import { MESSAGE_CHANNELS, MESSAGE_TEMPLATE_TYPES, type MessageChannel, type MessageTemplateType } from "@/lib/crm/types";

export function MessageTemplateForm({ onSaved, onClose }: { onSaved?: () => void; onClose?: () => void }) {
  const { createTemplate, setModalOpen } = useCrm();
  const form = useForm({
    resolver: zodResolver(templateCrmSchema),
    defaultValues: {
      title: "",
      templateType: "PRIMER_CONTACTO" as MessageTemplateType,
      niche: "General",
      channel: "WHATSAPP" as MessageChannel,
      body: "",
    },
  });

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((v) => {
        createTemplate({
          title: v.title,
          templateType: v.templateType as MessageTemplateType,
          niche: v.niche || null,
          channel: v.channel as MessageChannel,
          body: v.body,
        });
        form.reset();
        onSaved?.();
        onClose?.();
        setModalOpen(null);
      })}
    >
      <Input placeholder="Título" {...form.register("title")} />
      <Select defaultValue="PRIMER_CONTACTO" onValueChange={(v) => form.setValue("templateType", (v ?? "PRIMER_CONTACTO") as MessageTemplateType)}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          {MESSAGE_TEMPLATE_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Nicho" {...form.register("niche")} />
      <Select defaultValue="WHATSAPP" onValueChange={(v) => form.setValue("channel", (v ?? "WHATSAPP") as MessageChannel)}>
        <SelectTrigger>
          <SelectValue placeholder="Canal" />
        </SelectTrigger>
        <SelectContent>
          {MESSAGE_CHANNELS.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea rows={8} placeholder="Texto (usa {{nombre}}, {{negocio}}, {{servicio}}, {{vendedor}})" {...form.register("body")} />
      <Button type="submit" className="bg-primary text-black">
        Guardar plantilla
      </Button>
    </form>
  );
}

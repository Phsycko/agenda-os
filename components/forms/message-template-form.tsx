"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { templateSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function MessageTemplateForm({ onSaved }: { onSaved: () => void }) {
  const form = useForm<z.infer<typeof templateSchema>>({ resolver: zodResolver(templateSchema), defaultValues: { name: "", category: "DM", niche: "general", content: "" } });
  return <form className="grid gap-3" onSubmit={form.handleSubmit(async (v)=>{ await fetch('/api/messages/templates',{method:'POST', body: JSON.stringify(v)}); onSaved(); form.reset();})}>
    <Input placeholder="Nombre" {...form.register("name")} />
    <Input placeholder="Categoria" {...form.register("category")} />
    <Input placeholder="Nicho" {...form.register("niche")} />
    <Textarea placeholder="Contenido" {...form.register("content")} />
    <Button type="submit" className="bg-primary text-black">Guardar plantilla</Button>
  </form>
}

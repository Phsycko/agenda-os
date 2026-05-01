"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { taskSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TaskForm({ onSaved }: { onSaved: () => void }) {
  const form = useForm<z.infer<typeof taskSchema>>({ resolver: zodResolver(taskSchema), defaultValues: { title: "", description: "", status: "PENDIENTE", priority: "MEDIA" } });
  return <form className="grid gap-3" onSubmit={form.handleSubmit(async (v)=>{ await fetch('/api/tasks',{method:'POST', body: JSON.stringify(v)}); onSaved(); form.reset();})}>
    <Input placeholder="Titulo" {...form.register("title")} />
    <Textarea placeholder="Descripcion" {...form.register("description")} />
    <div className="grid grid-cols-2 gap-3">
      <Select defaultValue="PENDIENTE" onValueChange={(v)=>form.setValue("status",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="EN_PROGRESO">En progreso</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select>
      <Select defaultValue="MEDIA" onValueChange={(v)=>form.setValue("priority",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="BAJA">Baja</SelectItem><SelectItem value="MEDIA">Media</SelectItem><SelectItem value="ALTA">Alta</SelectItem><SelectItem value="URGENTE">Urgente</SelectItem></SelectContent></Select>
    </div>
    <Button type="submit" className="bg-primary text-black">Guardar tarea</Button>
  </form>
}

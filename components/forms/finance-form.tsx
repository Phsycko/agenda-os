"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { financeSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function FinanceForm({ onSaved }: { onSaved: () => void }) {
  const form = useForm({ resolver: zodResolver(financeSchema), defaultValues: { type: "INCOME", category: "Setup", amount: 0, concept: "", date: new Date().toISOString().split("T")[0] } });
  return <form className="grid gap-3" onSubmit={form.handleSubmit(async (v)=>{ await fetch('/api/finance',{method:'POST', body: JSON.stringify(v)}); onSaved(); form.reset();})}>
    <div className="grid grid-cols-2 gap-3">
      <Select defaultValue="INCOME" onValueChange={(v)=>form.setValue("type", (v ?? "INCOME") as "INCOME"|"EXPENSE")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INCOME">Ingreso</SelectItem><SelectItem value="EXPENSE">Egreso</SelectItem></SelectContent></Select>
      <Input placeholder="Categoria" {...form.register("category")} />
    </div>
    <Input type="number" placeholder="Monto" {...form.register("amount")} />
    <Input placeholder="Concepto" {...form.register("concept")} />
    <Input type="date" {...form.register("date")} />
    <Textarea placeholder="Notas" {...form.register("notes")} />
    <Button type="submit" className="bg-primary text-black">Guardar movimiento</Button>
  </form>
}

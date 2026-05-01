"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { financeSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/components/providers/crm-provider";

export function FinanceForm({ onSaved, onClose }: { onSaved?: () => void; onClose?: () => void }) {
  const { createFinance, state, setModalOpen } = useCrm();
  const form = useForm({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      type: "INCOME" as "INCOME" | "EXPENSE",
      category: "Recurrente",
      amount: 0,
      concept: "",
      date: new Date().toISOString().split("T")[0],
      clientId: "__none",
      sellerId: "__none",
      notes: "",
    },
  });

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((v) => {
        createFinance({
          type: v.type,
          category: v.category,
          amount: v.amount,
          concept: v.concept,
          date: v.date,
          clientId: !v.clientId || v.clientId === "__none" ? null : v.clientId,
          sellerId: !v.sellerId || v.sellerId === "__none" ? null : v.sellerId,
          notes: v.notes || null,
        });
        form.reset();
        onSaved?.();
        onClose?.();
        setModalOpen(null);
      })}
    >
      <div className="grid grid-cols-2 gap-3">
        <Select defaultValue="INCOME" onValueChange={(v) => form.setValue("type", (v ?? "INCOME") as "INCOME" | "EXPENSE")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Ingreso</SelectItem>
            <SelectItem value="EXPENSE">Egreso</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Categoría" {...form.register("category")} />
      </div>
      <Input type="number" placeholder="Monto" {...form.register("amount")} />
      <Input placeholder="Concepto" {...form.register("concept")} />
      <Input type="date" {...form.register("date")} />
      <Select defaultValue="__none" onValueChange={(v) => form.setValue("clientId", v ?? "__none")}>
        <SelectTrigger>
          <SelectValue placeholder="Cliente (opcional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin cliente</SelectItem>
          {state.clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="__none" onValueChange={(v) => form.setValue("sellerId", v ?? "__none")}>
        <SelectTrigger>
          <SelectValue placeholder="Vendedor (opcional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none">Sin vendedor</SelectItem>
          {state.sellers.filter((s) => s.active).map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea placeholder="Notas" {...form.register("notes")} />
      <Button type="submit" className="bg-primary text-black">
        Guardar movimiento
      </Button>
    </form>
  );
}

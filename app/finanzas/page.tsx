"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinanceForm } from "@/components/forms/finance-form";
import { useCrm } from "@/components/providers/crm-provider";
import { financesInMonth } from "@/lib/crm/selectors";
import { canViewFinances } from "@/lib/crm/permissions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinanzasPage() {
  const { state, currentSeller, deleteFinance } = useCrm();
  const show = canViewFinances(currentSeller);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const range = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    return { start, end };
  }, [month]);

  const rows = useMemo(() => {
    return financesInMonth(state.finances, range.start, range.end).filter((f) => {
      return true;
    });
  }, [state.finances, range]);

  const totals = useMemo(() => {
    const income = rows.filter((r) => r.type === "INCOME").reduce((a, b) => a + b.amount, 0);
    const expenses = rows.filter((r) => r.type === "EXPENSE").reduce((a, b) => a + b.amount, 0);
    const active = state.clients.filter((c) => c.status === "ACTIVO").length;
    const recurring = state.clients.filter((c) => c.status === "ACTIVO").reduce((s, c) => s + c.monthlyFee, 0);
    const ticket = active ? recurring / active : 0;
    return { income, expenses, profit: income - expenses, recurring, ticket, active };
  }, [rows, state.clients]);

  if (!show) {
    return (
      <AppShell title="Finanzas">
        <EmptyState title="Acceso restringido" description="Solo administradores pueden ver y editar finanzas globales." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Finanzas">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Finanzas</h1>
            <p className="text-sm text-muted-foreground">Ingresos y egresos con relación opcional a clientes y vendedores.</p>
          </div>
          <Dialog>
            <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
              Registrar movimiento
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Nuevo movimiento</DialogTitle>
              </DialogHeader>
              <FinanceForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm text-muted-foreground">Mes</label>
          <InputMonth value={month} onChange={setMonth} />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Ingresos del mes</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-emerald-300">${totals.income.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Egresos del mes</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-red-300">${totals.expenses.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Utilidad</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">${totals.profit.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Recurrente mensual (MRR proxy)</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">${totals.recurring.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Clientes activos</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{totals.active}</CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Ticket promedio (mensualidad)</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">${totals.ticket.toFixed(2)}</CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id} className="bg-card border-border">
              <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.concept}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} · {r.date}
                    {r.clientId ? ` · Cliente: ${state.clients.find((c) => c.id === r.clientId)?.businessName ?? ""}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className={r.type === "INCOME" ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                    {r.type === "INCOME" ? "+" : "-"}${r.amount.toFixed(2)}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => deleteFinance(r.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function InputMonth({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="month" className="rounded-md border border-border bg-[#111] px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />;
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinanceForm } from "@/components/forms/finance-form";
import { fetchJsonSafe } from "@/lib/utils";

export default function FinanzasPage() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async ()=> setRows(await fetchJsonSafe<any[]>('/api/finance', []));
  useEffect(()=>{load();},[]);
  const totals = useMemo(()=>{const income=rows.filter((r)=>r.type==='INCOME').reduce((a,b)=>a+b.amount,0);const expenses=rows.filter((r)=>r.type==='EXPENSE').reduce((a,b)=>a+b.amount,0);return {income,expenses,profit:income-expenses};},[rows]);
  return <AppShell title="Finanzas">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-semibold">Controla ingresos, egresos y utilidad real.</h1><Dialog><DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Registrar movimiento</DialogTrigger><DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Nuevo ingreso/egreso</DialogTitle></DialogHeader><FinanceForm onSaved={load} /></DialogContent></Dialog></div>
    <div className="grid md:grid-cols-3 gap-3 mb-4"><Card className="bg-card border-border"><CardHeader><CardTitle className="text-sm">Ingresos del mes</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">${totals.income.toFixed(2)}</CardContent></Card><Card className="bg-card border-border"><CardHeader><CardTitle className="text-sm">Egresos del mes</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">${totals.expenses.toFixed(2)}</CardContent></Card><Card className="bg-card border-border"><CardHeader><CardTitle className="text-sm">Utilidad</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">${totals.profit.toFixed(2)}</CardContent></Card></div>
    <div className="grid gap-3">{rows.map((r)=><Card key={r.id} className="bg-card border-border"><CardContent className="pt-4 flex items-center justify-between"><div><p className="font-semibold">{r.concept}</p><p className="text-xs text-muted-foreground">{r.category} - {new Date(r.date).toLocaleDateString()}</p></div><p className={r.type==='INCOME'?"text-green-400 font-semibold":"text-red-400 font-semibold"}>{r.type==='INCOME'?'+':'-'}${r.amount.toFixed(2)}</p></CardContent></Card>)}</div>
  </AppShell>
}

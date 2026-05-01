import { AppShell } from "@/components/layout/app-shell";
import { ReportsCharts } from "@/components/dashboard/reports-charts";
import { prisma } from "@/lib/prisma";

export default async function ReportesPage() {
  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>> = [];
  let finance: Awaited<ReturnType<typeof prisma.financeTransaction.findMany>> = [];
  let clients: Awaited<ReturnType<typeof prisma.client.findMany>> = [];
  try {
    [leads, finance, clients] = await Promise.all([
      prisma.lead.findMany(),
      prisma.financeTransaction.findMany(),
      prisma.client.findMany(),
    ]);
  } catch {
    // sin conexion DB: mostrar estado vacio
  }
  const bySource = Object.entries(leads.reduce((acc: Record<string, number>, lead)=>{acc[lead.source]=(acc[lead.source]||0)+1;return acc;},{})).map(([name,value])=>({name,value}));
  const byStage = Object.entries(leads.reduce((acc: Record<string, number>, lead)=>{acc[lead.stage]=(acc[lead.stage]||0)+1;return acc;},{})).map(([name,value])=>({name,value}));
  const byMonth = Object.entries(finance.reduce((acc: Record<string, number>, f)=>{if(f.type==='INCOME'){const k=`${f.date.getUTCMonth()+1}/${f.date.getUTCFullYear()}`;acc[k]=(acc[k]||0)+f.amount;}return acc;},{})).map(([month,value])=>({month,value}));
  return <AppShell title="Reportes">
    <div className="mb-4"><h1 className="text-2xl font-semibold">Reportes generales de operacion y resultados.</h1></div>
    <ReportsCharts bySource={bySource} byStage={byStage} byMonth={byMonth} />
    <p className="mt-4 text-sm text-muted-foreground">Clientes activos: {clients.filter((c)=>c.status==='ACTIVO').length}. Mejor fuente: {bySource.sort((a,b)=>b.value-a.value)[0]?.name ?? 'N/A'}.</p>
  </AppShell>
}

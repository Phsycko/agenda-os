import { AppShell } from "@/components/layout/app-shell";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>> = [];
  let clients: Awaited<ReturnType<typeof prisma.client.findMany>> = [];
  let appointments: Awaited<ReturnType<typeof prisma.appointment.findMany>> = [];
  let finances: Awaited<ReturnType<typeof prisma.financeTransaction.findMany>> = [];
  let tasks: Awaited<ReturnType<typeof prisma.task.findMany>> = [];

  try {
    [leads, clients, appointments, finances, tasks] = await Promise.all([
      prisma.lead.findMany(),
      prisma.client.findMany(),
      prisma.appointment.findMany(),
      prisma.financeTransaction.findMany(),
      prisma.task.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);
  } catch {
    // fallback elegante cuando la DB local aun no esta conectada
  }
  const income = finances.filter((f)=>f.type === "INCOME").reduce((a,b)=>a+b.amount,0);
  const expenses = finances.filter((f)=>f.type === "EXPENSE").reduce((a,b)=>a+b.amount,0);
  const closedWon = leads.filter((l)=>l.stage === "CERRADO_GANADO").length;
  const closeRate = leads.length ? ((closedWon / leads.length) * 100).toFixed(1) : "0";
  const bySource = Object.entries(leads.reduce((acc: Record<string, number>, lead)=>{acc[lead.source]=(acc[lead.source]||0)+1;return acc;},{})).map(([name,value])=>({name,value}));
  const monthlyIncome = finances.reduce((acc: Record<string, number>, f)=>{const key=`${f.date.getUTCMonth()+1}/${f.date.getUTCFullYear()}`; if(f.type==="INCOME") acc[key]=(acc[key]||0)+f.amount; return acc;},{});
  const incomeData = Object.entries(monthlyIncome).map(([month,value])=>({month,value}));

  return <AppShell title="Dashboard">
    <div className="mb-6"><h1 className="text-2xl font-semibold">Control total de tus leads, clientes y dinero.</h1></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
      <StatCard title="Leads totales" value={`${leads.length}`} />
      <StatCard title="Demos agendadas" value={`${appointments.filter((a)=>a.type==="DEMO").length}`} />
      <StatCard title="Clientes activos" value={`${clients.filter((c)=>c.status==="ACTIVO").length}`} />
      <StatCard title="Tasa de cierre" value={`${closeRate}%`} />
      <StatCard title="Ingresos del mes" value={`$${income.toFixed(2)}`} />
      <StatCard title="Egresos del mes" value={`$${expenses.toFixed(2)}`} />
      <StatCard title="Utilidad estimada" value={`$${(income-expenses).toFixed(2)}`} />
      <StatCard title="Leads nuevos" value={`${leads.filter((l)=>(Date.now()-l.createdAt.getTime()) < 1000*60*60*24*7).length}`} helper="Ultimos 7 dias" />
    </div>
    <DashboardCharts bySource={bySource} incomeData={incomeData} />
    <Card className="bg-card border-border"><CardHeader><CardTitle>Actividad reciente</CardTitle></CardHeader><CardContent className="space-y-2">{tasks.length ? tasks.map((task)=><div key={task.id} className="text-sm border-b border-border pb-2">{task.title} - <span className="text-muted-foreground">{task.status.replaceAll('_',' ')}</span></div>) : <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>}</CardContent></Card>
  </AppShell>;
}

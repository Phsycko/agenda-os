import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [leads, clients, appointments, finance] = await Promise.all([prisma.lead.findMany(), prisma.client.findMany(), prisma.appointment.findMany(), prisma.financeTransaction.findMany()]);
  const income = finance.filter((t)=>t.type==='INCOME').reduce((a,b)=>a+b.amount,0);
  const expenses = finance.filter((t)=>t.type==='EXPENSE').reduce((a,b)=>a+b.amount,0);
  return NextResponse.json({ leadsTotal: leads.length, leadsNewWeek: leads.filter((l)=>(Date.now()-l.createdAt.getTime()) < 604800000).length, demos: appointments.filter((a)=>a.type==='DEMO').length, clientsActive: clients.filter((c)=>c.status==='ACTIVO').length, incomeMonth: income, expenseMonth: expenses, estimatedProfit: income-expenses, closeRate: leads.length ? (leads.filter((l)=>l.stage==='CERRADO_GANADO').length / leads.length) * 100 : 0 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [leads, finance] = await Promise.all([prisma.lead.findMany(), prisma.financeTransaction.findMany()]);
  const leadsBySource = Object.entries(leads.reduce((acc: Record<string, number>, lead) => {acc[lead.source] = (acc[lead.source] || 0) + 1; return acc;}, {})).map(([name, value]) => ({ name, value }));
  const leadsByStage = Object.entries(leads.reduce((acc: Record<string, number>, lead) => {acc[lead.stage] = (acc[lead.stage] || 0) + 1; return acc;}, {})).map(([name, value]) => ({ name, value }));
  const incomeByMonth = Object.entries(finance.reduce((acc: Record<string, number>, t) => {if(t.type==='INCOME'){const k=`${t.date.getUTCMonth()+1}/${t.date.getUTCFullYear()}`;acc[k]=(acc[k]||0)+t.amount;} return acc;}, {})).map(([month, value]) => ({ month, value }));
  return NextResponse.json({ leadsBySource, leadsByStage, incomeByMonth });
}

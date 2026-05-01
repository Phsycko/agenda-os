import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { financeSchema } from "@/lib/validations";

export async function GET() {
  try {
    return NextResponse.json(await prisma.financeTransaction.findMany({ orderBy: { date: "desc" } }));
  } catch {
    return NextResponse.json([]);
  }
}
export async function POST(req: Request) {
  const parsed = financeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  return NextResponse.json(await prisma.financeTransaction.create({ data: { ...data, date: new Date(data.date) } }), { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";

export async function GET() {
  try {
    return NextResponse.json(await prisma.client.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return NextResponse.json([]);
  }
}
export async function POST(req: Request) {
  const parsed = clientSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const client = await prisma.client.create({ data: { ...data, email: data.email || null, startDate: new Date(data.startDate) } });
  return NextResponse.json(client, { status: 201 });
}

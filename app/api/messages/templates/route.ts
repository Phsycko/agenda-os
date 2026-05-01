import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { templateSchema } from "@/lib/validations";

export async function GET() {
  try {
    return NextResponse.json(await prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return NextResponse.json([]);
  }
}
export async function POST(req: Request) {
  const parsed = templateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await prisma.messageTemplate.create({ data: parsed.data }), { status: 201 });
}

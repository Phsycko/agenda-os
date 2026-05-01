import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";

export async function GET() {
  try {
    return NextResponse.json(await prisma.task.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    return NextResponse.json([]);
  }
}
export async function POST(req: Request) {
  const parsed = taskSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  return NextResponse.json(await prisma.task.create({ data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null } }), { status: 201 });
}

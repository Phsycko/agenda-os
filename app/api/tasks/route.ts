import { NextResponse } from "next/server";
import type { TaskPriority, TaskStatus } from "@prisma/client";
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
  const { dueDate, status, priority, leadId, clientId, ...rest } = data;
  const task = await prisma.task.create({
    data: {
      title: rest.title,
      description: rest.description ?? null,
      status: status as TaskStatus,
      priority: priority as TaskPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      leadId: leadId?.trim() ? leadId.trim() : null,
      clientId: clientId?.trim() ? clientId.trim() : null,
    },
  });
  return NextResponse.json(task, { status: 201 });
}

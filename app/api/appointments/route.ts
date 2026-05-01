import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const relation = searchParams.get("relation");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (type && type !== "ALL") where.type = type;
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (relation === "LEAD") where.leadId = { not: null };
    if (relation === "CLIENTE") where.clientId = { not: null };
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const data = await prisma.appointment.findMany({
      where,
      include: {
        lead: { select: { id: true, businessName: true, contactName: true, phone: true, service: true, city: true } },
        client: { select: { id: true, businessName: true, contactName: true, phone: true, service: true, city: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const parsed = appointmentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const appointment = await prisma.appointment.create({
    data: {
      ...data,
      date: new Date(data.date),
      leadId: !data.leadId || data.leadId === "__none" ? null : data.leadId,
      clientId: !data.clientId || data.clientId === "__none" ? null : data.clientId,
      notes: data.notes || null,
      nextAction: data.nextAction || null,
      meetingLink: data.meetingLink || null,
      location: data.location || null,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

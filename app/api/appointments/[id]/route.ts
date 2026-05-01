import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.appointment.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, businessName: true, contactName: true, phone: true, service: true, city: true } },
      client: { select: { id: true, businessName: true, contactName: true, phone: true, service: true, city: true } },
    },
  });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...body,
      leadId: body.leadId === "" || body.leadId === "__none" ? null : body.leadId,
      clientId: body.clientId === "" || body.clientId === "__none" ? null : body.clientId,
      date: body.date ? new Date(body.date) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFallbackLeads, setFallbackLeads } from "@/lib/lead-fallback-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return NextResponse.json(await prisma.lead.findUnique({ where: { id } }));
  } catch {
    const lead = getFallbackLeads().find((item) => item.id === id) ?? null;
    return NextResponse.json(lead);
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const patched = {
    ...body,
    email: body.email === "" ? null : body.email,
    notes: body.notes === "" ? null : body.notes,
    lastContactAt: body.lastContactAt ? new Date(body.lastContactAt) : body.lastContactAt === "" ? null : undefined,
    nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : body.nextFollowUpAt === "" ? null : undefined,
  };
  try {
    return NextResponse.json(await prisma.lead.update({ where: { id }, data: patched }));
  } catch {
    const list = getFallbackLeads();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    const updated = { ...list[idx], ...patched, updatedAt: new Date() };
    const clone = [...list];
    clone[idx] = updated;
    setFallbackLeads(clone);
    return NextResponse.json(updated);
  }
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    const list = getFallbackLeads();
    setFallbackLeads(list.filter((item) => item.id !== id));
    return NextResponse.json({ ok: true });
  }
}

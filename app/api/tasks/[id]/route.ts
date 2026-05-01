import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; return NextResponse.json(await prisma.task.findUnique({ where: { id } })); }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; return NextResponse.json(await prisma.task.update({ where: { id }, data: await req.json() })); }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; await prisma.task.delete({ where: { id } }); return NextResponse.json({ ok: true }); }

import { NextResponse } from "next/server";
import { readPersonalItems, writePersonalItems } from "@/lib/personal-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const items = await readPersonalItems();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  items[idx] = {
    ...items[idx],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  await writePersonalItems(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await readPersonalItems();
  await writePersonalItems(items.filter((item) => item.id !== id));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { readPersonalItems, writePersonalItems } from "@/lib/personal-store";

export async function GET() {
  const items = await readPersonalItems();
  return NextResponse.json(items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = new Date().toISOString();
  const newItem = {
    id: crypto.randomUUID(),
    type: body.type ?? "NOTE",
    title: body.title?.trim() || "Item personal",
    content: body.content?.trim() || "",
    date: body.date || undefined,
    time: body.time || undefined,
    status: body.status ?? "PENDIENTE",
    priority: body.priority ?? "MEDIA",
    tags: Array.isArray(body.tags) ? body.tags : [],
    createdAt: now,
    updatedAt: now,
  };

  const items = await readPersonalItems();
  items.unshift(newItem);
  await writePersonalItems(items);
  return NextResponse.json(newItem, { status: 201 });
}

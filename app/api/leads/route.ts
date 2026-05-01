import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { getFallbackLeads, setFallbackLeads } from "@/lib/lead-fallback-store";

export async function GET() {
  try {
    return NextResponse.json(await prisma.lead.findMany({ orderBy: { createdAt: "desc" } }));
  } catch {
    const fallback = getFallbackLeads().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return NextResponse.json(fallback);
  }
}
export async function POST(req: Request) {
  const parsed = leadSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const contactName = data.contactName?.trim() || data.businessName?.trim() || "Sin nombre";
  const businessName = data.businessName?.trim() || data.contactName?.trim() || "Prospecto sin negocio";
  const normalizedData = {
    contactName,
    businessName,
    phone: data.phone?.trim() || "No registrado",
    email: data.email || null,
    service: data.service?.trim() || "Pendiente definir",
    city: data.city?.trim() || "Sin ciudad",
    state: data.state?.trim() || "N/A",
    source: (data.source as
      | "FACEBOOK"
      | "INSTAGRAM"
      | "GOOGLE_MAPS"
      | "REFERIDO"
      | "WEB"
      | "OTRO") ?? "OTRO",
    temperature: (data.temperature as "FRIO" | "TIBIO" | "CALIENTE") ?? "FRIO",
    stage: (data.stage as
      | "NUEVO"
      | "CONTACTADO"
      | "INTERESADO"
      | "DEMO_AGENDADA"
      | "DEMO_REALIZADA"
      | "PROPUESTA_ENVIADA"
      | "CERRADO_GANADO"
      | "CERRADO_PERDIDO") ?? "NUEVO",
    estimatedValue: data.estimatedValue ?? null,
    notes: data.notes || null,
    lastContactAt: data.lastContactAt ? new Date(data.lastContactAt) : null,
    nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
  };

  try {
    const lead = await prisma.lead.create({
      data: normalizedData,
    });
    return NextResponse.json(lead, { status: 201 });
  } catch {
    const now = new Date();
    const fallbackLead = {
      id: crypto.randomUUID(),
      ...normalizedData,
      createdAt: now,
      updatedAt: now,
    };
    const current = getFallbackLeads();
    setFallbackLeads([fallbackLead, ...current]);
    return NextResponse.json(fallbackLead, { status: 201 });
  }
}

type FallbackLead = {
  id: string;
  contactName: string;
  businessName: string;
  phone: string;
  email: string | null;
  service: string;
  city: string;
  state: string;
  source: "FACEBOOK" | "INSTAGRAM" | "GOOGLE_MAPS" | "REFERIDO" | "WEB" | "OTRO";
  temperature: "FRIO" | "TIBIO" | "CALIENTE";
  stage: "NUEVO" | "CONTACTADO" | "INTERESADO" | "DEMO_AGENDADA" | "DEMO_REALIZADA" | "PROPUESTA_ENVIADA" | "CERRADO_GANADO" | "CERRADO_PERDIDO";
  estimatedValue: number | null;
  notes: string | null;
  lastContactAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const globalForLeads = globalThis as unknown as {
  fallbackLeads: FallbackLead[] | undefined;
};

if (!globalForLeads.fallbackLeads) {
  globalForLeads.fallbackLeads = [];
}

export function getFallbackLeads() {
  return globalForLeads.fallbackLeads ?? [];
}

export function setFallbackLeads(leads: FallbackLead[]) {
  globalForLeads.fallbackLeads = leads;
}

export type { FallbackLead };

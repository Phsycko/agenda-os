import type { AppSettings, CrmState, DemoIds } from "./types";
import { LEAD_SOURCES, LEAD_STAGES, newId, nowIso } from "./types";

export function defaultSettings(): AppSettings {
  return {
    companyName: "ClientBoost",
    brandText: "ClientBoost OS",
    currency: "USD",
    pipelineStages: [...LEAD_STAGES],
    leadSources: [...LEAD_SOURCES],
    servicesOffered: ["SEO Local", "Ads Meta", "Automatización WhatsApp", "Branding", "Sitio web"],
    theme: "dark",
  };
}

export function emptyCrmState(): CrmState {
  const adminId = newId();
  const now = nowIso();
  return {
    version: 1,
    settings: defaultSettings(),
    currentUserId: adminId,
    sellers: [
      {
        id: adminId,
        name: "Admin Principal",
        email: "admin@clientboost.local",
        phone: null,
        role: "ADMIN",
        active: true,
        monthlyGoal: 50000,
        commissionPct: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    leads: [],
    clients: [],
    appointments: [],
    tasks: [],
    messageTemplates: [],
    finances: [],
    personalItems: [],
    activityLog: [],
    demoIds: null,
  };
}

/** Precargadas profesionales — variables: {{nombre}}, {{negocio}}, {{servicio}}, {{vendedor}} */
export function builtInTemplates(): Omit<CrmState["messageTemplates"][number], "id" | "createdAt" | "updatedAt">[] {
  return [
    {
      title: "Primer contacto — valor en 30s",
      templateType: "PRIMER_CONTACTO",
      niche: "Servicios locales",
      channel: "WHATSAPP",
      body: "Hola {{nombre}}, soy {{vendedor}} de ClientBoost. Vi {{negocio}} y armamos estrategias para llenar la agenda con {{servicio}} sin depender solo de recomendados. ¿Te parece si te comparto en 2 min cómo lo hacemos?",
    },
    {
      title: "Follow-up suave post lead",
      templateType: "FOLLOW_UP",
      niche: "General",
      channel: "WHATSAPP",
      body: "{{nombre}}, te escribo para no perder el hilo con {{negocio}}. ¿Sigues evaluando {{servicio}}? Si quieres, te mando un mini plan sin compromiso.",
    },
    {
      title: "Después de demo — siguiente paso",
      templateType: "DESPUES_DEMO",
      niche: "General",
      channel: "EMAIL",
      body: "Hola {{nombre}},\n\nGracias por tu tiempo con {{negocio}}. Quedamos en avanzar con {{servicio}}; el siguiente paso es [propuesta / diagnóstico / acceso].\n\nQuedo atento,\n{{vendedor}}",
    },
    {
      title: "Propuesta enviada",
      templateType: "PROPUESTA",
      niche: "General",
      channel: "EMAIL",
      body: "{{nombre}},\n\nTe envié la propuesta para {{negocio}} centrada en {{servicio}}. ¿Podemos revisar dudas mañana en un call de 15 min?\n\n{{vendedor}}",
    },
    {
      title: "Cierre — decisión",
      templateType: "CIERRE",
      niche: "General",
      channel: "WHATSAPP",
      body: "{{nombre}}, para arrancar con {{servicio}} en {{negocio}} solo falta confirmar inicio y datos de facturación. ¿Te parece que lo dejemos listo hoy?",
    },
    {
      title: "Reactivación lead frío",
      templateType: "REACTIVACION",
      niche: "General",
      channel: "INSTAGRAM",
      body: "Hola {{nombre}}, retomamos {{negocio}}: tenemos un par de ideas nuevas para {{servicio}}. Si te interesa, te las mando en audio.",
    },
    {
      title: "Cliente activo — check-in",
      templateType: "CLIENTE_ACTIVO",
      niche: "Retención",
      channel: "WHATSAPP",
      body: "Hola {{nombre}}, paso a ver cómo van los resultados de {{servicio}} con {{negocio}}. ¿Algún ajuste que quieras priorizar esta semana? — {{vendedor}}",
    },
    {
      title: "Cobranza amable",
      templateType: "COBRANZA",
      niche: "General",
      channel: "WHATSAPP",
      body: "Hola {{nombre}}, te recuerdo el corte de {{servicio}} para {{negocio}}. ¿Necesitas factura o comprobante? Cualquier cosa me dices. {{vendedor}}",
    },
  ];
}

export function createDemoState(base: CrmState): { state: CrmState; demoIds: DemoIds } {
  const t = nowIso();
  const s1 = newId();
  const s2 = newId();
  const s3 = newId();
  const sellers: CrmState["sellers"] = [
    ...base.sellers,
    {
      id: s1,
      name: "María López",
      email: "maria@clientboost.local",
      phone: "+52 55 1000 0001",
      role: "VENDEDOR",
      active: true,
      monthlyGoal: 80000,
      commissionPct: 8,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: s2,
      name: "Carlos Ruiz",
      email: "carlos@clientboost.local",
      phone: "+52 55 1000 0002",
      role: "VENDEDOR",
      active: true,
      monthlyGoal: 60000,
      commissionPct: 7,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: s3,
      name: "Ana Viewer",
      email: "ana.viewer@clientboost.local",
      phone: null,
      role: "VIEWER",
      active: true,
      monthlyGoal: null,
      commissionPct: null,
      createdAt: t,
      updatedAt: t,
    },
  ];

  const leadIds = [newId(), newId(), newId(), newId(), newId()];
  const leads: CrmState["leads"] = [
    {
      id: leadIds[0],
      contactName: "Luis Gómez",
      businessName: "Gómez Roofing",
      phone: "+52 55 2000 0001",
      email: "luis@gomezroofing.test",
      city: "CDMX",
      sector: "ROOF_REPAIR",
      service: "SEO Local",
      source: "FACEBOOK",
      stage: "DEMO_AGENDADA",
      priority: "ALTA",
      assignedSellerId: s1,
      estimatedValue: 45000,
      createdAt: t,
      updatedAt: t,
      lastContactAt: t,
      nextFollowUpAt: t,
      nextAction: "Confirmar link de Meet",
      notes: "Interesado en paquete pro.",
      lossReason: null,
      internalNotes: [{ id: newId(), content: "Pidió casos de éxito en roofing.", createdAt: t, authorId: s1 }],
      contactHistory: [{ id: newId(), channel: "WHATSAPP", note: "Primera respuesta, quiere demo.", createdAt: t, authorId: s1 }],
    },
    {
      id: leadIds[1],
      contactName: "Patricia Mora",
      businessName: "CleanPro",
      phone: "+52 55 2000 0002",
      email: null,
      city: "Monterrey",
      sector: "HOUSE_CLEANING",
      service: "Ads Meta",
      source: "INSTAGRAM",
      stage: "INTERESADO",
      priority: "MEDIA",
      assignedSellerId: s2,
      estimatedValue: 32000,
      createdAt: t,
      updatedAt: t,
      lastContactAt: t,
      nextFollowUpAt: t,
      nextAction: "Enviar propuesta preliminar",
      notes: null,
      lossReason: null,
      internalNotes: [],
      contactHistory: [],
    },
    {
      id: leadIds[2],
      contactName: "Diego Páez",
      businessName: "Páez Landscaping",
      phone: "+52 55 2000 0003",
      email: "diego@paez.test",
      city: "Guadalajara",
      sector: "LANDSCAPING",
      service: "Automatización WhatsApp",
      source: "REFERIDO",
      stage: "NUEVO",
      priority: "URGENTE",
      assignedSellerId: s1,
      estimatedValue: 28000,
      createdAt: t,
      updatedAt: t,
      lastContactAt: null,
      nextFollowUpAt: null,
      nextAction: "Llamada de descubrimiento",
      notes: null,
      lossReason: null,
      internalNotes: [],
      contactHistory: [],
    },
    {
      id: leadIds[3],
      contactName: "Sofía Núñez",
      businessName: "Núnez Handyman",
      phone: "+52 55 2000 0004",
      email: "sofia@nunez.test",
      city: "Puebla",
      sector: "GENERAL_CONTRACTORS",
      service: "SEO Local",
      source: "WEB",
      stage: "PROPUESTA_ENVIADA",
      priority: "ALTA",
      assignedSellerId: s2,
      estimatedValue: 22000,
      createdAt: t,
      updatedAt: t,
      lastContactAt: t,
      nextFollowUpAt: t,
      nextAction: "Seguimiento cierre",
      notes: null,
      lossReason: null,
      internalNotes: [],
      contactHistory: [],
    },
    {
      id: leadIds[4],
      contactName: "Ricardo Leal",
      businessName: "Leal Construction",
      phone: "+52 55 2000 0005",
      email: null,
      city: "Querétaro",
      sector: "GENERAL_CONTRACTORS",
      service: "Branding",
      source: "WHATSAPP",
      stage: "CERRADO_PERDIDO",
      priority: "BAJA",
      assignedSellerId: s1,
      estimatedValue: 15000,
      createdAt: t,
      updatedAt: t,
      lastContactAt: t,
      nextFollowUpAt: null,
      nextAction: null,
      notes: "Presupuesto ajustado.",
      lossReason: "Precio",
      internalNotes: [],
      contactHistory: [],
    },
  ];

  const clientIds = [newId(), newId()];
  const clients: CrmState["clients"] = [
    {
      id: clientIds[0],
      businessName: "Martínez HVAC",
      contactName: "Jorge Martínez",
      phone: "+52 55 3000 0001",
      email: "jorge@martinez.test",
      city: "CDMX",
      serviceContracted: "SEO Local + Ads",
      monthlyFee: 18500,
      initialPayment: 9000,
      status: "ACTIVO",
      startDate: t.slice(0, 10),
      sellerId: s1,
      notes: "Cliente estrella Q1.",
      convertedFromLeadId: null,
      movementHistory: [{ id: newId(), note: "Alta de campaña completada.", createdAt: t }],
      monthlyPayments: [{ id: newId(), month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 18500, paidAt: t, notes: "Mensualidad" }],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: clientIds[1],
      businessName: "Ríos Dental",
      contactName: "Dra. Ríos",
      phone: "+52 55 3000 0002",
      email: null,
      city: "León",
      serviceContracted: "Sitio web",
      monthlyFee: 12000,
      initialPayment: 15000,
      status: "ACTIVO",
      startDate: t.slice(0, 10),
      sellerId: s2,
      notes: null,
      convertedFromLeadId: null,
      movementHistory: [],
      monthlyPayments: [],
      createdAt: t,
      updatedAt: t,
    },
  ];

  const appointmentIds = [newId(), newId(), newId(), newId()];
  const d = new Date();
  const ymd = (plus: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + plus);
    return x.toISOString().slice(0, 10);
  };
  const appointments: CrmState["appointments"] = [
    {
      id: appointmentIds[0],
      title: "Demo ClientBoost",
      date: ymd(0),
      time: "10:30",
      type: "DEMO",
      status: "PENDIENTE",
      leadId: leadIds[0],
      clientId: null,
      sellerId: s1,
      notes: "Enlace Meet en invitación.",
      nextAction: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: appointmentIds[1],
      title: "Seguimiento propuesta",
      date: ymd(1),
      time: "12:00",
      type: "SEGUIMIENTO",
      status: "PENDIENTE",
      leadId: leadIds[3],
      clientId: null,
      sellerId: s2,
      notes: null,
      nextAction: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: appointmentIds[2],
      title: "Revisión mensual",
      date: ymd(2),
      time: "09:00",
      type: "REVISION_MENSUAL",
      status: "PENDIENTE",
      leadId: null,
      clientId: clientIds[0],
      sellerId: s1,
      notes: null,
      nextAction: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: appointmentIds[3],
      title: "Pipeline interno",
      date: ymd(3),
      time: "17:00",
      type: "REUNION_INTERNA",
      status: "PENDIENTE",
      leadId: null,
      clientId: null,
      sellerId: null,
      notes: null,
      nextAction: null,
      createdAt: t,
      updatedAt: t,
    },
  ];

  const taskIds = [newId(), newId(), newId(), newId(), newId()];
  const tasks: CrmState["tasks"] = [
    { id: taskIds[0], title: "Preparar deck demo", description: "Incluir casos roofing", priority: "ALTA", status: "PENDIENTE", dueDate: ymd(0), sellerId: s1, leadId: leadIds[0], clientId: null, createdAt: t, updatedAt: t },
    { id: taskIds[1], title: "Enviar cotización formal", description: null, priority: "MEDIA", status: "EN_PROGRESO", dueDate: ymd(1), sellerId: s2, leadId: leadIds[3], clientId: null, createdAt: t, updatedAt: t },
    { id: taskIds[2], title: "Llamar lead referido", description: null, priority: "URGENTE", status: "PENDIENTE", dueDate: ymd(-1), sellerId: s1, leadId: leadIds[2], clientId: null, createdAt: t, updatedAt: t },
    { id: taskIds[3], title: "Actualizar CRM", description: "Notas CleanPro", priority: "BAJA", status: "COMPLETADA", dueDate: ymd(-2), sellerId: s2, leadId: leadIds[1], clientId: null, createdAt: t, updatedAt: t },
    { id: taskIds[4], title: "Checklist onboarding Martínez", description: null, priority: "MEDIA", status: "PENDIENTE", dueDate: ymd(4), sellerId: s1, leadId: null, clientId: clientIds[0], createdAt: t, updatedAt: t },
  ];

  const templateSeeds = builtInTemplates().slice(0, 5);
  const templateIds: string[] = [];
  const messageTemplates: CrmState["messageTemplates"] = templateSeeds.map((tpl) => {
    const id = newId();
    templateIds.push(id);
    return { ...tpl, id, createdAt: t, updatedAt: t };
  });

  const financeIds = [newId(), newId(), newId(), newId()];
  const finances: CrmState["finances"] = [
    { id: financeIds[0], type: "INCOME", concept: "Setup Martínez HVAC", amount: 9000, date: ymd(-5), category: "Setup", clientId: clientIds[0], sellerId: s1, notes: null, createdAt: t, updatedAt: t },
    { id: financeIds[1], type: "INCOME", concept: "Mensualidad Martínez", amount: 18500, date: ymd(-10), category: "Recurrente", clientId: clientIds[0], sellerId: s1, notes: null, createdAt: t, updatedAt: t },
    { id: financeIds[2], type: "INCOME", concept: "Mensualidad Ríos", amount: 12000, date: ymd(-12), category: "Recurrente", clientId: clientIds[1], sellerId: s2, notes: null, createdAt: t, updatedAt: t },
    { id: financeIds[3], type: "EXPENSE", concept: "Ads operativos", amount: 4200, date: ymd(-3), category: "Marketing", clientId: null, sellerId: null, notes: "Meta ads", createdAt: t, updatedAt: t },
  ];

  const demoIds: DemoIds = {
    leadIds,
    sellerIds: [s1, s2, s3],
    clientIds,
    taskIds,
    appointmentIds,
    templateIds,
    financeIds,
  };

  const activityLog: CrmState["activityLog"] = [
    {
      id: newId(),
      action: "DEMO_INSTALADA",
      entityType: "WORKSPACE",
      entityId: base.currentUserId,
      description: "Datos de demostración instalados.",
      createdAt: t,
      userId: base.currentUserId,
    },
  ];

  const state: CrmState = {
    ...base,
    sellers,
    leads,
    clients,
    appointments,
    tasks,
    messageTemplates,
    finances,
    demoIds,
    activityLog: [...(base.activityLog ?? []), ...activityLog].slice(-200),
    currentUserId: base.currentUserId,
  };

  return { state, demoIds };
}

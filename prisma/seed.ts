import {
  AppointmentPriority,
  AppointmentReminder,
  AppointmentStatus,
  AppointmentType,
  ClientStatus,
  LeadSource,
  LeadStage,
  LeadTemperature,
  PrismaClient,
  TaskPriority,
  TaskStatus,
  TransactionType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.clientProgress.deleteMany();
  await prisma.financeTransaction.deleteMany();
  await prisma.messageLog.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.task.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();

  const leads = await prisma.lead.createMany({
    data: [
      { contactName: "Carlos Rivera", businessName: "Rivera Roofing", phone: "5551111001", email: "carlos@riveraroofing.com", service: "Roofing", city: "Houston", state: "TX", source: LeadSource.FACEBOOK, temperature: LeadTemperature.CALIENTE, stage: LeadStage.INTERESADO, estimatedValue: 1800 },
      { contactName: "Luis Gomez", businessName: "Gomez Landscaping", phone: "5551111002", email: "luis@gomezlandscaping.com", service: "Landscaping", city: "Dallas", state: "TX", source: LeadSource.INSTAGRAM, temperature: LeadTemperature.TIBIO, stage: LeadStage.CONTACTADO, estimatedValue: 1200 },
      { contactName: "Ana Flores", businessName: "Flores Cleaning", phone: "5551111003", email: "", service: "Cleaning", city: "Miami", state: "FL", source: LeadSource.GOOGLE_MAPS, temperature: LeadTemperature.FRIO, stage: LeadStage.NUEVO, estimatedValue: 900 },
      { contactName: "Miguel Torres", businessName: "Torres Construction", phone: "5551111004", email: "miguel@torresconstruction.com", service: "Construction", city: "Phoenix", state: "AZ", source: LeadSource.REFERIDO, temperature: LeadTemperature.CALIENTE, stage: LeadStage.DEMO_AGENDADA, estimatedValue: 2400 },
      { contactName: "Diego Mena", businessName: "Mena Handyman", phone: "5551111005", email: "", service: "Handyman", city: "Las Vegas", state: "NV", source: LeadSource.WEB, temperature: LeadTemperature.TIBIO, stage: LeadStage.DEMO_REALIZADA, estimatedValue: 1400 },
      { contactName: "Jorge Leon", businessName: "Leon Roofing Pro", phone: "5551111006", email: "", service: "Roofing", city: "San Antonio", state: "TX", source: LeadSource.FACEBOOK, temperature: LeadTemperature.CALIENTE, stage: LeadStage.PROPUESTA_ENVIADA, estimatedValue: 2000 },
      { contactName: "Pedro Soto", businessName: "Soto Cleaning Team", phone: "5551111007", email: "", service: "Cleaning", city: "Orlando", state: "FL", source: LeadSource.OTRO, temperature: LeadTemperature.FRIO, stage: LeadStage.CERRADO_PERDIDO, estimatedValue: 800 },
      { contactName: "Ramon Cruz", businessName: "Cruz Landscaping", phone: "5551111008", email: "", service: "Landscaping", city: "Austin", state: "TX", source: LeadSource.GOOGLE_MAPS, temperature: LeadTemperature.CALIENTE, stage: LeadStage.CERRADO_GANADO, estimatedValue: 1600 },
    ],
  });

  const clients = await Promise.all([
    prisma.client.create({ data: { businessName: "Cruz Landscaping", contactName: "Ramon Cruz", phone: "5551111008", email: "", service: "Landscaping", city: "Austin", state: "TX", plan: "SEO Local + GBP", setupFee: 400, monthlyFee: 200, status: ClientStatus.ACTIVO, startDate: new Date("2026-03-01"), domain: "cruzlandscaping.com", websiteUrl: "https://cruzlandscaping.com", googleBusinessUrl: "https://maps.google.com", internalNotes: "Cliente consistente." } }),
    prisma.client.create({ data: { businessName: "Rivera Roofing", contactName: "Carlos Rivera", phone: "5551111001", email: "carlos@riveraroofing.com", service: "Roofing", city: "Houston", state: "TX", plan: "Web + SEO + Ads", setupFee: 800, monthlyFee: 450, status: ClientStatus.ACTIVO, startDate: new Date("2026-02-10"), domain: "riveraroofing.com", websiteUrl: "https://riveraroofing.com", googleBusinessUrl: "https://maps.google.com", internalNotes: "Buen retorno en llamadas." } }),
    prisma.client.create({ data: { businessName: "Flores Cleaning", contactName: "Ana Flores", phone: "5551111003", email: "", service: "Cleaning", city: "Miami", state: "FL", plan: "GBP Optimization", setupFee: 400, monthlyFee: 200, status: ClientStatus.PAUSADO, startDate: new Date("2026-01-20"), domain: "", websiteUrl: "", googleBusinessUrl: "", internalNotes: "Pausado por temporada." } }),
  ]);

  const leadRecords = await prisma.lead.findMany({ orderBy: { createdAt: "asc" } });
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  await prisma.appointment.createMany({
    data: [
      { title: "Demo Rivera Roofing", type: AppointmentType.DEMO, date: new Date(now.getTime() + day), time: "10:00", duration: 45, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.ALTA, nextAction: "Enviar propuesta en la tarde", reminder: AppointmentReminder.HOUR_1, leadId: leadRecords[0]?.id ?? null },
      { title: "Demo Gomez Landscaping", type: AppointmentType.DEMO, date: new Date(now.getTime() + day * 2), time: "12:00", duration: 45, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.MEDIA, nextAction: "Definir presupuesto", reminder: AppointmentReminder.MIN_15, leadId: leadRecords[1]?.id ?? null },
      { title: "Demo Torres Construction", type: AppointmentType.DEMO, date: new Date(now.getTime() + day * 3), time: "17:00", duration: 60, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.URGENTE, nextAction: "Cierre en llamada", reminder: AppointmentReminder.HOUR_1, leadId: leadRecords[3]?.id ?? null },
      { title: "Llamada seguimiento Flores", type: AppointmentType.LLAMADA, date: new Date(now.getTime() + day), time: "15:30", duration: 30, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.MEDIA, nextAction: "Resolver objeciones", reminder: AppointmentReminder.MIN_15, leadId: leadRecords[2]?.id ?? null },
      { title: "Follow-up Mena Handyman", type: AppointmentType.SEGUIMIENTO, date: new Date(now.getTime() + day * 4), time: "11:00", duration: 30, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.ALTA, nextAction: "Enviar demo personalizada", reminder: AppointmentReminder.DAY_1, leadId: leadRecords[4]?.id ?? null },
      { title: "Cobro mensual Rivera", type: AppointmentType.COBRO, date: new Date(now.getTime() + day * 2), time: "09:00", duration: 20, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.URGENTE, nextAction: "Registrar ingreso al confirmar", reminder: AppointmentReminder.DAY_1, clientId: clients[1].id },
      { title: "Revision mensual Cruz", type: AppointmentType.REVISION_MENSUAL, date: new Date(now.getTime() + day * 5), time: "13:00", duration: 60, status: AppointmentStatus.PENDIENTE, priority: AppointmentPriority.MEDIA, nextAction: "Actualizar reporte mensual", reminder: AppointmentReminder.HOUR_1, clientId: clients[0].id },
    ],
  });

  await prisma.task.createMany({
    data: [
      { title: "Crear demo Rivera", description: "Preparar presentacion", status: TaskStatus.EN_PROGRESO, priority: TaskPriority.ALTA },
      { title: "Mandar follow-up Gomez", status: TaskStatus.PENDIENTE, priority: TaskPriority.MEDIA },
      { title: "Revisar GBP Cruz", status: TaskStatus.PENDIENTE, priority: TaskPriority.ALTA, clientId: clients[0].id },
      { title: "Enviar propuesta Torres", status: TaskStatus.PENDIENTE, priority: TaskPriority.URGENTE },
      { title: "Cobrar mensualidad Rivera", status: TaskStatus.PENDIENTE, priority: TaskPriority.ALTA, clientId: clients[1].id },
      { title: "Actualizar reporte Flores", status: TaskStatus.PENDIENTE, priority: TaskPriority.MEDIA, clientId: clients[2].id },
      { title: "Landing handyman", status: TaskStatus.COMPLETADA, priority: TaskPriority.BAJA },
      { title: "Llamada de cierre", status: TaskStatus.EN_PROGRESO, priority: TaskPriority.URGENTE },
    ],
  });

  await prisma.messageTemplate.createMany({
    data: [
      { name: "Roofing apertura", category: "DM", niche: "roofing", content: "Oye bro, vi que haces roofing en {ciudad}. Te busque en Google y creo que estas perdiendo oportunidades. En ClientBoost ayudamos a negocios como el tuyo a recibir mas llamadas desde Google. Quieres que te muestre un ejemplo gratis?" },
      { name: "Landscaping apertura", category: "DM", niche: "landscaping", content: "Que onda bro, vi tu trabajo de landscaping en {ciudad}. Mucha gente busca ese servicio en Google todos los dias. Te puedo mostrar como se veria tu negocio recibiendo mas llamadas. Quieres una demo gratis?" },
      { name: "Cleaning apertura", category: "DM", niche: "cleaning", content: "Hola, vi que ofreces cleaning services en {ciudad}. Si no apareces bien en Google, muchos clientes se van con otros. Te puedo ensenar una demo de como mejorar eso. Te interesa?" },
      { name: "Follow-up 1", category: "FOLLOW_UP", niche: "general", content: "Oye bro, te queria mostrar el ejemplo de como podriamos hacer que tu negocio reciba mas llamadas desde Google. Te lo mando?" },
      { name: "Follow-up 2", category: "FOLLOW_UP", niche: "general", content: "Ya tengo una idea clara para mejorar tu presencia en Google en {ciudad}. Te lo enseno rapido?" },
      { name: "Cierre", category: "CLOSE", niche: "general", content: "Si te gusta lo que ves, lo podemos dejar funcionando esta semana. El plan es $400 setup + $200 mensual. La idea es que lo recuperes con 1 o 2 trabajos." },
    ],
  });

  await prisma.financeTransaction.createMany({
    data: [
      { type: TransactionType.INCOME, category: "Setup", amount: 400, concept: "Setup Cruz Landscaping", date: new Date("2026-04-01"), clientId: clients[0].id },
      { type: TransactionType.INCOME, category: "Mensualidad", amount: 200, concept: "Mensualidad Abril Cruz", date: new Date("2026-04-05"), clientId: clients[0].id },
      { type: TransactionType.INCOME, category: "Mensualidad", amount: 450, concept: "Mensualidad Abril Rivera", date: new Date("2026-04-03"), clientId: clients[1].id },
      { type: TransactionType.EXPENSE, category: "Software", amount: 120, concept: "Herramientas SEO", date: new Date("2026-04-02") },
      { type: TransactionType.EXPENSE, category: "Hosting", amount: 80, concept: "Servidores web", date: new Date("2026-04-06") },
      { type: TransactionType.EXPENSE, category: "Ads", amount: 250, concept: "Retargeting", date: new Date("2026-04-10") },
    ],
  });

  await prisma.clientProgress.createMany({
    data: [
      { clientId: clients[0].id, month: 4, year: 2026, calls: 18, messages: 27, leads: 11, notes: "Buen avance local" },
      { clientId: clients[1].id, month: 4, year: 2026, calls: 24, messages: 31, leads: 16, notes: "Crecimiento sostenido" },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { action: "CREATE", entityType: "Lead", entityId: `${leads.count}`, description: "Carga inicial de leads" },
      { action: "CREATE", entityType: "Client", entityId: clients[0].id, description: "Carga inicial de clientes" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

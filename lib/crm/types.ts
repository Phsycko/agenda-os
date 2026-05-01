/** Domain types for ClientBoost OS — single source for UI + localStorage. Prisma/API can map to these later. */

export const STORAGE_KEY = "clientboost-os-crm-v1";

export const LEAD_STAGES = [
  "NUEVO",
  "CONTACTADO",
  "INTERESADO",
  "DEMO_AGENDADA",
  "DEMO_REALIZADA",
  "PROPUESTA_ENVIADA",
  "CERRADO_GANADO",
  "CERRADO_PERDIDO",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_SOURCES = [
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "REFERIDO",
  "WEB",
  "LLAMADA",
  "OTRO",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** Etiquetas UI para selects (evita mostrar enums crudos tipo INSTAGRAM). */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  REFERIDO: "Referido",
  WEB: "Web",
  LLAMADA: "Llamada",
  OTRO: "Otro",
};

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  INTERESADO: "Interesado",
  DEMO_AGENDADA: "Demo agendada",
  DEMO_REALIZADA: "Demo realizada",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  CERRADO_GANADO: "Cerrado ganado",
  CERRADO_PERDIDO: "Cerrado perdido",
};

/** ID de nicho del catálogo `lib/crm/lead-niches.ts` */
export type LeadSector = string;

export {
  ALL_LEAD_NICHE_IDS,
  LEAD_NICHE_GROUPS,
  LEAD_NICHE_LABELS,
  coerceStoredLeadNiche,
  isValidLeadNicheId,
  leadNicheLabel,
} from "./lead-niches";

export const PRIORITIES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const CLIENT_STATUSES = ["ACTIVO", "PAUSADO", "CANCELADO", "PENDIENTE"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ACTIVO: "Activo",
  PAUSADO: "Pausado",
  CANCELADO: "Cancelado",
  PENDIENTE: "Pendiente",
};

export const APPOINTMENT_TYPES = [
  "DEMO",
  "LLAMADA",
  "SEGUIMIENTO",
  "REVISION_MENSUAL",
  "CIERRE",
  "REUNION_INTERNA",
] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  DEMO: "Demo",
  LLAMADA: "Llamada",
  SEGUIMIENTO: "Seguimiento",
  REVISION_MENSUAL: "Revisión mensual",
  CIERRE: "Cierre",
  REUNION_INTERNA: "Reunión interna",
};

export const APPOINTMENT_STATUSES = ["PENDIENTE", "COMPLETADA", "CANCELADA", "NO_ASISTIO"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDIENTE: "Pendiente",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export const TASK_STATUSES = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "VENCIDA"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const MESSAGE_TEMPLATE_TYPES = [
  "PRIMER_CONTACTO",
  "FOLLOW_UP",
  "DESPUES_DEMO",
  "PROPUESTA",
  "CIERRE",
  "REACTIVACION",
  "CLIENTE_ACTIVO",
  "COBRANZA",
] as const;
export type MessageTemplateType = (typeof MESSAGE_TEMPLATE_TYPES)[number];

export const MESSAGE_CHANNELS = ["WHATSAPP", "EMAIL", "INSTAGRAM", "FACEBOOK", "LLAMADA"] as const;
export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

export const FINANCE_TYPES = ["INCOME", "EXPENSE"] as const;
export type FinanceType = (typeof FINANCE_TYPES)[number];

export const SELLER_ROLES = ["ADMIN", "VENDEDOR", "VIEWER"] as const;
export type SellerRole = (typeof SELLER_ROLES)[number];

export const PERSONAL_TYPES = ["NOTE", "TASK", "REMINDER", "EVENT"] as const;
export type PersonalType = (typeof PERSONAL_TYPES)[number];

export type Id = string;

export type LeadNote = {
  id: Id;
  content: string;
  createdAt: string;
  authorId?: Id;
};

export type ContactHistoryEntry = {
  id: Id;
  channel: string;
  note: string;
  createdAt: string;
  authorId?: Id;
};

export type CrmLead = {
  id: Id;
  contactName: string;
  businessName: string;
  phone: string;
  email: string | null;
  city: string;
  /** Giro / nicho del negocio (id del catálogo lead-niches) */
  sector: string | null;
  service: string;
  source: LeadSource;
  stage: LeadStage;
  priority: Priority;
  assignedSellerId: Id | null;
  estimatedValue: number | null;
  createdAt: string;
  updatedAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  nextAction: string | null;
  notes: string | null;
  lossReason: string | null;
  internalNotes: LeadNote[];
  contactHistory: ContactHistoryEntry[];
};

export type ClientMovement = {
  id: Id;
  note: string;
  createdAt: string;
};

export type MonthlyPayment = {
  id: Id;
  month: number;
  year: number;
  amount: number;
  paidAt: string;
  notes: string | null;
};

export type CrmClient = {
  id: Id;
  businessName: string;
  contactName: string;
  phone: string;
  email: string | null;
  city: string;
  /** Giro / nicho (mismo catálogo que leads) */
  sector: string | null;
  serviceContracted: string;
  monthlyFee: number;
  initialPayment: number;
  status: ClientStatus;
  startDate: string;
  sellerId: Id | null;
  notes: string | null;
  convertedFromLeadId: Id | null;
  movementHistory: ClientMovement[];
  monthlyPayments: MonthlyPayment[];
  createdAt: string;
  updatedAt: string;
};

export type CrmAppointment = {
  id: Id;
  title: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  leadId: Id | null;
  clientId: Id | null;
  sellerId: Id | null;
  notes: string | null;
  nextAction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmTask = {
  id: Id;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  sellerId: Id | null;
  leadId: Id | null;
  clientId: Id | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmMessageTemplate = {
  id: Id;
  title: string;
  templateType: MessageTemplateType;
  niche: string | null;
  channel: MessageChannel;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmFinance = {
  id: Id;
  type: FinanceType;
  concept: string;
  amount: number;
  date: string;
  category: string;
  clientId: Id | null;
  sellerId: Id | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmSeller = {
  id: Id;
  name: string;
  email: string;
  phone: string | null;
  role: SellerRole;
  active: boolean;
  monthlyGoal: number | null;
  commissionPct: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PersonalItem = {
  id: Id;
  type: PersonalType;
  title: string;
  content: string | null;
  date: string | null;
  time: string | null;
  status: "PENDIENTE" | "COMPLETADA" | "CANCELADA";
  priority: Priority;
  createdAt: string;
  updatedAt: string;
};

export type ActivityEntry = {
  id: Id;
  action: string;
  entityType: string;
  entityId: Id;
  description: string;
  createdAt: string;
  userId: Id | null;
};

export type AppSettings = {
  companyName: string;
  brandText: string;
  currency: string;
  /** Pipeline stage keys — editable list for future DB sync */
  pipelineStages: LeadStage[];
  leadSources: LeadSource[];
  servicesOffered: string[];
  theme: "dark";
  /** Notas libres por fecha (clave `yyyy-MM-dd`) — plan del día estilo Notion */
  agendaDayNotes: Record<string, string>;
};

export type DemoIds = {
  leadIds: Id[];
  sellerIds: Id[];
  clientIds: Id[];
  taskIds: Id[];
  appointmentIds: Id[];
  templateIds: Id[];
  financeIds: Id[];
};

export type CrmState = {
  version: 1;
  settings: AppSettings;
  currentUserId: Id;
  sellers: CrmSeller[];
  leads: CrmLead[];
  clients: CrmClient[];
  appointments: CrmAppointment[];
  tasks: CrmTask[];
  messageTemplates: CrmMessageTemplate[];
  finances: CrmFinance[];
  personalItems: PersonalItem[];
  activityLog: ActivityEntry[];
  demoIds: DemoIds | null;
};

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

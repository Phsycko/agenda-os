import { z } from "zod";
import { APPOINTMENT_TYPES, MESSAGE_CHANNELS, MESSAGE_TEMPLATE_TYPES, PRIORITIES, TASK_STATUSES } from "@/lib/crm/types";

export const leadSchema = z
  .object({
    contactName: z.string().optional(),
    businessName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email invalido").optional().or(z.literal("")),
    service: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    source: z.string().optional(),
    priority: z.string().optional(),
    /** @deprecated compat API */
    temperature: z.string().optional(),
    stage: z.string().optional(),
    estimatedValue: z.coerce.number().optional(),
    notes: z.string().optional(),
    lastContactAt: z.string().optional(),
    nextFollowUpAt: z.string().optional(),
    assignedSellerId: z.string().optional(),
    sector: z.string().optional(),
    nextAction: z.string().optional(),
    lossReason: z.string().optional(),
  })
  .refine((data) => Boolean(data.contactName?.trim() || data.businessName?.trim()), {
    message: "Ingresa al menos contacto o negocio",
    path: ["contactName"],
  });

export const crmClientFormSchema = z.object({
  businessName: z.string().min(1, "Requerido"),
  contactName: z.string().min(1, "Requerido"),
  phone: z.string().min(1, "Requerido"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  city: z.string().min(1, "Requerido"),
  sector: z.string().optional().nullable(),
  serviceContracted: z.string().min(1, "Requerido"),
  monthlyFee: z.coerce.number().nonnegative(),
  initialPayment: z.coerce.number().nonnegative(),
  status: z.enum(["ACTIVO", "PAUSADO", "CANCELADO", "PENDIENTE"]),
  startDate: z.string(),
  sellerId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

/** @deprecated Prisma shape — mantener por rutas API legacy */
export const clientSchema = z.object({
  businessName: z.string().min(1, "BusinessName requerido"),
  contactName: z.string().min(1, "Contacto requerido"),
  phone: z.string().min(1, "Telefono requerido"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  service: z.string().min(1, "Service requerido"),
  city: z.string().min(1, "City requerido"),
  state: z.string().min(1),
  plan: z.string().min(1),
  setupFee: z.coerce.number().nonnegative(),
  monthlyFee: z.coerce.number().nonnegative(),
  status: z.string(),
  startDate: z.string(),
  domain: z.string().optional(),
  websiteUrl: z.string().optional(),
  googleBusinessUrl: z.string().optional(),
  internalNotes: z.string().optional(),
});

/** Formulario / store en cliente (tipos extendidos) */
export const appointmentCrmSchema = z.object({
  title: z.string().min(1),
  type: z.enum(APPOINTMENT_TYPES as unknown as [string, ...string[]]),
  date: z.string(),
  time: z.string().min(1),
  status: z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA", "NO_ASISTIO"]),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  leadId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  sellerId: z.string().optional().nullable(),
});

/** Prisma / rutas API actuales (enum legacy en base de datos) */
export const appointmentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["DEMO", "LLAMADA", "SEGUIMIENTO", "REVISION_MENSUAL", "COBRO"]),
  date: z.string(),
  time: z.string().min(1),
  duration: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "number" ? v : Number(v)))
    .pipe(z.number().int().positive()),
  status: z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA", "REAGENDADA"]),
  priority: z.enum(PRIORITIES),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  reminder: z.enum(["NONE", "MIN_15", "HOUR_1", "DAY_1"]),
  meetingLink: z.string().optional(),
  location: z.string().optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES as unknown as [string, ...string[]]),
  priority: z.enum(PRIORITIES as unknown as [string, ...string[]]),
  dueDate: z.string().optional(),
  leadId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  sellerId: z.string().optional().nullable(),
});

export const financeSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive("Amount debe ser numero positivo"),
  concept: z.string().min(1),
  date: z.string(),
  clientId: z.string().optional().nullable(),
  sellerId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

/** Store / UI */
export const templateCrmSchema = z.object({
  title: z.string().min(1),
  templateType: z.enum(MESSAGE_TEMPLATE_TYPES as unknown as [string, ...string[]]),
  niche: z.string().optional(),
  channel: z.enum(MESSAGE_CHANNELS as unknown as [string, ...string[]]),
  body: z.string().min(1),
});

/** Prisma MessageTemplate */
export const templateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  niche: z.string().optional(),
  content: z.string().min(1),
});

import { z } from "zod";

export const leadSchema = z.object({
  contactName: z.string().optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  service: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.string().optional(),
  temperature: z.string().optional(),
  stage: z.string().optional(),
  estimatedValue: z.coerce.number().optional(),
  notes: z.string().optional(),
  lastContactAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
}).refine((data) => Boolean(data.contactName?.trim() || data.businessName?.trim()), {
  message: "Ingresa al menos contacto o negocio",
  path: ["contactName"],
});

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

export const appointmentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["DEMO", "LLAMADA", "SEGUIMIENTO", "REVISION_MENSUAL", "COBRO"]),
  date: z.string(),
  time: z.string().min(1),
  duration: z.coerce.number().int().positive(),
  status: z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA", "REAGENDADA"]),
  priority: z.enum(["BAJA", "MEDIA", "ALTA", "URGENTE"]),
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
  status: z.string(),
  priority: z.string(),
  dueDate: z.string().optional(),
  leadId: z.string().optional(),
  clientId: z.string().optional(),
});

export const financeSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive("Amount debe ser numero positivo"),
  concept: z.string().min(1),
  date: z.string(),
  clientId: z.string().optional(),
  notes: z.string().optional(),
});

export const templateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  niche: z.string().optional(),
  content: z.string().min(1),
});

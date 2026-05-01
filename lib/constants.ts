import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, LEAD_SOURCES, LEAD_STAGES, PRIORITIES, TASK_STATUSES } from "@/lib/crm/types";

export const PIPELINE_STAGES = LEAD_STAGES;
export const SOURCES = LEAD_SOURCES;
export const TEMPERATURES = ["FRIO", "TIBIO", "CALIENTE"] as const; // legacy label en algunos textos
export const TASK_PRIORITIES = PRIORITIES;
export const TASK_STATUSES_UI = TASK_STATUSES;
export const APPOINTMENT_TYPES_UI = APPOINTMENT_TYPES;
export const APPOINTMENT_STATUSES_UI = APPOINTMENT_STATUSES;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/clients", label: "Clientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/tareas", label: "Tareas" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/finanzas", label: "Finanzas" },
  { href: "/reportes", label: "Reportes" },
  { href: "/configuracion", label: "Configuracion" },
  { href: "/personal", label: "Personal" },
];

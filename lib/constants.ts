export const PIPELINE_STAGES = [
  "NUEVO",
  "CONTACTADO",
  "INTERESADO",
  "DEMO_AGENDADA",
  "DEMO_REALIZADA",
  "PROPUESTA_ENVIADA",
  "CERRADO_GANADO",
  "CERRADO_PERDIDO",
] as const;

export const SOURCES = [
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE_MAPS",
  "REFERIDO",
  "WEB",
  "OTRO",
] as const;

export const TEMPERATURES = ["FRIO", "TIBIO", "CALIENTE"] as const;
export const TASK_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
export const TASK_STATUSES = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA"] as const;
export const APPOINTMENT_TYPES = ["DEMO", "LLAMADA", "SEGUIMIENTO", "REVISION_MENSUAL", "COBRO"] as const;
export const APPOINTMENT_STATUSES = ["PENDIENTE", "COMPLETADA", "CANCELADA", "REAGENDADA"] as const;

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

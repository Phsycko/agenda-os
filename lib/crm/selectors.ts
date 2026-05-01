import { addDays, endOfWeek, isAfter, isBefore, isSameDay, isWithinInterval, parseISO, startOfDay, startOfWeek } from "date-fns";
import type { ActivityEntry, CrmAppointment, CrmFinance, CrmLead, CrmSeller, CrmState, CrmTask } from "./types";
import { LEAD_SECTOR_LABELS, LEAD_STAGES } from "./types";
import { filterAppointmentsForUser, filterLeadsForUser, filterTasksForUser, getCurrentSeller } from "./permissions";

function startOfCurrentMonth() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1);
}

function endOfCurrentMonth() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function financesInMonth(finances: CrmFinance[], start = startOfCurrentMonth(), end = endOfCurrentMonth()) {
  return finances.filter((f) => {
    const d = parseISO(f.date);
    return !isBefore(d, start) && !isAfter(d, end);
  });
}

export type DashboardMetrics = {
  leadsTotal: number;
  leadsNewWeek: number;
  demosScheduled: number;
  clientsActive: number;
  closeRate: number;
  incomeMonth: number;
  expenseMonth: number;
  estimatedProfit: number;
  recurringMonthly: number;
  avgTicket: number;
  bySource: { name: string; value: number }[];
  incomeByMonth: { month: string; value: number }[];
  sellerRanking: { sellerId: string; name: string; won: number; revenue: number }[];
  leadsNoFollowUp: CrmLead[];
  upcomingAppointments: CrmAppointment[];
  overdueTasks: CrmTask[];
  recentActivity: ActivityEntry[];
};

export function computeDashboard(state: CrmState): DashboardMetrics {
  const me = getCurrentSeller(state);
  const leads = filterLeadsForUser(state.leads, state);
  const weekAgo = addDays(new Date(), -7);

  const leadsNewWeek = leads.filter((l) => !isBefore(parseISO(l.createdAt), weekAgo)).length;

  const apps = filterAppointmentsForUser(state.appointments, state);
  const demosScheduled = apps.filter((a) => a.type === "DEMO" && a.status === "PENDIENTE").length;

  const clientsActive = state.clients.filter((c) => c.status === "ACTIVO").length;

  const closedWon = leads.filter((l) => l.stage === "CERRADO_GANADO").length;
  const closeRate = leads.length ? (closedWon / leads.length) * 100 : 0;

  const monthFin = me?.role === "ADMIN" ? financesInMonth(state.finances) : [];
  const incomeMonth = monthFin.filter((f) => f.type === "INCOME").reduce((a, b) => a + b.amount, 0);
  const expenseMonth = monthFin.filter((f) => f.type === "EXPENSE").reduce((a, b) => a + b.amount, 0);

  const recurringMonthly = state.clients
    .filter((c) => c.status === "ACTIVO")
    .reduce((sum, c) => sum + c.monthlyFee, 0);

  const activeClients = state.clients.filter((c) => c.status === "ACTIVO");
  const avgTicket =
    activeClients.length > 0 ? activeClients.reduce((s, c) => s + c.monthlyFee, 0) / activeClients.length : 0;

  const bySourceMap = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {});
  const bySource = Object.entries(bySourceMap).map(([name, value]) => ({ name, value }));

  const incomeRows = state.finances.filter((f) => f.type === "INCOME");
  const incomeMonthMap = incomeRows.reduce<Record<string, number>>((acc, f) => {
    const d = parseISO(f.date);
    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
    acc[key] = (acc[key] || 0) + f.amount;
    return acc;
  }, {});
  const incomeByMonth = Object.entries(incomeMonthMap).map(([month, value]) => ({ month, value }));

  const sellerRanking = state.sellers
    .filter((s) => s.role === "VENDEDOR" || s.role === "ADMIN")
    .map((seller) => {
      const sellerLeads = state.leads.filter((l) => l.assignedSellerId === seller.id);
      const won = sellerLeads.filter((l) => l.stage === "CERRADO_GANADO").length;
      const revenue = state.finances
        .filter((f) => f.type === "INCOME" && f.sellerId === seller.id)
        .reduce((a, b) => a + b.amount, 0);
      return { sellerId: seller.id, name: seller.name, won, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const today = startOfDay(new Date());
  const leadsNoFollowUp = leads.filter((l) => {
    if (["CERRADO_GANADO", "CERRADO_PERDIDO"].includes(l.stage)) return false;
    if (!l.nextFollowUpAt) return true;
    return isBefore(parseISO(l.nextFollowUpAt), today);
  });

  const upcomingAppointments = apps
    .filter((a) => a.status === "PENDIENTE")
    .filter((a) => !isBefore(parseISO(a.date), today))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 8);

  const tasks = filterTasksForUser(state.tasks, state);
  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETADA" && t.dueDate && isBefore(parseISO(t.dueDate), today),
  );

  const recentActivity = [...state.activityLog].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()).slice(0, 25);

  return {
    leadsTotal: leads.length,
    leadsNewWeek,
    demosScheduled,
    clientsActive,
    closeRate,
    incomeMonth: me?.role === "ADMIN" ? incomeMonth : 0,
    expenseMonth: me?.role === "ADMIN" ? expenseMonth : 0,
    estimatedProfit: me?.role === "ADMIN" ? incomeMonth - expenseMonth : 0,
    recurringMonthly: me?.role === "ADMIN" ? recurringMonthly : 0,
    avgTicket: me?.role === "ADMIN" ? avgTicket : 0,
    bySource,
    incomeByMonth: me?.role === "ADMIN" ? incomeByMonth : [],
    sellerRanking: me?.role === "ADMIN" ? sellerRanking : sellerRanking.filter((r) => r.sellerId === me?.id),
    leadsNoFollowUp,
    upcomingAppointments,
    overdueTasks,
    recentActivity,
  };
}

export type GlobalSearchHit =
  | { kind: "lead"; id: string; label: string; sub: string; href: string }
  | { kind: "client"; id: string; label: string; sub: string; href: string }
  | { kind: "task"; id: string; label: string; sub: string; href: string }
  | { kind: "appointment"; id: string; label: string; sub: string; href: string }
  | { kind: "template"; id: string; label: string; sub: string; href: string }
  | { kind: "personal"; id: string; label: string; sub: string; href: string };

export function globalSearch(state: CrmState, q: string, limit = 20): GlobalSearchHit[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const leads = filterLeadsForUser(state.leads, state);
  const tasks = filterTasksForUser(state.tasks, state);
  const apps = filterAppointmentsForUser(state.appointments, state);
  const out: GlobalSearchHit[] = [];

  for (const l of leads) {
    const sectorText = l.sector ? LEAD_SECTOR_LABELS[l.sector] : "";
    const hay = `${l.contactName} ${l.businessName} ${l.phone} ${l.email ?? ""} ${l.city} ${l.service} ${sectorText}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "lead", id: l.id, label: l.businessName, sub: l.contactName, href: "/leads" });
  }
  for (const c of state.clients) {
    const hay = `${c.businessName} ${c.contactName} ${c.phone} ${c.email ?? ""} ${c.city}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "client", id: c.id, label: c.businessName, sub: c.contactName, href: "/clients" });
  }
  for (const t of tasks) {
    const hay = `${t.title} ${t.description ?? ""}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "task", id: t.id, label: t.title, sub: t.status, href: "/tareas" });
  }
  for (const a of apps) {
    const hay = `${a.title} ${a.notes ?? ""}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "appointment", id: a.id, label: a.title, sub: a.date, href: "/agenda" });
  }
  for (const m of state.messageTemplates) {
    const hay = `${m.title} ${m.body} ${m.niche ?? ""}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "template", id: m.id, label: m.title, sub: m.templateType, href: "/mensajes" });
  }
  for (const p of state.personalItems) {
    const hay = `${p.title} ${p.content ?? ""}`.toLowerCase();
    if (hay.includes(query)) out.push({ kind: "personal", id: p.id, label: p.title, sub: p.type, href: "/personal" });
  }
  return out.slice(0, limit);
}

export function reportsBundle(state: CrmState) {
  const leads = state.leads;
  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byStage = LEAD_STAGES.map((stage) => ({
    name: stage.replaceAll("_", " "),
    value: leads.filter((l) => l.stage === stage).length,
  }));

  const bySeller = state.sellers
    .filter((s) => s.role === "VENDEDOR" || s.role === "ADMIN")
    .map((s) => ({
      name: s.name,
      value: leads.filter((l) => l.assignedSellerId === s.id).length,
    }));

  const conversionByStage = byStage;

  const closeBySeller = state.sellers
    .filter((s) => s.role === "VENDEDOR" || s.role === "ADMIN")
    .map((s) => {
      const mine = leads.filter((l) => l.assignedSellerId === s.id);
      const rate = mine.length ? (mine.filter((l) => l.stage === "CERRADO_GANADO").length / mine.length) * 100 : 0;
      return { name: s.name, value: Math.round(rate * 10) / 10 };
    });

  const incomeRows = state.finances.filter((f) => f.type === "INCOME");
  const monthMap = incomeRows.reduce<Record<string, number>>((acc, f) => {
    const d = parseISO(f.date);
    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
    acc[key] = (acc[key] || 0) + f.amount;
    return acc;
  }, {});
  const byMonth = Object.entries(monthMap).map(([month, value]) => ({ month, value }));

  const clientsLost = state.clients.filter((c) => c.status === "CANCELADO").length;
  const demosAgendadas = state.appointments.filter((a) => a.type === "DEMO" && a.status === "PENDIENTE").length;
  const demosRealizadas = state.appointments.filter((a) => a.type === "DEMO" && a.status === "COMPLETADA").length;
  const propuestas = leads.filter((l) => l.stage === "PROPUESTA_ENVIADA").length;
  const ventasCerradas = leads.filter((l) => l.stage === "CERRADO_GANADO").length;
  const tareasCompletadas = state.tasks.filter((t) => t.status === "COMPLETADA").length;

  return {
    bySource,
    byStage,
    bySeller,
    conversionByStage,
    closeBySeller,
    byMonth,
    clientsActive: state.clients.filter((c) => c.status === "ACTIVO").length,
    clientsLost,
    demosAgendadas,
    demosRealizadas,
    propuestas,
    ventasCerradas,
    tareasCompletadas,
    activityCount: state.activityLog.length,
  };
}

export function tasksBuckets(state: CrmState, sellerScope: CrmSeller | undefined) {
  const tasks = filterTasksForUser(state.tasks, state);
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const myToday =
    sellerScope?.role === "VENDEDOR"
      ? tasks.filter((t) => t.sellerId === sellerScope.id && t.dueDate && isSameDay(parseISO(t.dueDate), today))
      : tasks.filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), today));

  const overdue = tasks.filter((t) => t.status !== "COMPLETADA" && t.dueDate && isBefore(parseISO(t.dueDate), today));

  const upcoming = tasks.filter((t) => {
    if (!t.dueDate || t.status === "COMPLETADA") return false;
    const d = parseISO(t.dueDate);
    return isWithinInterval(d, { start: today, end: weekEnd });
  });

  const completed = tasks.filter((t) => t.status === "COMPLETADA").slice(0, 30);

  return { myToday, overdue, upcoming, completed, all: tasks };
}

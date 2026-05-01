import type { CrmSeller, CrmState } from "./types";

export function getCurrentSeller(state: CrmState): CrmSeller | undefined {
  return state.sellers.find((s) => s.id === state.currentUserId);
}

export function canViewFinances(seller: CrmSeller | undefined): boolean {
  return seller?.role === "ADMIN";
}

export function canEditFinances(seller: CrmSeller | undefined): boolean {
  return seller?.role === "ADMIN";
}

export function canViewSettings(seller: CrmSeller | undefined): boolean {
  return seller?.role === "ADMIN";
}

export function canEditSettings(seller: CrmSeller | undefined): boolean {
  return seller?.role === "ADMIN";
}

export function isReadOnly(seller: CrmSeller | undefined): boolean {
  return seller?.role === "VIEWER";
}

/** Leads visibles para el usuario actual */
export function filterLeadsForUser<T extends { assignedSellerId: string | null }>(leads: T[], state: CrmState): T[] {
  const me = getCurrentSeller(state);
  if (!me || me.role === "ADMIN" || me.role === "VIEWER") return leads;
  return leads.filter((l) => l.assignedSellerId === me.id || l.assignedSellerId === null);
}

export function filterTasksForUser<T extends { sellerId: string | null }>(tasks: T[], state: CrmState): T[] {
  const me = getCurrentSeller(state);
  if (!me || me.role === "ADMIN" || me.role === "VIEWER") return tasks;
  return tasks.filter((t) => t.sellerId === me.id || t.sellerId === null);
}

export function filterAppointmentsForUser<T extends { sellerId: string | null }>(rows: T[], state: CrmState): T[] {
  const me = getCurrentSeller(state);
  if (!me || me.role === "ADMIN" || me.role === "VIEWER") return rows;
  return rows.filter((a) => a.sellerId === me.id || a.sellerId === null);
}

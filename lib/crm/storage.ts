import type { CrmClient, CrmLead, CrmState } from "./types";
import { STORAGE_KEY } from "./types";
import { coerceStoredLeadNiche } from "./lead-niches";

/** Asegura campos nuevos en leads guardados antes de una versión con `sector`. */
export function migrateCrmState(state: CrmState): CrmState {
  return {
    ...state,
    leads: state.leads.map((l) => ({
      ...(l as CrmLead),
      sector: coerceStoredLeadNiche((l as Partial<CrmLead>).sector),
    })),
    clients: state.clients.map((c) => ({
      ...(c as CrmClient),
      sector: coerceStoredLeadNiche((c as Partial<CrmClient>).sector),
    })),
  };
}

export function loadCrmState(): CrmState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrmState;
  } catch {
    return null;
  }
}

export function saveCrmState(state: CrmState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota or private mode
  }
}

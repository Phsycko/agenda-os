import type { CrmLead, CrmState, LeadSector } from "./types";
import { LEAD_SECTORS, STORAGE_KEY } from "./types";

function coerceLeadSector(value: unknown): LeadSector | null {
  if (typeof value !== "string") return null;
  return (LEAD_SECTORS as readonly string[]).includes(value) ? (value as LeadSector) : null;
}

/** Asegura campos nuevos en leads guardados antes de una versión con `sector`. */
export function migrateCrmState(state: CrmState): CrmState {
  return {
    ...state,
    leads: state.leads.map((l) => ({
      ...(l as CrmLead),
      sector: coerceLeadSector((l as Partial<CrmLead>).sector),
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

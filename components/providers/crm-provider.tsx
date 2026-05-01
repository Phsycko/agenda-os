"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createDemoState, emptyCrmState } from "@/lib/crm/defaults";
import { saveCrmState, loadCrmState, migrateCrmState } from "@/lib/crm/storage";
import type {
  ActivityEntry,
  ContactHistoryEntry,
  CrmAppointment,
  CrmClient,
  CrmFinance,
  CrmLead,
  CrmMessageTemplate,
  CrmSeller,
  CrmState,
  CrmTask,
  LeadNote,
  PersonalItem,
} from "@/lib/crm/types";
import { newId, nowIso } from "@/lib/crm/types";
import { getCurrentSeller } from "@/lib/crm/permissions";

type ModalKey = "lead" | "task" | null;

type CrmContextValue = {
  ready: boolean;
  state: CrmState;
  currentSeller: CrmSeller | undefined;
  setCurrentUserId: (id: string) => void;
  updateSettings: (patch: Partial<CrmState["settings"]>) => void;
  /** UI */
  modalOpen: ModalKey;
  setModalOpen: (k: ModalKey) => void;
  /** Activity */
  pushActivity: (partial: Omit<ActivityEntry, "id" | "createdAt">) => void;
  /** Leads */
  createLead: (input: Partial<CrmLead> & Pick<CrmLead, "contactName" | "businessName">) => CrmLead;
  updateLead: (id: string, patch: Partial<CrmLead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, stage: CrmLead["stage"]) => void;
  addLeadInternalNote: (leadId: string, content: string) => void;
  addContactHistory: (leadId: string, entry: Omit<ContactHistoryEntry, "id" | "createdAt">) => void;
  convertLeadToClient: (leadId: string, clientPatch?: Partial<CrmClient>) => CrmClient | null;
  /** Clients */
  createClient: (
    input: Omit<CrmClient, "id" | "createdAt" | "updatedAt" | "movementHistory" | "monthlyPayments"> & {
      movementHistory?: CrmClient["movementHistory"];
      monthlyPayments?: CrmClient["monthlyPayments"];
    },
  ) => CrmClient;
  updateClient: (id: string, patch: Partial<CrmClient>) => void;
  deleteClient: (id: string) => void;
  addClientMovement: (clientId: string, note: string) => void;
  addMonthlyPayment: (clientId: string, p: Omit<CrmClient["monthlyPayments"][number], "id">) => void;
  /** Appointments */
  createAppointment: (input: Omit<CrmAppointment, "id" | "createdAt" | "updatedAt">) => CrmAppointment;
  updateAppointment: (id: string, patch: Partial<CrmAppointment>) => void;
  deleteAppointment: (id: string) => void;
  /** Tasks */
  createTask: (input: Omit<CrmTask, "id" | "createdAt" | "updatedAt">) => CrmTask;
  updateTask: (id: string, patch: Partial<CrmTask>) => void;
  deleteTask: (id: string) => void;
  /** Templates */
  createTemplate: (input: Omit<CrmMessageTemplate, "id" | "createdAt" | "updatedAt">) => CrmMessageTemplate;
  updateTemplate: (id: string, patch: Partial<CrmMessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  /** Finance */
  createFinance: (input: Omit<CrmFinance, "id" | "createdAt" | "updatedAt">) => CrmFinance;
  updateFinance: (id: string, patch: Partial<CrmFinance>) => void;
  deleteFinance: (id: string) => void;
  /** Sellers */
  createSeller: (input: Omit<CrmSeller, "id" | "createdAt" | "updatedAt">) => CrmSeller;
  updateSeller: (id: string, patch: Partial<CrmSeller>) => void;
  deleteSeller: (id: string) => void;
  /** Personal */
  createPersonal: (input: Omit<PersonalItem, "id" | "createdAt" | "updatedAt">) => PersonalItem;
  updatePersonal: (id: string, patch: Partial<PersonalItem>) => void;
  deletePersonal: (id: string) => void;
  /** Demo */
  installDemo: () => void;
  clearDemo: () => void;
  resetWorkspace: () => void;
};

const CrmContext = createContext<CrmContextValue | null>(null);

function withTaskExpiry(state: CrmState): CrmState {
  const today = new Date().toISOString().slice(0, 10);
  let changed = false;
  const tasks = state.tasks.map((t) => {
    if (t.status === "COMPLETADA" || !t.dueDate) return t;
    if (t.dueDate < today && t.status !== "VENCIDA") {
      changed = true;
      return { ...t, status: "VENCIDA" as const, updatedAt: nowIso() };
    }
    return t;
  });
  return changed ? { ...state, tasks } : state;
}

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<CrmState>(() => emptyCrmState());
  const [modalOpen, setModalOpen] = useState<ModalKey>(null);

  useEffect(() => {
    const loaded = loadCrmState();
    if (loaded && loaded.version === 1) {
      setState(withTaskExpiry(migrateCrmState(loaded)));
    } else {
      setState(emptyCrmState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCrmState(state);
  }, [state, ready]);

  const setStateP = useCallback((fn: (s: CrmState) => CrmState) => {
    setState((s) => fn(withTaskExpiry(s)));
  }, []);

  const pushActivity = useCallback((partial: Omit<ActivityEntry, "id" | "createdAt">) => {
    const entry: ActivityEntry = { ...partial, id: newId(), createdAt: nowIso() };
    setStateP((s) => ({ ...s, activityLog: [...s.activityLog, entry].slice(-300) }));
  }, [setStateP]);

  const currentSeller = useMemo(() => getCurrentSeller(state), [state]);

  const setCurrentUserId = useCallback((id: string) => {
    setStateP((s) => ({ ...s, currentUserId: id }));
  }, [setStateP]);

  const updateSettings = useCallback(
    (patch: Partial<CrmState["settings"]>) => {
      setStateP((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    [setStateP],
  );

  const createLead = useCallback(
    (input: Partial<CrmLead> & Pick<CrmLead, "contactName" | "businessName">) => {
      const t = nowIso();
      const lead: CrmLead = {
        id: newId(),
        contactName: input.contactName,
        businessName: input.businessName,
        phone: input.phone ?? "",
        email: input.email ?? null,
        city: input.city ?? "",
        sector: input.sector ?? null,
        service: input.service ?? "",
        source: input.source ?? "OTRO",
        stage: input.stage ?? "NUEVO",
        priority: input.priority ?? "MEDIA",
        assignedSellerId: input.assignedSellerId ?? null,
        estimatedValue: input.estimatedValue ?? null,
        createdAt: t,
        updatedAt: t,
        lastContactAt: input.lastContactAt ?? null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        nextAction: input.nextAction ?? null,
        notes: input.notes ?? null,
        lossReason: input.lossReason ?? null,
        internalNotes: input.internalNotes ?? [],
        contactHistory: input.contactHistory ?? [],
      };
      setStateP((s) => ({ ...s, leads: [lead, ...s.leads] }));
      pushActivity({
        action: "LEAD_CREADO",
        entityType: "LEAD",
        entityId: lead.id,
        description: `Lead creado: ${lead.businessName}`,
        userId: state.currentUserId,
      });
      return lead;
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const updateLead = useCallback(
    (id: string, patch: Partial<CrmLead>) => {
      setStateP((s) => ({
        ...s,
        leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l)),
      }));
    },
    [setStateP],
  );

  const deleteLead = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, leads: s.leads.filter((l) => l.id !== id) }));
      pushActivity({ action: "LEAD_ELIMINADO", entityType: "LEAD", entityId: id, description: "Lead eliminado", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const moveLeadStage = useCallback(
    (id: string, stage: CrmLead["stage"]) => {
      setStateP((s) => ({
        ...s,
        leads: s.leads.map((l) => (l.id === id ? { ...l, stage, updatedAt: nowIso() } : l)),
      }));
      pushActivity({
        action: "LEAD_ETAPA",
        entityType: "LEAD",
        entityId: id,
        description: `Lead movido a ${stage}`,
        userId: state.currentUserId,
      });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const addLeadInternalNote = useCallback(
    (leadId: string, content: string) => {
      const note: LeadNote = { id: newId(), content, createdAt: nowIso(), authorId: state.currentUserId };
      setStateP((s) => ({
        ...s,
        leads: s.leads.map((l) => (l.id === leadId ? { ...l, internalNotes: [...l.internalNotes, note], updatedAt: nowIso() } : l)),
      }));
      pushActivity({ action: "NOTA_INTERNA", entityType: "LEAD", entityId: leadId, description: "Nota interna agregada", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const addContactHistory = useCallback(
    (leadId: string, entry: Omit<ContactHistoryEntry, "id" | "createdAt">) => {
      const row: ContactHistoryEntry = { ...entry, id: newId(), createdAt: nowIso() };
      setStateP((s) => ({
        ...s,
        leads: s.leads.map((l) =>
          l.id === leadId
            ? {
                ...l,
                contactHistory: [...l.contactHistory, row],
                lastContactAt: nowIso(),
                updatedAt: nowIso(),
              }
            : l,
        ),
      }));
      pushActivity({ action: "CONTACTO", entityType: "LEAD", entityId: leadId, description: "Historial de contacto", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const convertLeadToClient = useCallback(
    (leadId: string, clientPatch?: Partial<CrmClient>) => {
      const lead = state.leads.find((l) => l.id === leadId);
      if (!lead) return null;
      const t = nowIso();
      const client: CrmClient = {
        id: newId(),
        businessName: clientPatch?.businessName ?? lead.businessName,
        contactName: clientPatch?.contactName ?? lead.contactName,
        phone: clientPatch?.phone ?? lead.phone,
        email: clientPatch?.email ?? lead.email,
        city: clientPatch?.city ?? lead.city,
        serviceContracted: clientPatch?.serviceContracted ?? lead.service,
        monthlyFee: clientPatch?.monthlyFee ?? 0,
        initialPayment: clientPatch?.initialPayment ?? 0,
        status: clientPatch?.status ?? "ACTIVO",
        startDate: clientPatch?.startDate ?? t.slice(0, 10),
        sellerId: clientPatch?.sellerId ?? lead.assignedSellerId,
        notes: clientPatch?.notes ?? lead.notes,
        convertedFromLeadId: leadId,
        movementHistory: [{ id: newId(), note: "Convertido desde lead", createdAt: t }],
        monthlyPayments: clientPatch?.monthlyPayments ?? [],
        createdAt: t,
        updatedAt: t,
      };
      setStateP((s) => ({
        ...s,
        clients: [client, ...s.clients],
        leads: s.leads.map((l) => (l.id === leadId ? { ...l, stage: "CERRADO_GANADO" as const, updatedAt: t } : l)),
      }));
      pushActivity({ action: "CLIENTE_CREADO", entityType: "CLIENT", entityId: client.id, description: `Cliente desde lead ${lead.businessName}`, userId: state.currentUserId });
      return client;
    },
    [pushActivity, setStateP, state.currentUserId, state.leads],
  );

  const createClient = useCallback(
    (input: Omit<CrmClient, "id" | "createdAt" | "updatedAt" | "movementHistory" | "monthlyPayments"> & { movementHistory?: CrmClient["movementHistory"]; monthlyPayments?: CrmClient["monthlyPayments"] }) => {
      const t = nowIso();
      const client: CrmClient = {
        id: newId(),
        businessName: input.businessName,
        contactName: input.contactName,
        phone: input.phone,
        email: input.email ?? null,
        city: input.city,
        serviceContracted: input.serviceContracted,
        monthlyFee: input.monthlyFee,
        initialPayment: input.initialPayment,
        status: input.status,
        startDate: input.startDate,
        sellerId: input.sellerId ?? null,
        notes: input.notes ?? null,
        convertedFromLeadId: input.convertedFromLeadId ?? null,
        movementHistory: input.movementHistory ?? [],
        monthlyPayments: input.monthlyPayments ?? [],
        createdAt: t,
        updatedAt: t,
      };
      setStateP((s) => ({ ...s, clients: [client, ...s.clients] }));
      pushActivity({ action: "CLIENTE_CREADO", entityType: "CLIENT", entityId: client.id, description: `Cliente ${client.businessName}`, userId: state.currentUserId });
      return client;
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const updateClient = useCallback(
    (id: string, patch: Partial<CrmClient>) => {
      setStateP((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c)),
      }));
    },
    [setStateP],
  );

  const deleteClient = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
      pushActivity({ action: "CLIENTE_ELIMINADO", entityType: "CLIENT", entityId: id, description: "Cliente eliminado", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const addClientMovement = useCallback(
    (clientId: string, note: string) => {
      const mov = { id: newId(), note, createdAt: nowIso() };
      setStateP((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === clientId ? { ...c, movementHistory: [...c.movementHistory, mov], updatedAt: nowIso() } : c)),
      }));
      pushActivity({ action: "CLIENTE_MOVIMIENTO", entityType: "CLIENT", entityId: clientId, description: note.slice(0, 120), userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const addMonthlyPayment = useCallback(
    (clientId: string, p: Omit<CrmClient["monthlyPayments"][number], "id">) => {
      const row = { ...p, id: newId() };
      setStateP((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === clientId ? { ...c, monthlyPayments: [...c.monthlyPayments, row], updatedAt: nowIso() } : c)),
      }));
      pushActivity({ action: "PAGO_MENSUAL", entityType: "CLIENT", entityId: clientId, description: `Pago ${p.month}/${p.year}`, userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const createAppointment = useCallback(
    (input: Omit<CrmAppointment, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: CrmAppointment = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, appointments: [row, ...s.appointments] }));
      pushActivity({ action: "CITA_CREADA", entityType: "APPOINTMENT", entityId: row.id, description: row.title, userId: state.currentUserId });
      return row;
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const updateAppointment = useCallback(
    (id: string, patch: Partial<CrmAppointment>) => {
      setStateP((s) => ({
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a)),
      }));
      pushActivity({ action: "CITA_ACTUALIZADA", entityType: "APPOINTMENT", entityId: id, description: "Cita actualizada", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const deleteAppointment = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
      pushActivity({ action: "CITA_ELIMINADA", entityType: "APPOINTMENT", entityId: id, description: "Cita eliminada", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const createTask = useCallback(
    (input: Omit<CrmTask, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: CrmTask = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, tasks: [row, ...s.tasks] }));
      pushActivity({ action: "TAREA_CREADA", entityType: "TASK", entityId: row.id, description: row.title, userId: state.currentUserId });
      return row;
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<CrmTask>) => {
      setStateP((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t)),
      }));
      if (patch.status === "COMPLETADA") {
        pushActivity({ action: "TAREA_COMPLETADA", entityType: "TASK", entityId: id, description: "Tarea completada", userId: state.currentUserId });
      }
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
      pushActivity({ action: "TAREA_ELIMINADA", entityType: "TASK", entityId: id, description: "Tarea eliminada", userId: state.currentUserId });
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const createTemplate = useCallback(
    (input: Omit<CrmMessageTemplate, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: CrmMessageTemplate = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, messageTemplates: [row, ...s.messageTemplates] }));
      return row;
    },
    [setStateP],
  );

  const updateTemplate = useCallback(
    (id: string, patch: Partial<CrmMessageTemplate>) => {
      setStateP((s) => ({
        ...s,
        messageTemplates: s.messageTemplates.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: nowIso() } : m)),
      }));
    },
    [setStateP],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, messageTemplates: s.messageTemplates.filter((m) => m.id !== id) }));
    },
    [setStateP],
  );

  const createFinance = useCallback(
    (input: Omit<CrmFinance, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: CrmFinance = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, finances: [row, ...s.finances] }));
      pushActivity({
        action: "FINANZAS",
        entityType: "FINANCE",
        entityId: row.id,
        description: `${row.type === "INCOME" ? "Ingreso" : "Egreso"}: ${row.concept}`,
        userId: state.currentUserId,
      });
      return row;
    },
    [pushActivity, setStateP, state.currentUserId],
  );

  const updateFinance = useCallback(
    (id: string, patch: Partial<CrmFinance>) => {
      setStateP((s) => ({
        ...s,
        finances: s.finances.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: nowIso() } : f)),
      }));
    },
    [setStateP],
  );

  const deleteFinance = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, finances: s.finances.filter((f) => f.id !== id) }));
    },
    [setStateP],
  );

  const createSeller = useCallback(
    (input: Omit<CrmSeller, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: CrmSeller = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, sellers: [...s.sellers, row] }));
      return row;
    },
    [setStateP],
  );

  const updateSeller = useCallback(
    (id: string, patch: Partial<CrmSeller>) => {
      setStateP((s) => ({
        ...s,
        sellers: s.sellers.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: nowIso() } : x)),
      }));
    },
    [setStateP],
  );

  const deleteSeller = useCallback(
    (id: string) => {
      setStateP((s) => ({
        ...s,
        sellers: s.sellers.filter((x) => x.id !== id),
        currentUserId: s.currentUserId === id ? s.sellers.find((z) => z.role === "ADMIN")?.id ?? s.currentUserId : s.currentUserId,
      }));
    },
    [setStateP],
  );

  const createPersonal = useCallback(
    (input: Omit<PersonalItem, "id" | "createdAt" | "updatedAt">) => {
      const t = nowIso();
      const row: PersonalItem = { ...input, id: newId(), createdAt: t, updatedAt: t };
      setStateP((s) => ({ ...s, personalItems: [row, ...s.personalItems] }));
      return row;
    },
    [setStateP],
  );

  const updatePersonal = useCallback(
    (id: string, patch: Partial<PersonalItem>) => {
      setStateP((s) => ({
        ...s,
        personalItems: s.personalItems.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p)),
      }));
    },
    [setStateP],
  );

  const deletePersonal = useCallback(
    (id: string) => {
      setStateP((s) => ({ ...s, personalItems: s.personalItems.filter((p) => p.id !== id) }));
    },
    [setStateP],
  );

  const installDemo = useCallback(() => {
    setStateP((s) => {
      const base: CrmState = {
        ...s,
        leads: [],
        clients: [],
        appointments: [],
        tasks: [],
        messageTemplates: [],
        finances: [],
        demoIds: null,
      };
      const { state: seeded, demoIds } = createDemoState(base);
      return withTaskExpiry({
        ...seeded,
        settings: s.settings,
        personalItems: s.personalItems,
        demoIds,
      });
    });
  }, [setStateP]);

  const clearDemo = useCallback(() => {
    const ids = state.demoIds;
    if (!ids) return;
    setStateP((s) => ({
      ...s,
      leads: s.leads.filter((l) => !ids.leadIds.includes(l.id)),
      clients: s.clients.filter((c) => !ids.clientIds.includes(c.id)),
      tasks: s.tasks.filter((t) => !ids.taskIds.includes(t.id)),
      appointments: s.appointments.filter((a) => !ids.appointmentIds.includes(a.id)),
      messageTemplates: s.messageTemplates.filter((m) => !ids.templateIds.includes(m.id)),
      finances: s.finances.filter((f) => !ids.financeIds.includes(f.id)),
      sellers: s.sellers.filter((x) => !ids.sellerIds.includes(x.id) || x.role === "ADMIN"),
      demoIds: null,
    }));
  }, [setStateP, state.demoIds]);

  const resetWorkspace = useCallback(() => {
    setStateP((s) => {
      const fresh = emptyCrmState();
      return withTaskExpiry({
        ...fresh,
        settings: s.settings,
        personalItems: s.personalItems,
      });
    });
  }, [setStateP]);

  const value = useMemo<CrmContextValue>(
    () => ({
      ready,
      state,
      currentSeller,
      setCurrentUserId,
      updateSettings,
      modalOpen,
      setModalOpen,
      pushActivity,
      createLead,
      updateLead,
      deleteLead,
      moveLeadStage,
      addLeadInternalNote,
      addContactHistory,
      convertLeadToClient,
      createClient,
      updateClient,
      deleteClient,
      addClientMovement,
      addMonthlyPayment,
      createAppointment,
      updateAppointment,
      deleteAppointment,
      createTask,
      updateTask,
      deleteTask,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      createFinance,
      updateFinance,
      deleteFinance,
      createSeller,
      updateSeller,
      deleteSeller,
      createPersonal,
      updatePersonal,
      deletePersonal,
      installDemo,
      clearDemo,
      resetWorkspace,
    }),
    [
      ready,
      state,
      currentSeller,
      setCurrentUserId,
      updateSettings,
      modalOpen,
      pushActivity,
      createLead,
      updateLead,
      deleteLead,
      moveLeadStage,
      addLeadInternalNote,
      addContactHistory,
      convertLeadToClient,
      createClient,
      updateClient,
      deleteClient,
      addClientMovement,
      addMonthlyPayment,
      createAppointment,
      updateAppointment,
      deleteAppointment,
      createTask,
      updateTask,
      deleteTask,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      createFinance,
      updateFinance,
      deleteFinance,
      createSeller,
      updateSeller,
      deleteSeller,
      createPersonal,
      updatePersonal,
      deletePersonal,
      installDemo,
      clearDemo,
      resetWorkspace,
    ],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm debe usarse dentro de CrmProvider");
  return ctx;
}

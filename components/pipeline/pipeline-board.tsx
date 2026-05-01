"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PIPELINE_STAGES } from "@/lib/constants";
import { useCrm } from "@/components/providers/crm-provider";
import { filterLeadsForUser, isReadOnly } from "@/lib/crm/permissions";
import type { CrmLead, LeadStage } from "@/lib/crm/types";

function daysSinceLastContact(lead: CrmLead): number | null {
  if (!lead.lastContactAt) return null;
  return differenceInCalendarDays(new Date(), parseISO(lead.lastContactAt));
}

export function PipelineBoard() {
  const { state, moveLeadStage, currentSeller } = useCrm();
  const readOnly = isReadOnly(currentSeller);

  const leads = useMemo(() => filterLeadsForUser(state.leads, state), [state]);

  const sellerName = (id: string | null) => {
    if (!id) return "Sin asignar";
    return state.sellers.find((s) => s.id === id)?.name ?? "—";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-3">
      {PIPELINE_STAGES.map((stage) => (
        <Card key={stage} className="bg-card border-border flex flex-col min-h-[420px]">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stage.replaceAll("_", " ")}
            </CardTitle>
            <p className="text-lg font-semibold text-primary">{leads.filter((l) => l.stage === stage).length}</p>
          </CardHeader>
          <CardContent className="space-y-2 flex-1 overflow-y-auto max-h-[70vh] pr-1">
            {leads
              .filter((l) => l.stage === stage)
              .map((lead) => (
                <div key={lead.id} className="rounded-lg border border-border bg-[#101010] p-3 space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight">{lead.businessName}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {lead.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                  <p className="text-xs">Valor: ${lead.estimatedValue?.toFixed(0) ?? "0"}</p>
                  <p className="text-xs text-zinc-400">Vendedor: {sellerName(lead.assignedSellerId)}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2">Siguiente: {lead.nextAction || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Último contacto:{" "}
                    {lead.lastContactAt ? `hace ${daysSinceLastContact(lead)} d` : "sin registro"}
                  </p>
                  {!readOnly ? (
                    <Select value={lead.stage} onValueChange={(v) => v && moveLeadStage(lead.id, v as LeadStage)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

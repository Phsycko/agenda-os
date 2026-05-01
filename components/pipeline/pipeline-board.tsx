"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";

export function PipelineBoard({ leads }: { leads: any[] }) {
  const [pending, startTransition] = useTransition();
  const update = (id: string, stage: string) => startTransition(async () => { await fetch(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) }); location.reload(); });
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {PIPELINE_STAGES.map((stage, index) => (
        <Card key={stage} className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">{stage.replaceAll("_", " ")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {leads.filter((l) => l.stage === stage).map((lead) => (
              <div key={lead.id} className="rounded-lg border border-border bg-[#101010] p-3 space-y-2">
                <div className="flex items-center justify-between"><p className="font-semibold text-sm">{lead.businessName}</p><Badge variant="outline">{lead.temperature}</Badge></div>
                <p className="text-xs text-muted-foreground">{lead.contactName} - {lead.city}</p>
                <p className="text-xs">Servicio: {lead.service}</p>
                <p className="text-xs">Valor: ${lead.estimatedValue ?? 0}</p>
                <div className="flex gap-2">
                  {index > 0 ? <Button size="sm" variant="outline" disabled={pending} onClick={() => update(lead.id, PIPELINE_STAGES[index - 1])}>Atras</Button> : null}
                  {index < PIPELINE_STAGES.length - 1 ? <Button size="sm" disabled={pending} onClick={() => update(lead.id, PIPELINE_STAGES[index + 1])}>Mover</Button> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

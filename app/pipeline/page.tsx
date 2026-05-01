"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function PipelinePage() {
  return (
    <AppShell title="Pipeline">
      <div className="space-y-6 mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline Kanban</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Mueve oportunidades por etapa. Los cambios se guardan automáticamente y alimentan el dashboard.
          </p>
        </div>
        <PipelineBoard />
      </div>
    </AppShell>
  );
}

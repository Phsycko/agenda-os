import { AppShell } from "@/components/layout/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { prisma } from "@/lib/prisma";

export default async function PipelinePage() {
  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>> = [];
  try {
    leads = await prisma.lead.findMany({ orderBy: { updatedAt: "desc" } });
  } catch {
    // sin DB, tablero vacio
  }
  return <AppShell title="Pipeline">
    <div className="mb-4"><h1 className="text-2xl font-semibold">Visualiza en que etapa esta cada prospecto.</h1></div>
    <PipelineBoard leads={leads} />
  </AppShell>;
}

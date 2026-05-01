import { Badge } from "@/components/ui/badge";

export function PipelineCard({
  businessName,
  contactName,
  service,
  city,
  temperature,
  estimatedValue,
}: {
  businessName: string;
  contactName: string;
  service: string;
  city: string;
  temperature: string;
  estimatedValue?: number | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-[#101010] p-3 space-y-1">
      <div className="flex items-center justify-between"><p className="font-semibold text-sm">{businessName}</p><Badge variant="outline">{temperature}</Badge></div>
      <p className="text-xs text-muted-foreground">{contactName} - {city}</p>
      <p className="text-xs">{service}</p>
      <p className="text-xs">${estimatedValue ?? 0}</p>
    </div>
  );
}

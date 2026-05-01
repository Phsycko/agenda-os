import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PipelineColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ title, value, helper }: { title: string; value: string; helper?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {helper ? <p className="text-xs text-muted-foreground mt-1">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

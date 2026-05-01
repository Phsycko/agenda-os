import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="py-16 text-center space-y-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {cta ? <Button className="mt-2">{cta}</Button> : null}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

export function MessageTemplateCard({ name, category, niche, content }: { name: string; category: string; niche?: string | null; content: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 space-y-2">
        <div className="flex items-center justify-between"><p className="font-semibold">{name}</p><CopyButton text={content} /></div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{category} - {niche ?? "general"}</p>
        <p className="text-sm">{content}</p>
      </CardContent>
    </Card>
  );
}

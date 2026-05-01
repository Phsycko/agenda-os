import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ConfiguracionPage() {
  return <AppShell title="Configuracion">
    <div className="mb-4"><h1 className="text-2xl font-semibold">Configuracion base de la agencia.</h1></div>
    <Card className="bg-card border-border max-w-3xl">
      <CardHeader><CardTitle>Ajustes generales</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <Input defaultValue="ClientBoost" placeholder="Nombre de la agencia" />
        <Input defaultValue="+1 555 444 0000" placeholder="Telefono" />
        <Input defaultValue="operaciones@clientboost.com" placeholder="Email" />
        <Input defaultValue="USD" placeholder="Moneda" />
        <Input defaultValue="400" placeholder="Precio setup default" />
        <Input defaultValue="200" placeholder="Mensualidad default" />
        <Textarea defaultValue="roofing, landscaping, cleaning, construction, handyman" placeholder="Nichos principales" />
        <Textarea defaultValue="Facebook, Instagram, Google Maps, Referido, Web" placeholder="Fuentes de leads" />
        <Button className="bg-primary text-black w-fit">Guardar cambios</Button>
      </CardContent>
    </Card>
  </AppShell>
}

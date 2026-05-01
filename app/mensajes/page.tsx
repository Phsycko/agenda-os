"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageTemplateForm } from "@/components/forms/message-template-form";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import { builtInTemplates } from "@/lib/crm/defaults";
import { MESSAGE_TEMPLATE_TYPES } from "@/lib/crm/types";
import { isReadOnly } from "@/lib/crm/permissions";

export default function MensajesPage() {
  const { state, currentSeller, createTemplate, deleteTemplate } = useCrm();
  const readOnly = isReadOnly(currentSeller);
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("ALL");
  const [nicheF, setNicheF] = useState("ALL");

  const filtered = useMemo(() => {
    return state.messageTemplates.filter((t) => {
      const hay = `${t.title} ${t.body} ${t.niche ?? ""}`.toLowerCase();
      const okQ = hay.includes(q.toLowerCase());
      const okT = typeF === "ALL" || t.templateType === typeF;
      const okN = nicheF === "ALL" || (t.niche ?? "").toLowerCase() === nicheF.toLowerCase();
      return okQ && okT && okN;
    });
  }, [state.messageTemplates, q, typeF, nicheF]);

  const niches = useMemo(() => {
    const s = new Set<string>();
    s.add("General");
    state.messageTemplates.forEach((t) => s.add(t.niche || "General"));
    return ["ALL", ...Array.from(s)];
  }, [state.messageTemplates]);

  const importLibrary = () => {
    const existing = new Set(state.messageTemplates.map((t) => t.title));
    for (const tpl of builtInTemplates()) {
      if (existing.has(tpl.title)) continue;
      createTemplate({ ...tpl, niche: tpl.niche ?? "General" });
      existing.add(tpl.title);
    }
  };

  return (
    <AppShell title="Mensajes">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Biblioteca de plantillas</h1>
            <p className="text-sm text-muted-foreground">Variables: {"{{nombre}}, {{negocio}}, {{servicio}}, {{vendedor}}"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!readOnly ? (
              <>
                <Button variant="outline" onClick={importLibrary}>
                  Importar plantillas ClientBoost
                </Button>
                <Dialog>
                  <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                    Crear plantilla
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nueva plantilla</DialogTitle>
                    </DialogHeader>
                    <MessageTemplateForm />
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={typeF} onValueChange={(v) => setTypeF(v ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              {MESSAGE_TEMPLATE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={nicheF} onValueChange={(v) => setNicheF(v ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Nicho" />
            </SelectTrigger>
            <SelectContent>
              {niches.map((n) => (
                <SelectItem key={n} value={n}>
                  {n === "ALL" ? "Todos los nichos" : n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((t) => (
            <Card key={t.id} className="bg-card border-border">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{t.title}</p>
                  <CopyButton text={t.body} />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.templateType.replaceAll("_", " ")} · {t.channel}
                  {t.niche ? ` · ${t.niche}` : ""}
                </p>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{t.body}</p>
                {!readOnly ? (
                  <Button size="sm" variant="destructive" onClick={() => deleteTemplate(t.id)}>
                    Eliminar
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

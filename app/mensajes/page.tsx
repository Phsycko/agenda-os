"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageTemplateForm } from "@/components/forms/message-template-form";
import { fetchJsonSafe } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

export default function MensajesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const load = async ()=> setTemplates(await fetchJsonSafe<any[]>('/api/messages/templates', []));
  useEffect(()=>{load();},[]);
  return <AppShell title="Mensajes">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-semibold">Plantillas de outreach y follow-up por nicho.</h1><Dialog><DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Crear plantilla</DialogTrigger><DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Nueva plantilla</DialogTitle></DialogHeader><MessageTemplateForm onSaved={load} /></DialogContent></Dialog></div>
    <div className="grid md:grid-cols-2 gap-3">{templates.map((t)=><Card key={t.id} className="bg-card border-border"><CardContent className="pt-5 space-y-2"><div className="flex items-center justify-between"><p className="font-semibold">{t.name}</p><CopyButton text={t.content} /></div><p className="text-xs uppercase tracking-wider text-muted-foreground">{t.category} - {t.niche}</p><p className="text-sm text-zinc-200">{t.content}</p></CardContent></Card>)}</div>
  </AppShell>
}

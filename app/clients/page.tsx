"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { fetchJsonSafe } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const load = async ()=> setClients(await fetchJsonSafe<any[]>('/api/clients', []));
  useEffect(()=>{load();},[]);
  return <AppShell title="Clientes">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-semibold">Administra tus cuentas activas y su progreso mensual.</h1><Dialog><DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Crear cliente</DialogTrigger><DialogContent className="max-w-2xl bg-card border-border"><DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader><ClientForm onSaved={load} /></DialogContent></Dialog></div>
    {!clients.length ? <EmptyState title="No hay clientes todavia" description="Convierte tus primeros leads en clientes activos." cta="Crear primer cliente" /> : <Card className="bg-card border-border"><CardContent className="pt-6"><DataTable columns={["Negocio","Contacto","Servicio","Plan","Mensualidad","Estado"]} rows={clients.map((c)=>[c.businessName,c.contactName,c.service,c.plan,`$${c.monthlyFee}`,c.status])} /></CardContent></Card>}
  </AppShell>
}

"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { fetchJsonSafe } from "@/lib/utils";

export default function TareasPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const load = async ()=> setTasks(await fetchJsonSafe<any[]>('/api/tasks', []));
  useEffect(()=>{load();},[]);
  return <AppShell title="Tareas">
    <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-semibold">Sistema interno de ejecucion diaria.</h1><Dialog><DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">Crear tarea</DialogTrigger><DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader><TaskForm onSaved={load} /></DialogContent></Dialog></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{tasks.map((t)=><Card key={t.id} className="bg-card border-border"><CardContent className="pt-5"><p className="font-semibold">{t.title}</p><p className="text-sm text-muted-foreground">{t.description}</p><p className="text-xs mt-2">{t.status} - {t.priority}</p></CardContent></Card>)}</div>
  </AppShell>
}

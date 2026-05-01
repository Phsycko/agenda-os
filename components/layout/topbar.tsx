"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrm } from "@/components/providers/crm-provider";
import { globalSearch } from "@/lib/crm/selectors";
import { LeadForm } from "@/components/forms/lead-form";
import { TaskForm } from "@/components/forms/task-form";

export function Topbar({ title, onOpenMobileNav }: { title: string; onOpenMobileNav?: () => void }) {
  const { state, setCurrentUserId, modalOpen, setModalOpen, currentSeller } = useCrm();
  const [q, setQ] = useState("");
  const [openHits, setOpenHits] = useState(false);

  const hits = useMemo(() => globalSearch(state, q), [state, q]);

  const initials = currentSeller?.name?.slice(0, 2).toUpperCase() ?? "CB";

  return (
    <header className="sticky top-0 z-20 flex h-14 min-h-14 items-center justify-between gap-2 border-b border-border bg-[#0a0a0a]/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur sm:h-16 sm:min-h-16 sm:gap-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onOpenMobileNav ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 touch-manipulation lg:hidden"
            aria-label="Abrir menú"
            onClick={onOpenMobileNav}
          >
            <Menu className="size-5" />
          </Button>
        ) : null}
        <div className="min-w-0 shrink">
          <h2 className="truncate text-base font-semibold sm:text-lg">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1 justify-end">
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpenHits(true);
            }}
            onFocus={() => setOpenHits(true)}
            onBlur={() => setTimeout(() => setOpenHits(false), 150)}
            placeholder="Buscar en leads, clientes, tareas, citas, plantillas, personal..."
            className="pl-9 bg-[#111] border-border"
          />
          {openHits && hits.length > 0 ? (
            <div className="absolute right-0 top-full mt-1 w-full max-h-72 overflow-auto rounded-lg border border-border bg-[#0f0f0f] shadow-xl z-30 py-1">
              {hits.map((h) => (
                <Link
                  key={`${h.kind}-${h.id}`}
                  href={h.href}
                  className="block px-3 py-2 text-sm hover:bg-zinc-900 border-b border-border/60 last:border-0"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="text-xs uppercase tracking-wide text-primary">{h.kind}</span>
                  <p className="font-medium text-zinc-100 truncate">{h.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.sub}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <Select value={state.currentUserId} onValueChange={(v) => v && setCurrentUserId(v)}>
          <SelectTrigger className="hidden xl:flex w-[200px] bg-[#111] border-border text-xs">
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            {state.sellers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} · {s.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 touch-manipulation sm:inline-flex"
          onClick={() => setModalOpen("lead")}
        >
          Nuevo Lead
        </Button>
        <Button
          size="sm"
          className="min-h-9 shrink-0 touch-manipulation bg-primary px-2.5 font-semibold text-black hover:bg-primary/90 sm:px-3"
          onClick={() => setModalOpen("task")}
        >
          <Sparkles className="size-4 opacity-80 sm:mr-1" />
          <span className="hidden sm:inline">Nueva Tarea</span>
        </Button>

        <Avatar className="shrink-0">
          <AvatarFallback className="bg-zinc-800 text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <Dialog open={modalOpen === "lead"} onOpenChange={(o) => !o && setModalOpen(null)}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nuevo lead</DialogTitle>
          </DialogHeader>
          <LeadForm />
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen === "task"} onOpenChange={(o) => !o && setModalOpen(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <TaskForm />
        </DialogContent>
      </Dialog>
    </header>
  );
}

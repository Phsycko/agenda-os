"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-border bg-[#0a0a0a]/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <Input placeholder="Buscar lead, cliente o tarea..." className="w-80 bg-[#111]" />
        <Button variant="outline">Nuevo Lead</Button>
        <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">Nueva Tarea</Button>
        <Avatar>
          <AvatarFallback className="bg-zinc-800">CB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

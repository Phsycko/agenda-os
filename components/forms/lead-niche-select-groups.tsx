"use client";

import { LEAD_NICHE_GROUPS } from "@/lib/crm/lead-niches";
import { SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";

/** Opciones de nicho agrupadas para Select (popup lead, filtros, detalle). */
export function LeadNicheSelectGroups() {
  return (
    <>
      {LEAD_NICHE_GROUPS.map((group) => (
        <SelectGroup key={group.id}>
          <SelectLabel>{group.title}</SelectLabel>
          {group.items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </>
  );
}

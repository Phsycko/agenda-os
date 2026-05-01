"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LEAD_NICHE_GROUPS, isValidLeadNicheId, leadNicheLabel } from "@/lib/crm/lead-niches";

function useFixedPanelStyle(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<{ top: number; left: number; width: number; maxH: number } | null>(null);

  const measure = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxH = Math.min(window.innerHeight * 0.55, 380);
    const width = Math.max(280, Math.min(480, Math.max(r.width, 320)));
    let left = r.left;
    left = Math.max(10, Math.min(left, window.innerWidth - width - 10));
    let top = r.bottom + 6;
    if (top + maxH > window.innerHeight - 10) {
      top = Math.max(10, r.top - maxH - 6);
    }
    setBox({ top, left, width, maxH });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (anchorRef.current && ro) ro.observe(anchorRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure, anchorRef]);

  return box;
}

type NichePickerPanelProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onPick: (id: string) => void;
  maxHeight: number;
  width: number;
  extraTop?: React.ReactNode;
};

function NichePickerPanel({ query, onQueryChange, onPick, maxHeight, width, extraTop }: NichePickerPanelProps) {
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return LEAD_NICHE_GROUPS;
    return LEAD_NICHE_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.label.toLowerCase().includes(needle) ||
          i.id.toLowerCase().includes(needle) ||
          g.title.toLowerCase().includes(needle),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const listMaxH = Math.max(140, maxHeight - 112);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-popover py-2 shadow-xl ring-1 ring-foreground/10"
      style={{ width }}
    >
      <div className="shrink-0 border-b border-border px-2 pb-2">
        {extraTop}
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por nombre o palabra clave…"
            className="h-9 pl-9"
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
      <div className="overflow-y-auto overscroll-contain px-1" style={{ maxHeight: listMaxH }}>
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin coincidencias.</p>
        ) : (
          filtered.map((group) => (
            <div key={group.id} className="py-1">
              <p className="sticky top-0 z-[1] bg-popover px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPick(item.id)}
                    className={cn(
                      "flex w-full rounded-md px-2.5 py-2 text-left text-sm leading-snug text-foreground",
                      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function LeadNichePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Giro / nicho del negocio",
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const box = useFixedPanelStyle(open, anchorRef);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = value && isValidLeadNicheId(value) ? leadNicheLabel(value) : placeholder;

  const portal =
    open &&
    box &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[90]" aria-hidden onMouseDown={() => setOpen(false)} />
        <div className="fixed z-[100]" style={{ top: box.top, left: box.left, width: box.width }}>
          <NichePickerPanel
            query={query}
            onQueryChange={setQuery}
            maxHeight={box.maxH}
            width={box.width}
            extraTop={
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="mb-1 flex w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Sin especificar
              </button>
            }
            onPick={(id) => {
              onChange(id);
              setOpen(false);
            }}
          />
        </div>
      </>,
      document.body,
    );

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        ref={anchorRef}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-full min-w-0 justify-between gap-2 px-3 font-normal"
      >
        <span className={cn("truncate text-left", !value && "text-muted-foreground")}>{label}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground opacity-70" />
      </Button>
      {portal}
    </div>
  );
}

/** Filtro de listado: ALL | __none | id de nicho */
export function LeadNicheFilterPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const box = useFixedPanelStyle(open, anchorRef);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const summary =
    value === "ALL"
      ? "Todos los nichos"
      : value === "__none"
        ? "Sin nicho"
        : isValidLeadNicheId(value)
          ? leadNicheLabel(value)
          : "Nicho";

  const portal =
    open &&
    box &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <div className="fixed inset-0 z-[90]" aria-hidden onMouseDown={() => setOpen(false)} />
        <div className="fixed z-[100]" style={{ top: box.top, left: box.left, width: box.width }}>
          <NichePickerPanel
            query={query}
            onQueryChange={setQuery}
            maxHeight={box.maxH}
            width={box.width}
            extraTop={
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange("ALL");
                    setOpen(false);
                  }}
                  className="flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  Todos los nichos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange("__none");
                    setOpen(false);
                  }}
                  className="flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  Sin nicho
                </button>
              </div>
            }
            onPick={(id) => {
              onChange(id);
              setOpen(false);
            }}
          />
        </div>
      </>,
      document.body,
    );

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        ref={anchorRef}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-full min-w-0 justify-between gap-2 px-3 font-normal"
      >
        <span className="truncate text-left">{summary}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground opacity-70" />
      </Button>
      {portal}
    </div>
  );
}

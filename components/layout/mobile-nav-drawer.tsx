"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Target,
  UserRound,
  Wallet,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = [
  LayoutDashboard,
  Target,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  MessageSquareText,
  Wallet,
  FileText,
  Settings,
  UserRound,
];

export function MobileNavDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const pathname = usePathname();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-none gap-0 overflow-hidden border-y-0 border-l-0 border-r-border p-0 sm:max-w-none"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100dvh",
          maxHeight: "100dvh",
          width: "min(20rem, 88vw)",
          transform: "none",
          borderRadius: 0,
        }}
      >
        <DialogHeader className="border-b border-border px-4 py-4 text-left">
          <DialogTitle className="text-base">Menú</DialogTitle>
          <p className="text-xs font-normal text-muted-foreground">ClientBoost OS</p>
        </DialogHeader>
        <nav className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain px-2 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = iconMap[idx] ?? LayoutDashboard;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition active:scale-[0.99]",
                  active ? "bg-primary/15 text-primary" : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
                )}
              >
                <Icon className="size-5 shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

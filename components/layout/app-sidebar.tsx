"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, CalendarClock, ClipboardList, FileText, LayoutDashboard, MessageSquareText, Settings, Target, UserRound, Wallet } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = [LayoutDashboard, Target, BarChart3, BriefcaseBusiness, CalendarClock, ClipboardList, MessageSquareText, Wallet, FileText, Settings, UserRound];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-68 shrink-0 border-r border-border bg-[#0b0b0b] p-5 flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">ClientBoost</p>
        <h1 className="text-xl font-semibold mt-1">ClientBoost OS</h1>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item, idx) => {
          const Icon = iconMap[idx] ?? LayoutDashboard;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition", active ? "bg-primary/15 text-primary" : "text-zinc-300 hover:bg-zinc-900 hover:text-white")}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

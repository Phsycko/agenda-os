"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onOpenMobileNav={() => setMobileNav(true)} />
        <main className="flex-1 px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:py-6 sm:pb-6 sm:pt-0">
          {children}
        </main>
      </div>
      <MobileNavDrawer open={mobileNav} onOpenChange={setMobileNav} />
    </div>
  );
}

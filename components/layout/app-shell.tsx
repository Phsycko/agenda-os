import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

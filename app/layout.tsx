import type { Metadata } from "next";
import "./globals.css";
import { CrmProvider } from "@/components/providers/crm-provider";

export const metadata: Metadata = {
  title: "ClientBoost OS",
  description: "Control total de tus leads, clientes y dinero.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark h-full">
      <body className="min-h-full bg-background text-foreground">
        <CrmProvider>{children}</CrmProvider>
      </body>
    </html>
  );
}

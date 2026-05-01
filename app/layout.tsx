import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CrmProvider } from "@/components/providers/crm-provider";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#00c853",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ClientBoost OS",
  description: "Control total de tus leads, clientes y dinero.",
  applicationName: "ClientBoost OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClientBoost",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark h-full">
      <body className="min-h-[100dvh] bg-background text-foreground">
        <CrmProvider>{children}</CrmProvider>
        <PwaRegister />
      </body>
    </html>
  );
}

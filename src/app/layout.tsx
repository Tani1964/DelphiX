import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SessionProvider from "@/components/providers/SessionProvider";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { SOSButtonWrapper } from "@/components/sos/SOSButtonWrapper";

export const metadata: Metadata = {
  title: "DelphiX Health - Healthcare Platform",
  description: "Comprehensive healthcare platform for drug verification, AI-powered diagnosis, and hospital recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <SessionProvider>
          {/* <ServiceWorkerRegistration /> */}
          <ConditionalNavbar />
          {children}
          <SOSButtonWrapper />
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SessionProvider from "@/components/providers/SessionProvider";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";
import { SOSButtonWrapper } from "@/components/sos/SOSButtonWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delphi Health - Healthcare Platform",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

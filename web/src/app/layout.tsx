import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackendWarmup } from "@/components/BackendWarmup";

export const metadata: Metadata = {
  title: "SAYeTECH Investor Data Room",
  description: "Secure investor data room for SAYeTECH due diligence.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BackendWarmup />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

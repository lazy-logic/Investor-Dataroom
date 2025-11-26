import type { ReactNode } from "react";
import { PublicNav } from "@/components/navigation/PublicNav";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNav showBackButton={true} />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}

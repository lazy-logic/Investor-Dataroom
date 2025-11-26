"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card className="space-y-4 border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Investor Login
        </h1>
        <p className="text-sm text-slate-700">
          Enter your email address to continue to the NDA and investor dashboard.
        </p>
        <form className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            placeholder="Enter your email address"
          />
          <Button 
            type="button" 
            className="w-full"
            onClick={() => {
              setLoading(true);
              router.push("/nda");
            }}
          >
            {loading && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-white" />
            )}
            {loading ? "Loading..." : "Access Data Room"}
          </Button>
        </form>
      </Card>
      
      <Link
        href="/request-access"
        className="inline-flex w-full items-center justify-center rounded-md bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
      >
        New to SAYeTECH? Request Access
      </Link>
    </div>
  );
}

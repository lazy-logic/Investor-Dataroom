"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, APIClientError } from "@/lib/api-client";
import type { NDAContent } from "@/lib/api-types";

export default function NdaPage() {
  const [ndaContent, setNdaContent] = useState<NDAContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshNDAStatus } = useAuth();

  useEffect(() => {
    const fetchNDA = async () => {
      try {
        const content = await apiClient.getNDAContent();
        setNdaContent(content);
      } catch (err) {
        console.error("Failed to fetch NDA:", err);
        setError("Failed to load NDA content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNDA();
  }, []);

  const handleAccept = async () => {
    if (!agreed) {
      setError("Please check the box to agree to the NDA.");
      return;
    }

    if (!signature.trim()) {
      setError("Please enter your full legal name.");
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      // Get user's IP address
      let ipAddress = "unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (ipErr) {
        console.error("Failed to get IP:", ipErr);
      }

      // Get user agent
      const userAgent = navigator.userAgent;

      // Accept NDA
      await apiClient.acceptNDA({
        digital_signature: signature.trim(),
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // Refresh NDA status in auth context
      await refreshNDAStatus();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to accept NDA:", err);
      
      if (err instanceof APIClientError) {
        setError(err.message);
      } else {
        setError("Failed to accept NDA. Please try again.");
      }
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-red mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Loading NDA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 pb-32">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          SAYeTECH Investor Data Room
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Non-Disclosure Agreement</h1>
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-700 border-slate-200">
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
                Non-Disclosure Agreement
              </h2>
              {ndaContent && (
                <p className="mb-4 text-xs text-slate-500">
                  Version {ndaContent.version} • Effective {new Date(ndaContent.effective_date).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="prose prose-sm max-w-none">
              {ndaContent ? (
                <div dangerouslySetInnerHTML={{ __html: ndaContent.content }} />
              ) : (
                <p className="text-slate-600">
                  This Non-Disclosure Agreement governs your access to confidential information
                  provided by SAYeTECH. By accepting this agreement, you agree to maintain the
                  confidentiality of all materials and information disclosed to you.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="space-y-4 text-sm border-slate-200">
          <h2 className="font-semibold text-slate-900">Key Points</h2>
          <ul className="list-disc space-y-2 pl-5 text-xs text-slate-600">
            <li>Confidential use of documents for evaluation purposes only</li>
            <li>No sharing or redistribution without prior written consent</li>
            <li>Return or destruction of materials upon request</li>
            <li>Agreement remains in effect for the duration specified</li>
            <li>Your acceptance is legally binding and will be logged</li>
          </ul>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="agree-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-red focus:ring-brand-red"
            />
            <label htmlFor="agree-checkbox" className="text-xs text-slate-700 cursor-pointer">
              <p className="font-medium">
                I have read and agree to the Non-Disclosure Agreement above.
              </p>
              <p className="text-slate-500">
                Your acceptance will be logged with timestamp and IP address.
              </p>
            </label>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Full legal name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              disabled={accepting}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:border-brand-red disabled:opacity-50 md:w-64"
            />
            <Button 
              onClick={handleAccept}
              disabled={!agreed || !signature.trim() || accepting}
              className="w-full md:w-auto whitespace-nowrap"
            >
              {accepting ? "Accepting..." : "Accept NDA & Enter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

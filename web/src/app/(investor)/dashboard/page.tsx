"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { apiClient, APIClientError } from "@/lib/api-client";
import { useRequireNDA } from "@/contexts/AuthContext";
import type { QAThreadResponse, QuestionCreate } from "@/lib/api-types";

type InvestorPermissions = {
  can_view?: boolean;
  can_download?: boolean;
  has_expiry?: boolean;
  expires_at?: string | null;
  [key: string]: unknown;
};

export default function InvestorDashboardPage() {
  const { user, ndaStatus, loading, error } = useRequireNDA();
  const [permissions, setPermissions] = useState<InvestorPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  // Quick Q&A state
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("General");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<QAThreadResponse[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);
        setPermissionsError(null);
        const data = await apiClient.getUserPermissions(user.id);
        if (!cancelled && data && typeof data === "object") {
          setPermissions(data as InvestorPermissions);
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load access permissions";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setPermissionsError(message);
      } finally {
        if (!cancelled) {
          setPermissionsLoading(false);
        }
      }
    };

    void loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoryError(null);
        const cats = await apiClient.getCategoriesList();
        if (!cancelled && Array.isArray(cats)) {
          setCategoryCount(cats.length);
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load document categories";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setCategoryError(message);
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load recent questions
  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      try {
        const threads = await apiClient.getQAThreads();
        if (!cancelled && Array.isArray(threads)) {
          setRecentQuestions(threads.slice(0, 3)); // Show only 3 most recent
        }
      } catch {
        // Silently fail - Q&A is optional
      }
    };

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questionText.trim().length < 10) {
      setQuestionError("Question must be at least 10 characters");
      return;
    }

    try {
      setSubmittingQuestion(true);
      setQuestionError(null);
      setQuestionSuccess(null);

      await apiClient.submitQuestion({
        question_text: questionText.trim(),
        category: questionCategory,
        is_urgent: false,
      });

      setQuestionSuccess("Your question has been submitted! We'll respond soon.");
      setQuestionText("");
      
      // Refresh questions list
      const threads = await apiClient.getQAThreads();
      if (Array.isArray(threads)) {
        setRecentQuestions(threads.slice(0, 3));
      }
    } catch (err) {
      let message = "Unable to submit question";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setQuestionError(message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  };

  const accessExpiry =
    (permissions && typeof permissions.expires_at === "string" && permissions.expires_at) ||
    ndaStatus?.accepted_at ||
    null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          SAYeTECH Investor Data Room
        </h1>
        <p className="text-sm text-slate-600">
          High-level overview of SAYeTECH and quick links to key documents.
        </p>
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Round details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your investor profile is linked to <span className="font-medium">{user?.email}</span>.
            For current round size, valuation, and terms, please refer to the
            latest round documents in the data room.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3 text-xs"
          >
            View round documents
          </Button>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Key metrics</h2>
          <p className="mt-1 text-xs text-slate-500">
            You have access to structured document categories that mirror the
            admin data room.
          </p>
          <div className="mt-2 text-xs text-slate-700">
            <div className="flex items-baseline justify-between">
              <span>Document categories</span>
              <span className="font-mono text-[11px]">
                {categoryCount !== null ? categoryCount : "-"}
              </span>
            </div>
            {categoryError && (
              <p className="mt-1 text-[11px] text-red-600">{categoryError}</p>
            )}
          </div>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-sm font-medium text-slate-700">Access status</h2>
          <p className="mt-1 text-xs text-slate-600">
            Signed in as <span className="font-medium">{user?.full_name}</span>{" "}
            ({user?.email}).
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-700">
            <div>
              <span className="font-medium">NDA status:</span>{" "}
              {ndaStatus?.accepted ? "Accepted" : "Pending"}
              {ndaStatus?.accepted && ndaStatus.accepted_at && (
                <span className="text-slate-500">
                  {" "}
                  (since {formatDate(ndaStatus.accepted_at)})
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Permissions:</span>{" "}
              {permissionsLoading && <span>Loading...</span>}
              {!permissionsLoading && !permissions && <span>Not available</span>}
              {!permissionsLoading && permissions && (
                <span>
                  {permissions.can_view ? "Can view" : "View only as allowed"}
                  {" · "}
                  {permissions.can_download ? "Can download" : "No downloads"}
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Access expiry:</span>{" "}
              {accessExpiry ? formatDate(accessExpiry) : "No expiry set"}
            </div>
            {permissionsError && (
              <p className="mt-1 text-[11px] text-red-600">{permissionsError}</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-2">
        <h2 className="text-sm font-medium text-slate-700">Start your review</h2>
        <p className="mt-2 text-xs text-slate-500">
          Use the left navigation to explore structured categories like Company
          Overview, Financials, and Legal. Your access controls what you can
          view and download.
        </p>
      </Card>

      {/* Quick Q&A Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-700">Have a Question?</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ask our team anything about SAYeTECH. We typically respond within 24 hours.
            </p>
          </div>
          <Link href="/qa">
            <Button type="button" size="sm" variant="secondary">
              View All Q&A
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmitQuestion} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setQuestionError(null);
                  setQuestionSuccess(null);
                }}
                placeholder="Type your question here..."
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                disabled={submittingQuestion}
              />
            </div>
            <div className="w-32">
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className="w-full h-full rounded-lg border border-slate-200 px-2 text-xs focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                disabled={submittingQuestion}
              >
                <option value="General">General</option>
                <option value="Financials">Financials</option>
                <option value="Product">Product</option>
                <option value="Team">Team</option>
                <option value="Legal">Legal</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
          </div>
          
          {questionError && <Alert variant="error">{questionError}</Alert>}
          {questionSuccess && <Alert variant="success">{questionSuccess}</Alert>}
          
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submittingQuestion || questionText.trim().length < 10}>
              {submittingQuestion ? "Submitting..." : "Submit Question"}
            </Button>
          </div>
        </form>

        {/* Recent Questions */}
        {recentQuestions.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-medium text-slate-600 mb-2">Your Recent Questions</h3>
            <div className="space-y-2">
              {recentQuestions.map((q) => (
                <div key={q.id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50">
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    q.status === "answered" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">{q.question_text}</p>
                    <p className="text-[10px] text-slate-500">
                      {q.status === "answered" ? "Answered" : "Pending"} · {q.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

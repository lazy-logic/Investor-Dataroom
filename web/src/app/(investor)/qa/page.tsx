"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { apiClient, APIClientError } from "@/lib/api-client";
import { useRequireNDA } from "@/contexts/AuthContext";
import type { QAThreadResponse, QuestionCreate } from "@/lib/api-types";

const QUESTION_CATEGORIES = [
  "General",
  "Financials",
  "Product",
  "Market",
  "Team",
  "Legal",
  "Technology",
  "Other",
];

export default function QAPage() {
  const { user, loading: authLoading } = useRequireNDA();
  
  const [threads, setThreads] = useState<QAThreadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QAThreadResponse[] | null>(null);
  const [searching, setSearching] = useState(false);
  
  // New question form state
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("General");
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const loadThreads = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getQAThreads();
        if (!cancelled && Array.isArray(data)) {
          setThreads(data);
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load Q&A threads";
        if (err instanceof APIClientError) {
          message = err.message || message;
        }
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadThreads();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) {
      setSearchResults(null);
      return;
    }

    try {
      setSearching(true);
      const results = await apiClient.searchQA(searchQuery.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      let message = "Search failed";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questionText.trim().length < 10) {
      setSubmitError("Question must be at least 10 characters long");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const data: QuestionCreate = {
        question_text: questionText.trim(),
        category: questionCategory,
        is_urgent: isUrgent,
      };

      await apiClient.submitQuestion(data);
      
      setSubmitSuccess("Your question has been submitted. You'll be notified when it's answered.");
      setQuestionText("");
      setQuestionCategory("General");
      setIsUrgent(false);
      
      // Refresh threads
      const updatedThreads = await apiClient.getQAThreads();
      if (Array.isArray(updatedThreads)) {
        setThreads(updatedThreads);
      }
      
      // Hide form after success
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(null);
      }, 2000);
    } catch (err) {
      let message = "Unable to submit question";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "answered":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const displayThreads = searchResults !== null ? searchResults : threads;

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Q&A</h1>
          <p className="text-sm text-slate-600">
            Ask questions about SAYeTECH and get answers from the team.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Ask a Question"}
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* New Question Form */}
      {showForm && (
        <Card className="space-y-4 border-brand-red/20 bg-brand-red/5">
          <h2 className="text-sm font-semibold text-slate-900">Submit a New Question</h2>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What would you like to know about SAYeTECH?"
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 10 characters</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  disabled={submitting}
                >
                  {QUESTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-red focus:ring-brand-red"
                  disabled={submitting}
                />
                <label htmlFor="urgent" className="text-sm text-slate-700">
                  Mark as urgent
                </label>
              </div>
            </div>

            {submitError && <Alert variant="error">{submitError}</Alert>}
            {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || questionText.trim().length < 10}>
                {submitting ? "Submitting..." : "Submit Question"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <Card className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search public Q&A (min 3 characters)..."
            className="flex-1"
          />
          <Button type="submit" variant="secondary" disabled={searching || searchQuery.length < 3}>
            {searching ? "Searching..." : "Search"}
          </Button>
          {searchResults !== null && (
            <Button type="button" variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>
        {searchResults !== null && (
          <p className="text-xs text-slate-500">
            Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </Card>

      {/* Q&A Threads */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {searchResults !== null ? "Search Results" : "Your Questions"}
        </h2>

        {displayThreads.length === 0 ? (
          <Card className="py-8 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                {searchResults !== null ? "No matching questions found" : "No questions yet"}
              </h3>
              <p className="text-sm text-slate-600">
                {searchResults !== null 
                  ? "Try a different search term or ask a new question."
                  : "Be the first to ask a question about SAYeTECH!"}
              </p>
              {searchResults === null && (
                <Button onClick={() => setShowForm(true)} className="mt-2">
                  Ask a Question
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayThreads.map((thread) => (
              <Card key={thread.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(thread.status)}`}>
                        {thread.status}
                      </span>
                      <span className="text-xs text-slate-500">{thread.category}</span>
                      {thread.is_urgent && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{thread.question_text}</p>
                    <p className="text-xs text-slate-500">
                      Asked on {formatDate(thread.asked_at)}
                    </p>
                  </div>
                </div>

                {thread.answer_text && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-green-700">Answer</span>
                      {thread.answered_at && (
                        <span className="text-xs text-green-600">
                          • {formatDate(thread.answered_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{thread.answer_text}</p>
                  </div>
                )}

                {!thread.answer_text && thread.status.toLowerCase() === "pending" && (
                  <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-100">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-yellow-700">
                        Awaiting response from the SAYeTECH team
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

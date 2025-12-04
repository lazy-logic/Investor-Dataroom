"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { adminApiClient } from "@/lib/admin-api-client";
import { APIClientError } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { QAThreadResponse } from "@/lib/api-types";

type FilterStatus = "all" | "pending" | "answered";

export default function AdminQAPage() {
  const [threads, setThreads] = useState<QAThreadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  
  // Answer modal state
  const [answeringThread, setAnsweringThread] = useState<QAThreadResponse | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiClient.getQAThreads();
      if (Array.isArray(data)) {
        setThreads(data);
      }
    } catch (err) {
      let message = "Unable to load Q&A threads";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setError(message);
      showToast({
        variant: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAnswer = (thread: QAThreadResponse) => {
    setAnsweringThread(thread);
    setAnswerText(thread.answer_text || "");
    setIsPublic(thread.is_public);
    setSubmitError(null);
  };

  const handleCloseAnswer = () => {
    if (submitting) return;
    setAnsweringThread(null);
    setAnswerText("");
    setIsPublic(false);
    setSubmitError(null);
  };

  const handleSubmitAnswer = async () => {
    if (!answeringThread) return;
    
    if (answerText.trim().length < 5) {
      setSubmitError("Answer must be at least 5 characters long");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      await adminApiClient.answerQuestion(answeringThread.id, {
        answer_text: answerText.trim(),
        is_public: isPublic,
      });

      showToast({
        variant: "success",
        title: "Answer submitted",
        description: "The question has been answered successfully.",
      });

      // Refresh threads
      await loadThreads();
      handleCloseAnswer();
    } catch (err) {
      let message = "Unable to submit answer";
      if (err instanceof APIClientError) {
        message = err.message || message;
      }
      setSubmitError(message);
      showToast({
        variant: "error",
        title: "Error",
        description: message,
      });
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
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const filteredThreads = threads.filter((thread) => {
    if (filterStatus === "all") return true;
    return thread.status.toLowerCase() === filterStatus;
  });

  const pendingCount = threads.filter(t => t.status.toLowerCase() === "pending").length;
  const answeredCount = threads.filter(t => t.status.toLowerCase() === "answered").length;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Q&A Management</h1>
          <p className="text-sm text-slate-600">
            Review and answer investor questions.
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <div className="text-2xl font-bold text-slate-900">{threads.length}</div>
            <div className="text-sm text-slate-600">Total Questions</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
            <div className="text-sm text-slate-600">Answered</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          <Button
            size="sm"
            variant={filterStatus === "all" ? "primary" : "secondary"}
            onClick={() => setFilterStatus("all")}
          >
            All ({threads.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "pending" ? "primary" : "secondary"}
            onClick={() => setFilterStatus("pending")}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "answered" ? "primary" : "secondary"}
            onClick={() => setFilterStatus("answered")}
          >
            Answered ({answeredCount})
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="secondary" onClick={() => void loadThreads()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </Card>

        {/* Questions List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No questions found</h3>
              <p className="text-sm text-slate-600">
                {filterStatus === "all" 
                  ? "No investor questions have been submitted yet."
                  : `No ${filterStatus} questions at the moment.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredThreads.map((thread) => (
              <Card key={thread.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(thread.status)}`}>
                        {thread.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {thread.category}
                      </span>
                      {thread.is_urgent && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Urgent
                        </span>
                      )}
                      {thread.is_public && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{thread.question_text}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Asked by: {thread.asked_by}</span>
                      <span>•</span>
                      <span>{formatDate(thread.asked_at)}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={thread.answer_text ? "secondary" : "primary"}
                    onClick={() => handleOpenAnswer(thread)}
                  >
                    {thread.answer_text ? "Edit Answer" : "Answer"}
                  </Button>
                </div>

                {thread.answer_text && (
                  <div className="rounded-lg bg-green-50 p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-green-700">Answer</span>
                      {thread.answered_by && (
                        <span className="text-xs text-green-600">by {thread.answered_by}</span>
                      )}
                      {thread.answered_at && (
                        <span className="text-xs text-green-600">• {formatDate(thread.answered_at)}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{thread.answer_text}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer Modal */}
      <Modal
        open={answeringThread !== null}
        onClose={handleCloseAnswer}
        title={answeringThread?.answer_text ? "Edit Answer" : "Answer Question"}
      >
        {answeringThread && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500">Question</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                  {answeringThread.category}
                </span>
              </div>
              <p className="text-sm text-slate-900">{answeringThread.question_text}</p>
              <p className="mt-2 text-xs text-slate-500">
                Asked by {answeringThread.asked_by} on {formatDate(answeringThread.asked_at)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Answer
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 5 characters</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-red focus:ring-brand-red"
                disabled={submitting}
              />
              <label htmlFor="is_public" className="text-sm text-slate-700">
                Make this Q&A public (visible to all investors)
              </label>
            </div>

            {submitError && <Alert variant="error">{submitError}</Alert>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseAnswer}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={submitting || answerText.trim().length < 5}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

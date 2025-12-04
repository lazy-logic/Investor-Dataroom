"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { apiClient, APIClientError } from "@/lib/api-client";
import { useRequireNDA } from "@/contexts/AuthContext";
import type {
  ExecutiveSummary,
  KeyMetric,
  Milestone,
  Testimonial,
  Award,
  MediaCoverage,
} from "@/lib/api-types";

export default function CompanyInfoPage() {
  const { loading: authLoading } = useRequireNDA();
  
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [metrics, setMetrics] = useState<KeyMetric[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [media, setMedia] = useState<MediaCoverage[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const loadCompanyInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all company information in parallel
        const [
          summaryData,
          metricsData,
          milestonesData,
          testimonialsData,
          awardsData,
          mediaData,
        ] = await Promise.allSettled([
          apiClient.getExecutiveSummary(),
          apiClient.getKeyMetrics(),
          apiClient.getMilestones(),
          apiClient.getTestimonials(true),
          apiClient.getAwards(),
          apiClient.getMediaCoverage(),
        ]);

        if (cancelled) return;

        // Handle each result
        if (summaryData.status === "fulfilled") {
          setSummary(summaryData.value);
        }
        if (metricsData.status === "fulfilled" && Array.isArray(metricsData.value)) {
          setMetrics(metricsData.value);
        }
        if (milestonesData.status === "fulfilled" && Array.isArray(milestonesData.value)) {
          setMilestones(milestonesData.value);
        }
        if (testimonialsData.status === "fulfilled" && Array.isArray(testimonialsData.value)) {
          setTestimonials(testimonialsData.value);
        }
        if (awardsData.status === "fulfilled" && Array.isArray(awardsData.value)) {
          setAwards(awardsData.value);
        }
        if (mediaData.status === "fulfilled" && Array.isArray(mediaData.value)) {
          setMedia(mediaData.value);
        }

        // Check if all failed
        const allFailed = [summaryData, metricsData, milestonesData, testimonialsData, awardsData, mediaData]
          .every(r => r.status === "rejected");
        
        if (allFailed) {
          setError("Unable to load company information. The data may not be available yet.");
        }
      } catch (err) {
        if (cancelled) return;
        let message = "Unable to load company information";
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

    void loadCompanyInfo();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const hasContent = summary || metrics.length > 0 || milestones.length > 0 || 
                     testimonials.length > 0 || awards.length > 0 || media.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Company Information</h1>
        <p className="text-sm text-slate-600">
          Learn about SAYeTECH&apos;s mission, achievements, and market position.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {!hasContent && !error && (
        <Card className="py-12 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Company information coming soon</h3>
            <p className="text-sm text-slate-600">
              Detailed company information, metrics, and milestones will be available here once configured by the admin team.
            </p>
          </div>
        </Card>
      )}

      {/* Executive Summary */}
      {summary && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {summary.title || "Executive Summary"}
          </h2>
          {summary.tagline && (
            <p className="text-sm font-medium text-brand-red">{summary.tagline}</p>
          )}
          {summary.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{summary.description}</p>
          )}
          {summary.highlights && summary.highlights.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {summary.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Key Metrics */}
      {metrics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Key Metrics</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="text-center">
                <div className="text-2xl font-bold text-brand-red">
                  {metric.value}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-700">{metric.label}</div>
                {metric.change && (
                  <div className={`mt-1 text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                  }`}>
                    {metric.change}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Company Milestones</h2>
          <Card>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-brand-red bg-white" />
                    <div className="text-xs font-medium text-brand-red">
                      {formatDate(milestone.date)}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">
                      {milestone.title}
                    </div>
                    {milestone.description && (
                      <p className="mt-1 text-xs text-slate-600">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">What People Say</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="space-y-3">
                <svg className="h-6 w-6 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm text-slate-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{testimonial.author}</div>
                    {(testimonial.role || testimonial.company) && (
                      <div className="text-xs text-slate-500">
                        {testimonial.role}{testimonial.role && testimonial.company ? ", " : ""}{testimonial.company}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Awards & Recognition</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award, idx) => (
              <Card key={idx} className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{award.title}</div>
                  {award.organization && (
                    <div className="text-xs text-slate-600">{award.organization}</div>
                  )}
                  {award.year && (
                    <div className="text-xs text-slate-500">{award.year}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Media Coverage */}
      {media.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">In the News</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {media.map((item, idx) => (
              <Card key={idx} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-brand-red hover:text-brand-red/80"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">{item.publication}</span>
                  {item.date && <span>• {formatDate(item.date)}</span>}
                </div>
                {item.excerpt && (
                  <p className="text-xs text-slate-600 line-clamp-2">{item.excerpt}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

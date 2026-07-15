"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState, LoadingSkeleton, StatCard, StatusBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/services/analytics.service";
import { moderationService } from "@/services/moderation.service";

type DashboardPayload = {
  users_count?: number;
  rooms_count?: number;
  elections_count?: number;
  polls_count?: number;
  discussions_count?: number;
  candidate_count?: number;
  posts_count?: number;
  issues_count?: number;
  reports_count?: number;
  politicians_count?: number;
  suspended_users?: number;
  trending_politicians?: Array<{ id?: string; name?: string; approvalScore?: number; state?: string }>;
  trending_issues?: Array<{ id?: string; title?: string; upvoteCount?: number; state?: string }>;
};

function unwrapDashboard(payload: unknown): DashboardPayload {
  if (!payload || typeof payload !== "object") return {};
  if ("data" in payload && payload.data && typeof payload.data === "object") return payload.data as DashboardPayload;
  return payload as DashboardPayload;
}

function extractReports(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["data", "reports", "items", "results"]) {
    if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
  }
  return [];
}

export function AdminDashboard() {
  const analytics = useQuery({ queryKey: ["control", "dashboard", "analytics"], queryFn: analyticsService.dashboard });
  const reports = useQuery({ queryKey: ["control", "dashboard", "reports"], queryFn: () => moderationService.reports({ take: 6 }) });
  const dashboard = unwrapDashboard(analytics.data);
  const reportRows = extractReports(reports.data);

  const volumeSeries = useMemo(
    () => [
      { name: "Users", value: Number(dashboard.users_count ?? 0) },
      { name: "Posts", value: Number(dashboard.posts_count ?? 0) },
      { name: "Discussions", value: Number(dashboard.discussions_count ?? 0) },
      { name: "Polls", value: Number(dashboard.polls_count ?? 0) },
      { name: "Elections", value: Number(dashboard.elections_count ?? 0) },
      { name: "Issues", value: Number(dashboard.issues_count ?? 0) }
    ],
    [dashboard]
  );

  const politicianSeries = useMemo(
    () =>
      (dashboard.trending_politicians ?? []).map((item) => ({
        name: String(item.name ?? "Politician").slice(0, 16),
        score: Number(item.approvalScore ?? 0)
      })),
    [dashboard.trending_politicians]
  );

  const issueSeries = useMemo(
    () =>
      (dashboard.trending_issues ?? []).map((item) => ({
        name: String(item.title ?? "Issue").slice(0, 16),
        votes: Number(item.upvoteCount ?? 0)
      })),
    [dashboard.trending_issues]
  );

  const metrics = [
    { label: "Users", value: String(dashboard.users_count ?? 0), href: "/control/users" },
    { label: "Posts", value: String(dashboard.posts_count ?? 0), href: "/control/posts" },
    { label: "Open reports", value: String(dashboard.reports_count ?? 0), href: "/control/moderation" },
    { label: "Politicians", value: String(dashboard.politicians_count ?? 0), href: "/control/politicians" },
    { label: "Suspended", value: String(dashboard.suspended_users ?? 0), href: "/control/users" }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Control dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Live platform totals, moderation pressure, and trending civic signals.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/control/users">View Users</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/control/moderation">View Reports</Link>
            </Button>
            <Button asChild className="rounded-lg">
              <Link href="/control/analytics">View Analytics</Link>
            </Button>
          </div>
        </div>
      </section>

      {analytics.isLoading ? <LoadingSkeleton /> : null}
      {analytics.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Could not load analytics.</p>
          <p className="mt-1">{analytics.error instanceof Error ? analytics.error.message : "Something went wrong. Please try again."}</p>
        </div>
      ) : null}

      {!analytics.isLoading && !analytics.isError ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} change="Live" period="Current totals" href={metric.href} />
          ))}
        </section>
      ) : null}

      {!analytics.isLoading && !analytics.isError ? (
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm xl:col-span-1">
            <h3 className="font-semibold text-foreground">Content volume</h3>
            <p className="mt-1 text-sm text-muted-foreground">Platform totals across core modules.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="rgb(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-semibold text-foreground">Top politicians</h3>
            <p className="mt-1 text-sm text-muted-foreground">Highest approval scores.</p>
            <div className="mt-4 h-64">
              {politicianSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={politicianSeries} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="rgb(34 197 94)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No politician trends" description="Approval leaders will appear here." />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-semibold text-foreground">Top issues</h3>
            <p className="mt-1 text-sm text-muted-foreground">Most upvoted civic issues.</p>
            <div className="mt-4 h-64">
              {issueSeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issueSeries} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="votes" fill="rgb(59 130 246)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No issue trends" description="Trending issues will appear here." />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Pending Moderation Queue</h3>
          <p className="mt-1 text-sm text-muted-foreground">Reports waiting for admin review.</p>
        </div>
        {reports.isLoading ? <LoadingSkeleton /> : null}
        {reports.isError ? (
          <div className="p-4 text-sm text-destructive">{reports.error instanceof Error ? reports.error.message : "Could not load moderation reports."}</div>
        ) : null}
        {!reports.isLoading && !reports.isError && reportRows.length ? (
          <div className="divide-y divide-border">
            {reportRows.map((report) => (
              <div key={String(report.id)} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {String(report.targetType ?? "Report")} - {String(report.targetId ?? report.id)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {String(report.reason ?? "No reason")} · {String(report.createdAt ?? "")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={report.reviewed ? "Reviewed" : "Pending"} />
                  <Button asChild size="sm" className="rounded-lg">
                    <Link href="/control/moderation">Review</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!reports.isLoading && !reports.isError && !reportRows.length ? (
          <div className="p-4">
            <EmptyState title="No moderation reports" description="There are no reports waiting for review." />
          </div>
        ) : null}
      </section>
    </div>
  );
}

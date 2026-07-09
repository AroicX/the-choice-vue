"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, LoadingSkeleton, StatCard, StatusBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/services/analytics.service";
import { moderationService } from "@/services/moderation.service";

function toMetricEntries(payload: unknown) {
  const source = payload && typeof payload === "object" && "data" in payload ? (payload as { data: unknown }).data : payload;
  if (!source || typeof source !== "object") return [];
  return Object.entries(source as Record<string, unknown>).map(([key, value]) => ({
    label: key.replace(/_/g, " "),
    value: String(value ?? "0")
  }));
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
  const analytics = useQuery({ queryKey: ["control", "dashboard", "analytics"], queryFn: analyticsService.overview });
  const reports = useQuery({ queryKey: ["control", "dashboard", "reports"], queryFn: () => moderationService.reports({ take: 6 }) });
  const metrics = toMetricEntries(analytics.data);
  const reportRows = extractReports(reports.data);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Live control overview from analytics and moderation data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg bg-white"><Link href="/control/users">View Users</Link></Button>
            <Button asChild variant="outline" className="rounded-lg bg-white"><Link href="/control/moderation">View Reports</Link></Button>
            <Button asChild className="rounded-lg"><Link href="/control/analytics">View Analytics</Link></Button>
          </div>
        </div>
      </section>

      {analytics.isLoading ? <LoadingSkeleton /> : null}
      {analytics.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Could not load analytics.</p>
          <p className="mt-1">{analytics.error instanceof Error ? analytics.error.message : "Something went wrong. Please try again."}</p>
        </div>
      ) : null}
      {!analytics.isLoading && !analytics.isError && metrics.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} change="Live" period="Current totals" href="/control/analytics" />
          ))}
        </section>
      ) : null}
      {!analytics.isLoading && !analytics.isError && !metrics.length ? (
        <EmptyState title="No analytics yet" description="No analytics metrics are available right now." />
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-semibold text-slate-950">Pending Moderation Queue</h3>
          <p className="mt-1 text-sm text-slate-500">Reports waiting for admin review.</p>
        </div>
        {reports.isLoading ? <LoadingSkeleton /> : null}
        {reports.isError ? (
          <div className="p-4 text-sm text-red-700">{reports.error instanceof Error ? reports.error.message : "Could not load moderation reports."}</div>
        ) : null}
        {!reports.isLoading && !reports.isError && reportRows.length ? (
          <div className="divide-y divide-slate-100">
            {reportRows.map((report) => (
              <div key={String(report.id)} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{String(report.targetType ?? "Report")} - {String(report.targetId ?? report.id)}</p>
                  <p className="mt-1 text-xs text-slate-500">{String(report.reason ?? "No reason")} · {String(report.createdAt ?? "")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={report.reviewed ? "Reviewed" : "Pending"} />
                  <Button asChild size="sm" className="rounded-lg"><Link href="/control/moderation">Review</Link></Button>
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

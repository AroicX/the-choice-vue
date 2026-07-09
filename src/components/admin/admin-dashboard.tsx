"use client";

import Link from "next/link";
import { useState } from "react";
import { gooeyToast } from "goey-toast";
import { dashboardStats, recentActivity } from "@/lib/admin-control-data";
import { ConfirmModal, DetailsDrawer, StatCard, StatusBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import type { AdminRecord } from "@/lib/admin-control-data";

const moderationRows: AdminRecord[] = [
  {
    id: "mod_001",
    title: "Spam report on power supply post",
    status: "pending",
    values: { content: "Spam report on power supply post", type: "POST", reporter: "Musa Danladi", reason: "SPAM", priority: "High", status: "Pending" },
    details: [
      { label: "Report reason", value: "SPAM" },
      { label: "Reporter", value: "Musa Danladi" },
      { label: "Reported user", value: "Unknown" },
      { label: "Content preview", value: "Repeated external links in discussion" },
      { label: "Previous reports", value: 2 },
      { label: "AI moderation score", value: "0.81" }
    ]
  },
  {
    id: "mod_002",
    title: "Harassment report on comment",
    status: "pending",
    values: { content: "Harassment report on comment", type: "COMMENT", reporter: "Adaora Okeke", reason: "HARASSMENT", priority: "Medium", status: "Pending" },
    details: [
      { label: "Report reason", value: "HARASSMENT" },
      { label: "Reporter", value: "Adaora Okeke" },
      { label: "Reported user", value: "Teni Balogun" },
      { label: "Content preview", value: "Personal attack in a reply thread" },
      { label: "Previous reports", value: 1 },
      { label: "AI moderation score", value: "0.67" }
    ]
  }
];

export function AdminDashboard() {
  const [drawerRecord, setDrawerRecord] = useState<AdminRecord | null>(null);
  const [reviewRecord, setReviewRecord] = useState<AdminRecord | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Platform activity, moderation pressure, civic participation, and system health at a glance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg bg-white"><Link href="/control/users">View Users</Link></Button>
            <Button asChild variant="outline" className="rounded-lg bg-white"><Link href="/control/moderation">View Reports</Link></Button>
            <Button asChild className="rounded-lg"><Link href="/control/analytics">View Analytics</Link></Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">Recent Activity</h3>
            <p className="mt-1 text-sm text-slate-500">Latest user, content, vote, and rating events.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <button
                key={`${activity.type}-${activity.time}`}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
                onClick={() => setDrawerRecord({
                  id: activity.time,
                  title: activity.title,
                  subtitle: activity.type,
                  values: activity,
                  details: [
                    { label: "Type", value: activity.type },
                    { label: "Event", value: activity.title },
                    { label: "Time", value: activity.time },
                    { label: "Target", value: activity.target }
                  ]
                })}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.type}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">Pending Moderation Queue</h3>
            <p className="mt-1 text-sm text-slate-500">Reports waiting for review or escalation.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {moderationRows.map((row) => (
              <div key={row.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{String(row.values.reason)} • {String(row.values.priority)} priority</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-lg" onClick={() => setReviewRecord(row)}>Review</Button>
                  <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={() => gooeyToast.success("Report dismissed")}>Dismiss</Button>
                  <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={() => gooeyToast.success("Content removal queued")}>Remove content</Button>
                  <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={() => gooeyToast.success("User suspension queued")}>Suspend user</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DetailsDrawer record={drawerRecord} open={Boolean(drawerRecord)} onClose={() => setDrawerRecord(null)} />
      <ConfirmModal
        open={Boolean(reviewRecord)}
        title={`Review ${reviewRecord?.title ?? "report"}`}
        message="Choose a moderation action after reviewing the report context. This records an admin moderation action when connected to the API."
        requireReason
        onClose={() => setReviewRecord(null)}
        onConfirm={() => {
          setReviewRecord(null);
          gooeyToast.success("Action completed successfully");
        }}
      />
    </div>
  );
}

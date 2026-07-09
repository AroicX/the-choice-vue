"use client";

import { useState } from "react";
import { gooeyToast } from "goey-toast";
import type { AdminRecord, AdminResourceConfig } from "@/lib/admin-control-data";
import {
  ConfirmModal,
  CreateModal,
  DataTable,
  DateRangeFilter,
  DetailsDrawer,
  EditModal,
  FilterDropdown,
  Pagination,
  SearchInput,
  useFilteredRecords
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";

type ConfirmState = {
  title: string;
  message: string;
  destructive?: boolean;
  requireReason?: boolean;
  requireText?: string;
} | null;

export function AdminResourcePage({ config }: { config: AdminResourceConfig }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [drawerRecord, setDrawerRecord] = useState<AdminRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [activeRecord, setActiveRecord] = useState<AdminRecord | null>(null);
  const filtered = useFilteredRecords(config.records, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));

  function success(description = "Action completed successfully") {
    gooeyToast.success(description);
  }

  function handleAction(action: string, record: AdminRecord) {
    setActiveRecord(record);
    if (action.toLowerCase().includes("view") || action === "Review" || action === "Manage Candidates" || action === "Manage Promises") {
      setDrawerRecord(record);
      return;
    }
    if (action.toLowerCase().includes("edit") || action === "Change Role" || action === "Edit Criteria") {
      setEditOpen(true);
      return;
    }
    if (action.toLowerCase().includes("delete")) {
      setConfirm({
        title: `Delete ${record.title}?`,
        message: "This action cannot be undone. Type DELETE to continue.",
        destructive: true,
        requireText: "DELETE"
      });
      return;
    }
    if (["Suspend", "Hide", "Remove Content", "Warn User", "Escalate", "Deactivate", "Archive", "Close Poll", "Close Election", "Reset Rating"].some((word) => action.includes(word))) {
      setConfirm({
        title: `${action} ${record.title}?`,
        message: "Please provide a reason. The request will be sent to the API when the endpoint supports this workflow.",
        destructive: action.includes("Delete") || action.includes("Remove") || action.includes("Suspend"),
        requireReason: true
      });
      return;
    }
    setConfirm({
      title: `${action} ${record.title}?`,
      message: "Please confirm this admin action.",
      destructive: false
    });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Control</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{config.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.secondaryActions?.map((action) => (
            <Button key={action} variant="outline" className="rounded-lg bg-white" onClick={() => success(action)}>{action}</Button>
          ))}
          <Button className="rounded-lg" onClick={() => setCreateOpen(true)}>{config.primaryAction}</Button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder={`Search ${config.title.toLowerCase()}...`} />
          <div className="flex flex-wrap gap-2">
            {config.filters?.map((filter) => (
              filter.toLowerCase().includes("date") ? <DateRangeFilter key={filter} /> : <FilterDropdown key={filter} label={filter} />
            ))}
          </div>
        </div>
      </section>

      <DataTable config={config} records={filtered} onAction={handleAction} />
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <DetailsDrawer record={drawerRecord} open={Boolean(drawerRecord)} onClose={() => setDrawerRecord(null)} />
      <CreateModal
        open={createOpen}
        title={config.primaryAction}
        fields={config.createFields}
        onClose={() => setCreateOpen(false)}
        onSubmit={() => {
          setCreateOpen(false);
          success();
        }}
      />
      <EditModal
        open={editOpen}
        title={`Edit ${activeRecord?.title ?? config.title}`}
        fields={config.editFields ?? config.createFields}
        onClose={() => setEditOpen(false)}
        onSubmit={() => {
          setEditOpen(false);
          success();
        }}
      />
      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        destructive={confirm?.destructive}
        requireReason={confirm?.requireReason}
        requireText={confirm?.requireText}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          success();
        }}
      />
    </div>
  );
}

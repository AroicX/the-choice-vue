"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import {
  ConfirmModal,
  CreateModal,
  DataTable,
  DateRangeFilter,
  DetailsDrawer,
  EditModal,
  FilterDropdown,
  LoadingSkeleton,
  Pagination,
  SearchInput,
  useFilteredRecords
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import type { AdminPageMeta, AdminRecord } from "@/lib/admin-control-data";

type AdminApiResourcePageProps = {
  meta: AdminPageMeta;
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
  mapRecord: (record: Record<string, unknown>) => AdminRecord;
  createFn?: (payload: Record<string, unknown>) => Promise<unknown>;
  updateFn?: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
  deleteFn?: (id: string) => Promise<unknown>;
  customAction?: (action: string, record: AdminRecord) => Promise<unknown> | void;
  createPayload?: (payload: Record<string, string | boolean>) => Record<string, unknown>;
  updatePayload?: (payload: Record<string, string | boolean>, record: AdminRecord) => Record<string, unknown>;
};

type ConfirmState = {
  title: string;
  message: string;
  destructive?: boolean;
  requireReason?: boolean;
  requireText?: string;
  onConfirm: () => void;
} | null;

function extractList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(Boolean) as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["data", "users", "user", "posts", "post", "comments", "comment", "discussions", "poll", "election", "notifications", "reports", "items", "results"]) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter(Boolean) as Record<string, unknown>[];
  }
  return [];
}

function displayError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function AdminApiResourcePage({
  meta,
  queryKey,
  queryFn,
  mapRecord,
  createFn,
  updateFn,
  deleteFn,
  customAction,
  createPayload,
  updatePayload
}: AdminApiResourcePageProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [drawerRecord, setDrawerRecord] = useState<AdminRecord | null>(null);
  const [activeRecord, setActiveRecord] = useState<AdminRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey, queryFn });
  const records = useMemo(() => extractList(data).map(mapRecord), [data, mapRecord]);
  const filtered = useFilteredRecords(records, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, string | boolean>) => {
      if (!createFn) throw new Error("Creating is not available for this module yet.");
      return createFn((createPayload?.(payload) ?? payload) as Record<string, unknown>);
    },
    onSuccess: () => {
      gooeyToast.success("Action completed successfully");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) => gooeyToast.error("Something went wrong. Please try again.", { description: displayError(mutationError) })
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string | boolean>) => {
      if (!updateFn || !activeRecord) throw new Error("Updating is not available for this module yet.");
      return updateFn(activeRecord.id, (updatePayload?.(payload, activeRecord) ?? payload) as Record<string, unknown>);
    },
    onSuccess: () => {
      gooeyToast.success("Action completed successfully");
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) => gooeyToast.error("Something went wrong. Please try again.", { description: displayError(mutationError) })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!deleteFn) throw new Error("Deleting is not available for this module yet.");
      return deleteFn(id);
    },
    onSuccess: () => {
      gooeyToast.success("Action completed successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) => gooeyToast.error("Something went wrong. Please try again.", { description: displayError(mutationError) })
  });

  function handleAction(action: string, record: AdminRecord) {
    setActiveRecord(record);
    const actionName = action.toLowerCase();

    if (actionName.includes("view") || actionName.includes("review") || actionName.includes("results") || actionName.includes("scorecard") || actionName.includes("submissions")) {
      setDrawerRecord(record);
      return;
    }

    if (actionName.includes("edit") || actionName.includes("change role") || actionName.includes("criteria")) {
      setEditOpen(true);
      return;
    }

    if (actionName.includes("delete")) {
      setConfirm({
        title: `Delete ${record.title}?`,
        message: "This action cannot be undone. Type DELETE to continue.",
        destructive: true,
        requireText: "DELETE",
        onConfirm: () => deleteMutation.mutate(record.id)
      });
      return;
    }

    setConfirm({
      title: `${action} ${record.title}?`,
      message: "Confirm this admin action.",
      requireReason: actionName.includes("suspend") || actionName.includes("hide") || actionName.includes("remove") || actionName.includes("warn") || actionName.includes("archive"),
      destructive: actionName.includes("suspend") || actionName.includes("remove") || actionName.includes("hide"),
      onConfirm: async () => {
        try {
          await customAction?.(action, record);
          gooeyToast.success("Action completed successfully");
          queryClient.invalidateQueries({ queryKey });
        } catch (actionError) {
          gooeyToast.error("Something went wrong. Please try again.", { description: displayError(actionError) });
        }
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Control</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{meta.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">{meta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {meta.secondaryActions?.map((action) => (
            <Button key={action} variant="outline" className="rounded-lg bg-white" onClick={() => gooeyToast.info(`${action} is not available yet.`)}>{action}</Button>
          ))}
          {meta.primaryAction ? <Button className="rounded-lg" disabled={!createFn} onClick={() => setCreateOpen(true)}>{meta.primaryAction}</Button> : null}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder={`Search ${meta.title.toLowerCase()}...`} />
          <div className="flex flex-wrap gap-2">
            {meta.filters?.map((filter) => (
              filter.toLowerCase().includes("date") ? <DateRangeFilter key={filter} /> : <FilterDropdown key={filter} label={filter} />
            ))}
          </div>
        </div>
      </section>

      {isLoading ? <LoadingSkeleton /> : null}
      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Could not load {meta.title.toLowerCase()}.</p>
          <p className="mt-1">{displayError(error)}</p>
          <Button className="mt-3 rounded-lg" variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : null}
      {!isLoading && !isError ? <DataTable config={meta} records={filtered} onAction={handleAction} onCreate={createFn ? () => setCreateOpen(true) : undefined} /> : null}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <DetailsDrawer record={drawerRecord} open={Boolean(drawerRecord)} onClose={() => setDrawerRecord(null)} />
      <CreateModal
        open={createOpen}
        title={meta.primaryAction ?? `Create ${meta.title}`}
        fields={meta.createFields ?? []}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
      <EditModal
        open={editOpen}
        title={`Edit ${activeRecord?.title ?? meta.title}`}
        fields={meta.editFields ?? meta.createFields ?? []}
        initialValues={activeRecord?.values}
        onClose={() => setEditOpen(false)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
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
          confirm?.onConfirm();
          setConfirm(null);
        }}
      />
    </div>
  );
}

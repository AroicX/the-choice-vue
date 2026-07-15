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
  onConfirm: (reason?: string) => void;
} | null;

const PAGE_SIZE = 10;

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

function dateMatches(record: AdminRecord, range: string) {
  if (!range || range === "all" || range === "Date range") return true;
  const raw = (record.raw as Record<string, unknown> | undefined) ?? {};
  const value = raw.createdAt ?? raw.updatedAt ?? raw.publishedAt ?? record.createdAt;
  if (!value) return true;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return true;
  const days = Number(range);
  if (Number.isNaN(days)) return true;
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
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
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [drawerRecord, setDrawerRecord] = useState<AdminRecord | null>(null);
  const [activeRecord, setActiveRecord] = useState<AdminRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey, queryFn });
  const records = useMemo(() => extractList(data).map(mapRecord), [data, mapRecord]);
  const searched = useFilteredRecords(records, query);
  const filtered = useMemo(
    () =>
      searched.filter((record) => {
        const statusOk =
          !statusFilter ||
          statusFilter === "All" ||
          String(record.status ?? "").toLowerCase() === statusFilter.toLowerCase() ||
          Object.values(record.values).some((value) => String(value).toLowerCase() === statusFilter.toLowerCase());
        return statusOk && dateMatches(record, dateRange);
      }),
    [searched, statusFilter, dateRange]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

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

    if (actionName.includes("mark read")) {
      void (async () => {
        try {
          await customAction?.(action, record);
          gooeyToast.success("Marked as read");
          queryClient.invalidateQueries({ queryKey });
        } catch (actionError) {
          gooeyToast.error("Something went wrong. Please try again.", { description: displayError(actionError) });
        }
      })();
      return;
    }

    if (actionName.includes("delete")) {
      setConfirm({
        title: `Delete ${record.title}?`,
        message: "This action cannot be undone.",
        destructive: true,
        requireReason: true,
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
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Control</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">{meta.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {meta.secondaryActions?.map((action) => (
            <Button key={action} variant="outline" className="rounded-lg" onClick={() => gooeyToast.info(`${action} is not available yet.`)}>
              {action}
            </Button>
          ))}
          {meta.primaryAction ? (
            <Button className="rounded-lg" disabled={!createFn} onClick={() => setCreateOpen(true)}>
              {meta.primaryAction}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder={`Search ${meta.title.toLowerCase()}...`}
          />
          <div className="flex flex-wrap gap-2">
            {meta.filters?.map((filter) =>
              filter.toLowerCase().includes("date") ? (
                <DateRangeFilter
                  key={filter}
                  value={dateRange}
                  onChange={(value) => {
                    setDateRange(value);
                    setPage(1);
                  }}
                />
              ) : (
                <FilterDropdown
                  key={filter}
                  label={filter}
                  options={filter.toLowerCase().includes("status") || filter.toLowerCase().includes("read") ? ["All", "Active", "Pending", "Suspended", "Read", "Unread"] : ["All", "Active", "Pending", "Suspended"]}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                />
              )
            )}
          </div>
        </div>
      </section>

      {isLoading ? <LoadingSkeleton /> : null}
      {isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Could not load {meta.title.toLowerCase()}.</p>
          <p className="mt-1">{displayError(error)}</p>
          <Button className="mt-3 rounded-lg" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      {!isLoading && !isError ? <DataTable config={meta} records={paged} onAction={handleAction} onCreate={createFn ? () => setCreateOpen(true) : undefined} /> : null}
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPage={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

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
        onConfirm={(reason) => {
          confirm?.onConfirm(reason);
          setConfirm(null);
        }}
      />
    </div>
  );
}

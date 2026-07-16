"use client";

import { type ComponentProps, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { AdminActionMenu } from "@/components/admin/admin-action-menu";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { AdminField, AdminFieldOption, AdminPageMeta, AdminRecord, AdminStatus } from "@/lib/admin-control-data";
import { partiesService } from "@/services/parties.service";
import { politiciansService } from "@/services/politicians.service";

function extractSelectList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(Boolean) as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["data", "items", "results", "records", "parties", "politicians"]) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter(Boolean) as Record<string, unknown>[];
  }
  return [];
}

function partySelectOptions(payload: unknown): AdminFieldOption[] {
  return extractSelectList(payload)
    .map((party) => {
      const id = String(party.id ?? "");
      const acronym = String(party.acronym ?? "").trim();
      const name = String(party.name ?? "").trim();
      const label = acronym && name ? `${acronym} — ${name}` : name || acronym || id;
      return { value: id, label };
    })
    .filter((party) => party.value);
}

function politicianSelectOptions(payload: unknown): AdminFieldOption[] {
  return extractSelectList(payload)
    .map((politician) => {
      const id = String(politician.id ?? "");
      const name = String(politician.name ?? "").trim();
      const position = String(politician.position ?? "").trim();
      const state = String(politician.state ?? "").trim();
      const meta = [position, state].filter(Boolean).join(" · ");
      const label = meta ? `${name || id} (${meta})` : name || id;
      return { value: id, label };
    })
    .filter((politician) => politician.value);
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full max-w-sm">
      <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-3.5 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border-border bg-background pl-10" placeholder={placeholder} />
    </div>
  );
}

export function FilterDropdown({
  label,
  options = ["All", "Active", "Pending", "Suspended"],
  value,
  onChange
}: {
  label: string;
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function DateRangeFilter({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  return (
    <select
      value={value ?? "30"}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm"
    >
      <option value="7">Last 7 days</option>
      <option value="30">Last 30 days</option>
      <option value="90">This quarter</option>
      <option value="365">This year</option>
      <option value="all">All time</option>
    </select>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = String(status ?? "active").toLowerCase() as AdminStatus;
  const className =
    {
      active: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
      verified: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300",
      pending: "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300",
      suspended: "bg-destructive/10 text-destructive ring-destructive/20",
      draft: "bg-muted text-muted-foreground ring-border",
      archived: "bg-muted text-muted-foreground ring-border",
      hidden: "bg-muted text-muted-foreground ring-border",
      closed: "bg-muted text-muted-foreground ring-border",
      open: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300"
    }[normalized] ?? "bg-muted text-muted-foreground ring-border";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1", className)}>
      {status ?? "Active"}
    </span>
  );
}

export function RoleBadge({ role }: { role?: string }) {
  return <Badge variant={role === "SUPER_ADMIN" || role === "ADMIN" ? "info" : "secondary"}>{role ?? "USER"}</Badge>;
}

export function StatCard({ label, value, change, period, href }: { label: string; value: string; change: string; period: string; href?: string }) {
  const content = (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-semibold",
            change.startsWith("-") ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          )}
        >
          {change}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{period}</p>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel ? (
          <Button className="mt-4 rounded-lg" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-lg" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" className="rounded-lg" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function ActionMenu({ actions, onAction }: { actions: string[]; onAction: (action: string) => void }) {
  return <AdminActionMenu actions={actions} onAction={onAction} />;
}

export function DataTable({
  config,
  records,
  onAction,
  onCreate
}: {
  config: AdminPageMeta;
  records: AdminRecord[];
  onAction: (action: string, record: AdminRecord) => void;
  onCreate?: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!records.length) {
    return <EmptyState title={config.emptyTitle} description={config.emptyDescription} actionLabel={config.primaryAction} onAction={onCreate} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {selected.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold text-primary">{selected.length} selected</p>
          <div className="flex flex-wrap gap-2">
            {config.bulkActions?.map((action) => (
              <Button key={action} variant="outline" size="sm" className="rounded-lg bg-card" onClick={() => gooeyToast.success(action, { description: "Action completed successfully" })}>
                {action}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={selected.length === records.length}
                  onChange={(event) => setSelected(event.target.checked ? records.map((item) => item.id) : [])}
                />
              </th>
              {config.columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((item) => (
              <tr key={item.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selected.includes(item.id)}
                    onChange={(event) => setSelected((current) => (event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id)))}
                  />
                </td>
                {config.columns.map((column) => {
                  const value = item.values[column.key];
                  return (
                    <td key={column.key} className="max-w-[260px] px-4 py-3 text-foreground">
                      {column.key === "status" || column.key === "accountStatus" || column.key === "verified" ? (
                        <StatusBadge status={String(value ?? item.status ?? "Active")} />
                      ) : column.key === "role" ? (
                        <RoleBadge role={String(value ?? item.role ?? "USER")} />
                      ) : (
                        <span className="line-clamp-2">{String(value ?? "-")}</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <ActionMenu actions={config.rowActions} onAction={(action) => onAction(action, item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetailsDrawer({ record, open, onClose }: { record: AdminRecord | null; open: boolean; onClose: () => void }) {
  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-background/60 backdrop-blur-sm" aria-label="Close drawer" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Details</p>
            <h2 className="text-xl font-semibold text-foreground">{record.title}</h2>
            {record.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{record.subtitle}</p> : null}
          </div>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 grid gap-3">
          {record.details.map((detail) => (
            <div key={detail.label} className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{detail.label}</p>
              <p className="mt-1 text-sm text-foreground">{String(detail.value ?? "-")}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  destructive,
  requireReason,
  requireText,
  onClose,
  onConfirm
}: {
  open: boolean;
  title: string;
  message: string;
  destructive?: boolean;
  requireReason?: boolean;
  requireText?: string;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  if (!open) return null;
  const disabled = Boolean((requireReason && !reason.trim()) || (requireText && typed !== requireText));

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {requireReason ? (
          <textarea
            className="mt-4 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
            placeholder="Reason (sent with ToS violation notice when applicable)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        ) : null}
        {requireText ? <Input className="mt-4 rounded-lg" placeholder={`Type ${requireText}`} value={typed} onChange={(event) => setTyped(event.target.value)} /> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="rounded-lg"
            disabled={disabled}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {destructive ? "Confirm" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const IMAGE_FIELD_NAMES = new Set(["image", "imageUrl", "optionImage", "profilePic", "logo", "avatar", "coverImage", "banner"]);

function FieldControl({
  field,
  value,
  loadingOptions,
  hasError
}: {
  field: AdminField;
  value?: string | number | boolean | null;
  loadingOptions?: boolean;
  hasError?: boolean;
}) {
  const stringValue = value === undefined || value === null ? "" : String(value);
  const isImageField = field.type === "file" || IMAGE_FIELD_NAMES.has(field.name);
  const errorClass = hasError ? "border-destructive focus-visible:ring-destructive" : "";

  if (field.type === "textarea") {
    return <textarea name={field.name} defaultValue={stringValue} className={cn("min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground", errorClass)} placeholder={field.placeholder} />;
  }
  if (field.type === "select") {
    const items = field.optionItems?.length
      ? field.optionItems
      : (field.options ?? []).map((option) => ({ value: option, label: option }));
    return (
      <select
        key={`${field.name}-${items.length}-${loadingOptions ? "loading" : "ready"}`}
        name={field.name}
        defaultValue={stringValue}
        disabled={loadingOptions}
        className={cn("h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground", errorClass)}
      >
        <option value="">{loadingOptions ? "Loading..." : `Select ${field.label.toLowerCase()}`}</option>
        {items.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "checkbox") {
    return <input name={field.name} type="checkbox" defaultChecked={value === true || stringValue.toLowerCase() === "true" || stringValue.toLowerCase() === "verified"} className={cn("h-4 w-4 rounded border-border", hasError && "border-destructive")} />;
  }
  if (isImageField) {
    return <FileUpload name={field.name} defaultValue={stringValue} label={field.label} />;
  }
  return <Input name={field.name} type={field.type ?? "text"} defaultValue={stringValue} className={cn("rounded-lg", errorClass)} placeholder={field.placeholder} />;
}

export function ResourceModal({
  open,
  title,
  fields,
  submitLabel,
  initialValues,
  fieldErrors,
  formError,
  onClose,
  onSubmit,
  onClearFieldError
}: {
  open: boolean;
  title: string;
  fields: AdminField[];
  submitLabel: string;
  initialValues?: Record<string, string | number | boolean | null | undefined>;
  fieldErrors?: Record<string, string>;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (payload: Record<string, string | boolean>) => void;
  onClearFieldError?: (field: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const needsParties = fields.some((field) => field.optionsSource === "parties");
  const needsPoliticians = fields.some((field) => field.optionsSource === "politicians");
  const partiesQuery = useQuery({
    queryKey: ["control", "parties", "select-options"],
    queryFn: () => partiesService.list(),
    enabled: open && needsParties
  });
  const politiciansQuery = useQuery({
    queryKey: ["control", "politicians", "select-options"],
    queryFn: () => politiciansService.list(),
    enabled: open && needsPoliticians
  });
  const resolvedFields = useMemo(() => {
    const partyItems = partySelectOptions(partiesQuery.data);
    const politicianItems = politicianSelectOptions(politiciansQuery.data);
    return fields.map((field) => {
      if (field.optionsSource === "parties") {
        return { ...field, type: "select" as const, optionItems: partyItems };
      }
      if (field.optionsSource === "politicians") {
        return { ...field, type: "select" as const, optionItems: politicianItems };
      }
      return field;
    });
  }, [fields, partiesQuery.data, politiciansQuery.data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>
            Close
          </Button>
        </div>
        {formError ? (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        ) : null}
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          id={`admin-form-${title.replace(/\s+/g, "-").toLowerCase()}`}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const payload = resolvedFields.reduce<Record<string, string | boolean>>((acc, field) => {
              acc[field.name] = field.type === "checkbox" ? form.get(field.name) === "on" : String(form.get(field.name) ?? "");
              return acc;
            }, {});
            setSaving(true);
            window.setTimeout(() => {
              setSaving(false);
              onSubmit(payload);
            }, 250);
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (target?.name) onClearFieldError?.(target.name);
          }}
        >
          {resolvedFields.map((field) => {
            const error = fieldErrors?.[field.name];
            return (
              <label key={field.name} className={cn("block space-y-2 text-sm font-medium text-foreground", (field.type === "textarea" || field.type === "file" || IMAGE_FIELD_NAMES.has(field.name)) && "sm:col-span-2")}>
                <span>{field.label}</span>
                <FieldControl
                  field={field}
                  value={initialValues?.[field.name]}
                  loadingOptions={
                    (field.optionsSource === "parties" && partiesQuery.isLoading) ||
                    (field.optionsSource === "politicians" && politiciansQuery.isLoading)
                  }
                  hasError={Boolean(error)}
                />
                {error ? <p className="text-xs font-normal text-destructive">{error}</p> : null}
              </label>
            );
          })}
        </form>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={`admin-form-${title.replace(/\s+/g, "-").toLowerCase()}`} className="rounded-lg" disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CreateModal(props: Omit<ComponentProps<typeof ResourceModal>, "submitLabel">) {
  return <ResourceModal {...props} submitLabel="Create" />;
}

export function EditModal(props: Omit<ComponentProps<typeof ResourceModal>, "submitLabel">) {
  return <ResourceModal {...props} submitLabel="Save changes" />;
}

export function FileUpload({ name = "file", defaultValue = "", label = "Image" }: { name?: string; defaultValue?: string; label?: string }) {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return <AdminImageUpload name={name} value={value} onChange={setValue} label={label} />;
}

export function Toast({ title = "Action completed successfully" }: { title?: string }) {
  return (
    <Button type="button" variant="outline" className="rounded-lg" onClick={() => gooeyToast.success(title)}>
      Show toast
    </Button>
  );
}

export function useFilteredRecords(records: AdminRecord[], query: string) {
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => [record.title, record.subtitle, ...Object.values(record.values).map(String)].join(" ").toLowerCase().includes(needle));
  }, [query, records]);
}

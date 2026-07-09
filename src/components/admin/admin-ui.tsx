"use client";

import { type ComponentProps, useMemo, useState } from "react";
import { gooeyToast } from "goey-toast";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search01Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { AdminField, AdminRecord, AdminResourceConfig, AdminStatus } from "@/lib/admin-control-data";

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full max-w-sm">
      <AppIcon icon={Search01Icon} size={18} className="absolute left-3 top-3.5 text-slate-400" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border-slate-200 bg-white pl-10" placeholder={placeholder} />
    </div>
  );
}

export function FilterDropdown({ label, options = ["All", "Active", "Pending", "Suspended"] }: { label: string; options?: string[] }) {
  return (
    <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
      <option>{label}</option>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}

export function DateRangeFilter() {
  return (
    <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
      <option>Last 30 days</option>
      <option>Last 7 days</option>
      <option>This quarter</option>
      <option>This year</option>
    </select>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = String(status ?? "active").toLowerCase() as AdminStatus;
  const className = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    verified: "bg-blue-50 text-blue-700 ring-blue-200",
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    suspended: "bg-red-50 text-red-700 ring-red-200",
    draft: "bg-slate-100 text-slate-700 ring-slate-200",
    archived: "bg-slate-100 text-slate-600 ring-slate-200",
    hidden: "bg-slate-100 text-slate-600 ring-slate-200",
    closed: "bg-slate-100 text-slate-600 ring-slate-200",
    open: "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }[normalized] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1", className)}>{status ?? "Active"}</span>;
}

export function RoleBadge({ role }: { role?: string }) {
  return <Badge variant={role === "SUPER_ADMIN" || role === "ADMIN" ? "info" : "secondary"}>{role ?? "USER"}</Badge>;
}

export function StatCard({ label, value, change, period, href }: { label: string; value: string; change: string; period: string; href?: string }) {
  const content = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-primary/40">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
        <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", change.startsWith("-") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>{change}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{period}</p>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
        {actionLabel ? <Button className="mt-4 rounded-lg" onClick={onAction}>{actionLabel}</Button> : null}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-lg" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="outline" className="rounded-lg" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function ActionMenu({ actions, onAction }: { actions: string[]; onAction: (action: string) => void }) {
  return (
    <select
      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700"
      defaultValue=""
      onChange={(event) => {
        if (event.target.value) onAction(event.target.value);
        event.currentTarget.value = "";
      }}
    >
      <option value="" disabled>Actions</option>
      {actions.map((action) => <option key={action}>{action}</option>)}
    </select>
  );
}

export function DataTable({ config, records, onAction }: { config: AdminResourceConfig; records: AdminRecord[]; onAction: (action: string, record: AdminRecord) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!records.length) {
    return <EmptyState title={config.emptyTitle} description={config.emptyDescription} actionLabel={config.primaryAction} onAction={() => gooeyToast.info(`${config.primaryAction} opened`)} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {selected.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">{selected.length} selected</p>
          <div className="flex flex-wrap gap-2">
            {config.bulkActions?.map((action) => (
              <Button key={action} variant="outline" size="sm" className="rounded-lg bg-white" onClick={() => gooeyToast.success(action, { description: "Action completed successfully" })}>{action}</Button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="rounded border-slate-300" checked={selected.length === records.length} onChange={(event) => setSelected(event.target.checked ? records.map((item) => item.id) : [])} />
              </th>
              {config.columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={selected.includes(item.id)}
                    onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                  />
                </td>
                {config.columns.map((column) => {
                  const value = item.values[column.key];
                  return (
                    <td key={column.key} className="max-w-[260px] px-4 py-3 text-slate-700">
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
      <button className="absolute inset-0 bg-slate-950/30" aria-label="Close drawer" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Details</p>
            <h2 className="text-xl font-semibold text-slate-950">{record.title}</h2>
            {record.subtitle ? <p className="mt-1 text-sm text-slate-500">{record.subtitle}</p> : null}
          </div>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-6 grid gap-3">
          {record.details.map((detail) => (
            <div key={detail.label} className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{detail.label}</p>
              <p className="mt-1 text-sm text-slate-900">{String(detail.value ?? "-")}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function ConfirmModal({ open, title, message, destructive, requireReason, requireText, onClose, onConfirm }: { open: boolean; title: string; message: string; destructive?: boolean; requireReason?: boolean; requireText?: string; onClose: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  if (!open) return null;
  const disabled = Boolean((requireReason && !reason.trim()) || (requireText && typed !== requireText));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        {requireReason ? <textarea className="mt-4 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="Reason" value={reason} onChange={(event) => setReason(event.target.value)} /> : null}
        {requireText ? <Input className="mt-4 rounded-lg" placeholder={`Type ${requireText}`} value={typed} onChange={(event) => setTyped(event.target.value)} /> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "default"} className="rounded-lg" disabled={disabled} onClick={onConfirm}>{destructive ? "Confirm" : "Continue"}</Button>
        </div>
      </div>
    </div>
  );
}

function FieldControl({ field }: { field: AdminField }) {
  if (field.type === "textarea") return <textarea className="min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder={field.placeholder} />;
  if (field.type === "select") {
    return (
      <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  }
  if (field.type === "checkbox") return <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />;
  if (field.type === "file") return <FileUpload />;
  return <Input type={field.type ?? "text"} className="rounded-lg" placeholder={field.placeholder} />;
}

export function ResourceModal({ open, title, fields, submitLabel, onClose, onSubmit }: { open: boolean; title: string; fields: AdminField[]; submitLabel: string; onClose: () => void; onSubmit: () => void }) {
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>Close</Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className={cn("block space-y-2 text-sm font-medium text-slate-700", field.type === "textarea" && "sm:col-span-2")}>
              <span>{field.label}</span>
              <FieldControl field={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button
            className="rounded-lg"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              window.setTimeout(() => {
                setSaving(false);
                onSubmit();
              }, 500);
            }}
          >
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

export function FileUpload() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
      <input type="file" className="mx-auto block max-w-full text-sm" />
    </div>
  );
}

export function Toast({ title = "Action completed successfully" }: { title?: string }) {
  return <Button type="button" variant="outline" className="rounded-lg" onClick={() => gooeyToast.success(title)}>Show toast</Button>;
}

export function useFilteredRecords(records: AdminRecord[], query: string) {
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) =>
      [record.title, record.subtitle, ...Object.values(record.values).map(String)].join(" ").toLowerCase().includes(needle)
    );
  }, [query, records]);
}

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Edit3, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { api, getData } from "@/services/client/api";
import type { AdminResource } from "@/lib/admin-resources";
import { asArray, displayName, formatDate, recordId, stringifyJson } from "@/lib/content-utils";
import type { ApiRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Mode = "create" | "edit";

export function AdminResourceManager({ resource }: { resource: AdminResource }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [mode, setMode] = useState<Mode>("create");
  const [json, setJson] = useState(stringifyJson(resource.sample));
  const [message, setMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-resource", resource.key],
    queryFn: () => getData<unknown>(resource.list),
    retry: false
  });

  const rows = useMemo(() => {
    const normalized = asArray<ApiRecord>(query.data);
    const term = search.toLowerCase();
    if (!term) return normalized;
    return normalized.filter((row) => stringifyJson(row).toLowerCase().includes(term));
  }, [query.data, search]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = JSON.parse(json || "{}");
      if (mode === "edit" && selected && resource.update) {
        return api.patch(resource.update(recordId(selected)), payload);
      }
      if (!resource.create) throw new Error(`${resource.label} cannot be created from this panel.`);
      return api.post(resource.create, payload);
    },
    onSuccess: () => {
      const successMessage = "Saved successfully.";
      setMessage(successMessage);
      gooeyToast.success(successMessage, { description: `${resource.label} has been updated.` });
      setSelected(null);
      setMode("create");
      setJson(stringifyJson(resource.sample));
      queryClient.invalidateQueries({ queryKey: ["admin-resource", resource.key] });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Save failed";
      setMessage(errorMessage);
      gooeyToast.error("Save failed", { description: errorMessage });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: ApiRecord) => {
      if (!resource.delete) throw new Error(`${resource.label} cannot be deleted from this panel.`);
      return api.delete(resource.delete(recordId(row)));
    },
    onSuccess: () => {
      const successMessage = "Deleted successfully.";
      setMessage(successMessage);
      gooeyToast.success(successMessage, { description: `${resource.label} record removed.` });
      queryClient.invalidateQueries({ queryKey: ["admin-resource", resource.key] });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Delete failed";
      setMessage(errorMessage);
      gooeyToast.error("Delete failed", { description: errorMessage });
    }
  });

  function startCreate() {
    setMode("create");
    setSelected(null);
    setJson(stringifyJson(resource.sample));
    setMessage(null);
  }

  function startEdit(row: ApiRecord) {
    setMode("edit");
    setSelected(row);
    setJson(stringifyJson(row));
    setMessage(null);
  }

  function save() {
    setMessage(null);
    try {
      JSON.parse(json || "{}");
    } catch {
      const errorMessage = "JSON is invalid. Fix the payload and try again.";
      setMessage(errorMessage);
      gooeyToast.warning("Invalid JSON", { description: errorMessage });
      return;
    }
    saveMutation.mutate();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${resource.label.toLowerCase()}`} />
            <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
              {query.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3">Record</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <tr><td className="p-4 text-muted-foreground" colSpan={5}>Loading {resource.label.toLowerCase()}...</td></tr>
                ) : query.error ? (
                  <tr><td className="p-4 text-destructive" colSpan={5}>{query.error.message}</td></tr>
                ) : rows.length ? (
                  rows.map((row) => (
                    <tr className="border-t" key={recordId(row)}>
                      <td className="max-w-[320px] truncate p-3 font-medium">{displayName(row)}</td>
                      <td className="max-w-[180px] truncate p-3 text-muted-foreground">{recordId(row)}</td>
                      <td className="p-3"><Badge variant="secondary">{String(row.status ?? row.role ?? row.type ?? "Active")}</Badge></td>
                      <td className="p-3">{formatDate(row.updatedAt ?? row.createdAt)}</td>
                      <td className="space-x-2 p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(row)} disabled={!resource.update}>
                          <Edit3 className="mr-2 h-4 w-4" />Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(row)} disabled={!resource.delete || deleteMutation.isPending}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-4 text-muted-foreground" colSpan={5}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{mode === "edit" ? `Edit ${resource.label}` : `Create ${resource.label}`}</h2>
              <p className="text-sm text-muted-foreground">Send a JSON payload directly to the API.</p>
            </div>
            <Button variant="outline" size="sm" onClick={startCreate}>
              <Plus className="mr-2 h-4 w-4" />New
            </Button>
          </div>
          <textarea
            value={json}
            onChange={(event) => setJson(event.target.value)}
            className="min-h-[380px] w-full rounded-md border bg-background p-3 font-mono text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            spellCheck={false}
          />
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <Button className="w-full" onClick={save} disabled={saveMutation.isPending || (mode === "create" && !resource.create) || (mode === "edit" && !resource.update)}>
            {saveMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

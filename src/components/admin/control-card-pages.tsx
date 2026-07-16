"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateModal, EditModal, EmptyState, LoadingSkeleton, SearchInput, StatusBadge } from "@/components/admin/admin-ui";
import { AdminActionMenu, AdminConfirmDeleteModal } from "@/components/admin/admin-action-menu";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import {
  discussionsMeta,
  electionsMeta,
  mapDiscussion,
  mapElection,
  mapParty,
  mapPolitician,
  mapPoll,
  mapPost,
  mapRating,
  omitEmpty,
  partiesMeta,
  politiciansMeta,
  pollsMeta,
  postsMeta,
  ratingsMeta,
  withNumericPartyId,
  type OptionPayload
} from "@/components/admin/admin-record-mappers";
import type { AdminField, AdminPageMeta, AdminRecord } from "@/lib/admin-control-data";
import { normalizePost } from "@/lib/content-utils";
import { displayApiError, getApiFieldErrors, type FieldErrors } from "@/lib/api-validation";
import { cn } from "@/lib/utils";
import { discussionsService } from "@/services/discussions.service";
import { electionsService } from "@/services/elections.service";
import { partiesService } from "@/services/parties.service";
import { politiciansService } from "@/services/politicians.service";
import { pollsService } from "@/services/polls.service";
import { postsService } from "@/services/posts.service";
import { ratingsService } from "@/services/ratings.service";
import type { ApiRecord } from "@/types";

const PAGE_SIZE = 12;

type Raw = Record<string, unknown>;
type DateFilter = "all" | "7" | "30" | "90" | "365";
type OptionDraft = { text: string; image: string; value: string };

function extractList(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload.filter(Boolean) as Raw[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Raw;
  for (const key of ["data", "items", "results", "records", "posts", "discussions", "polls", "poll", "elections", "election", "ratings", "parties", "politicians", "comments"]) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter(Boolean) as Raw[];
  }
  return [];
}

function displayError(error: unknown) {
  return displayApiError(error);
}

function applyMutationFormError(
  error: unknown,
  fieldNames: string[],
  setFieldErrors: (errors: FieldErrors) => void,
  setFormError: (message: string | null) => void
) {
  const parsed = getApiFieldErrors(error, fieldNames);
  setFieldErrors(parsed.fieldErrors);
  if (Object.keys(parsed.fieldErrors).length) {
    setFormError(parsed.message || "Please fix the highlighted fields.");
    gooeyToast.error(parsed.message || "Please fix the highlighted fields.");
    return;
  }
  setFormError(parsed.message);
  gooeyToast.error(parsed.message);
}

function dateMatches(raw: Raw, range: DateFilter) {
  if (range === "all") return true;
  const value = raw.createdAt ?? raw.updatedAt ?? raw.publishedAt;
  if (!value) return true;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return true;
  const days = Number(range);
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function contains(record: AdminRecord, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [record.title, record.subtitle, ...Object.values(record.values).map(String)]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function rawImage(raw: unknown) {
  if (!raw || typeof raw !== "object") return "";
  const record = raw as Raw;
  return String(record.imageUrl ?? record.image ?? record.logo ?? record.avatar ?? "");
}

function optionEntries(raw: unknown) {
  if (!raw || typeof raw !== "object") return [];
  const options = (raw as Raw).options;
  if (!options || typeof options !== "object" || Array.isArray(options)) return [];
  return Object.entries(options as Record<string, Raw>).map(([key, option]) => ({
    key,
    text: String(option.text ?? option.label ?? key),
    image: String(option.image ?? ""),
    value: Number(option.value ?? 0)
  }));
}

function ControlHeader({ meta, onCreate }: { meta: Pick<AdminPageMeta, "title" | "description" | "primaryAction">; onCreate?: () => void }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Control</p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">{meta.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{meta.description}</p>
      </div>
      {meta.primaryAction && onCreate ? <Button className="rounded-lg" onClick={onCreate}>{meta.primaryAction}</Button> : null}
    </section>
  );
}

function FilterBar({
  query,
  onQuery,
  dateRange,
  onDateRange,
  typeValue,
  onTypeValue,
  typeOptions,
  typeLabel = "Type"
}: {
  query: string;
  onQuery: (value: string) => void;
  dateRange: DateFilter;
  onDateRange: (value: DateFilter) => void;
  typeValue: string;
  onTypeValue: (value: string) => void;
  typeOptions: string[];
  typeLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={query} onChange={onQuery} placeholder="Search records..." />
        <div className="flex flex-wrap gap-2">
          <select value={dateRange} onChange={(event) => onDateRange(event.target.value as DateFilter)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm">
            <option value="all">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
          <select value={typeValue} onChange={(event) => onTypeValue(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm">
            <option value="all">All {typeLabel.toLowerCase()}</option>
            {typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}

function DetailModal({ record, onClose }: { record: AdminRecord | null; onClose: () => void }) {
  if (!record) return null;
  const image = rawImage(record.raw);
  const options = optionEntries(record.raw);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Details</p>
            <h2 className="text-xl font-semibold text-foreground">{record.title}</h2>
            {record.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{record.subtitle}</p> : null}
          </div>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>Close</Button>
        </div>
        {image ? <img src={image} alt={record.title} className="mt-5 max-h-80 w-full rounded-lg object-cover" /> : null}
        {options.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <div key={option.key} className="rounded-lg border border-border bg-background/50 p-3">
                {option.image ? <img src={option.image} alt={option.text} className="mb-3 h-36 w-full rounded-lg object-cover" /> : null}
                <p className="font-semibold text-foreground">{option.text}</p>
                <p className="mt-1 text-sm text-muted-foreground">{option.value} votes</p>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {record.details.map((detail) => (
            <div key={detail.label} className="rounded-lg border border-border bg-background/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{detail.label}</p>
              <p className="mt-1 text-sm text-foreground">{String(detail.value ?? "-")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionBuilderModal({
  open,
  title,
  variant,
  initialRecord,
  fieldErrors,
  formError,
  onClose,
  onSubmit,
  onClearFieldError
}: {
  open: boolean;
  title: string;
  variant: "poll" | "election";
  initialRecord?: AdminRecord | null;
  fieldErrors?: FieldErrors;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (payload: OptionPayload) => void;
  onClearFieldError?: (field: string) => void;
}) {
  const raw = initialRecord?.raw as Raw | undefined;
  const existingOptions = optionEntries(raw);
  const selectedDiscussionId = String(raw?.discussionsId ?? raw?.discussionId ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(
    existingOptions.length ? existingOptions.map((option) => ({ text: option.text, image: option.image, value: String(option.value) })) : [
      { text: "", image: "", value: "0" },
      { text: "", image: "", value: "0" }
    ]
  );
  const discussionsQuery = useQuery({
    queryKey: ["control", "discussions", "poll-options"],
    queryFn: () => discussionsService.list<Raw>({ take: 100 }),
    enabled: open && variant === "poll"
  });
  const discussionOptions = useMemo(() => {
    return extractList(discussionsQuery.data).map((discussion) => ({
      id: String(discussion.id ?? ""),
      label: String(discussion.topic ?? discussion.title ?? discussion.slug ?? discussion.id ?? "Untitled discussion")
    })).filter((discussion) => discussion.id);
  }, [discussionsQuery.data]);

  useEffect(() => {
    if (!open) return;
    setOptions(existingOptions.length ? existingOptions.map((option) => ({ text: option.text, image: option.image, value: String(option.value) })) : [
      { text: "", image: "", value: "0" },
      { text: "", image: "", value: "0" }
    ]);
  }, [open, initialRecord?.id]);

  if (!open) return null;

  const errorClass = "border-destructive focus-visible:ring-destructive";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" className="rounded-lg" onClick={onClose}>Close</Button>
        </div>
        {formError ? (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        ) : null}
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const optionObject = options.reduce<Record<string, { text: string; image: string | null; value: number }>>((acc, option, index) => {
              if (!option.text.trim()) return acc;
              acc[`option${index + 1}`] = {
                text: option.text.trim(),
                image: option.image.trim() || null,
                value: Number(option.value || 0)
              };
              return acc;
            }, {});
            const payload: OptionPayload = variant === "poll"
              ? { discussionId: String(form.get("discussionId") ?? ""), question: String(form.get("question") ?? ""), options: optionObject }
              : { title: String(form.get("title") ?? ""), description: String(form.get("description") ?? ""), options: optionObject };
            onSubmit(payload);
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (target?.name) onClearFieldError?.(target.name);
          }}
        >
          {variant === "poll" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium text-foreground sm:col-span-2">
                <span>Discussion</span>
                <select
                  name="discussionId"
                  required
                  defaultValue={selectedDiscussionId}
                  className={cn("h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground", fieldErrors?.discussionId && errorClass)}
                  disabled={discussionsQuery.isLoading}
                >
                  <option value="">
                    {discussionsQuery.isLoading ? "Loading discussions..." : "Select a discussion"}
                  </option>
                  {discussionOptions.map((discussion) => (
                    <option key={discussion.id} value={discussion.id}>
                      {discussion.label}
                    </option>
                  ))}
                </select>
                {fieldErrors?.discussionId ? <p className="text-xs font-normal text-destructive">{fieldErrors.discussionId}</p> : null}
              </label>
              <label className="block space-y-2 text-sm font-medium text-foreground sm:col-span-2">
                <span>Question</span>
                <textarea name="question" defaultValue={String(raw?.question ?? "")} className={cn("min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground", fieldErrors?.question && errorClass)} />
                {fieldErrors?.question ? <p className="text-xs font-normal text-destructive">{fieldErrors.question}</p> : null}
              </label>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium text-foreground">
                <span>Title</span>
                <Input name="title" defaultValue={String(raw?.title ?? "")} className={cn("rounded-lg", fieldErrors?.title && errorClass)} />
                {fieldErrors?.title ? <p className="text-xs font-normal text-destructive">{fieldErrors.title}</p> : null}
              </label>
              <label className="block space-y-2 text-sm font-medium text-foreground sm:col-span-2">
                <span>Description</span>
                <textarea name="description" defaultValue={String(raw?.description ?? "")} className={cn("min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground", fieldErrors?.description && errorClass)} />
                {fieldErrors?.description ? <p className="text-xs font-normal text-destructive">{fieldErrors.description}</p> : null}
              </label>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Options</p>
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setOptions((current) => [...current, { text: "", image: "", value: "0" }])}>Add option</Button>
            </div>
            {fieldErrors?.options ? <p className="text-xs text-destructive">{fieldErrors.options}</p> : null}
            {options.map((option, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-border bg-background/50 p-3 sm:grid-cols-[1fr_1fr_96px_auto]">
                <Input value={option.text} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item))} placeholder={`Option ${index + 1}`} className="rounded-lg" />
                <AdminImageUpload
                  name={`option-image-${index}`}
                  value={option.image}
                  label={`Option ${index + 1} image`}
                  onChange={(url) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, image: url } : item))}
                />
                <Input value={option.value} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} type="number" placeholder="Votes" className="rounded-lg" />
                <Button type="button" variant="ghost" className="rounded-lg" disabled={options.length <= 2} onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-lg" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="rounded-lg">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostControlCard({
  record,
  onView,
  onEdit,
  onDelete
}: {
  record: AdminRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const post = normalizePost(record.raw as ApiRecord);
  const href = `/control/posts/${encodeURIComponent(record.id)}`;
  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <Link href={href} className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{post.author.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{post.author}</p>
              <p className="truncate text-xs text-muted-foreground">{post.topic}</p>
            </div>
          </div>
        </Link>
        <AdminActionMenu
          actions={["View", "Edit", "Delete"]}
          onAction={(action) => {
            if (action === "View") onView();
            if (action === "Edit") onEdit();
            if (action === "Delete") onDelete();
          }}
        />
      </div>
      <Link href={href} className="mt-3 block">
        <p className="line-clamp-4 text-sm leading-5 text-muted-foreground">{post.message || "No post message available."}</p>
        {post.attachments?.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.attachments[0].url} alt="" className="mt-3 h-28 w-full rounded-lg object-cover" />
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-2 text-[11px] font-medium text-muted-foreground">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
        </div>
      </Link>
    </article>
  );
}

export function ControlPostsCardsPage({ discussionId }: { discussionId?: string }) {
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [type, setType] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<FieldErrors>({});
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const postFieldNames = useMemo(
    () => [...(postsMeta.createFields ?? []), ...(postsMeta.editFields ?? [])].map((field) => field.name),
    []
  );
  const postsQuery = useInfiniteQuery({
    queryKey: ["control", "posts", discussionId ?? "all"],
    queryFn: ({ pageParam }) => discussionId ? postsService.byDiscussion<Raw>(discussionId, { skip: pageParam, take: PAGE_SIZE }) : postsService.list<Raw>({ skip: pageParam, take: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const rows = extractList(lastPage);
      return rows.length === PAGE_SIZE ? Number(lastPageParam) + PAGE_SIZE : undefined;
    }
  });
  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => postsService.remove(id, reason),
    onSuccess: () => {
      gooeyToast.success("Post deleted");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["control", "posts"] });
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => postsService.create(omitEmpty(body as Record<string, string | boolean>)),
    onSuccess: () => {
      gooeyToast.success("Post created");
      setCreateFieldErrors({});
      setCreateFormError(null);
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["control", "posts"] });
    },
    onError: (error) => applyMutationFormError(error, postFieldNames, setCreateFieldErrors, setCreateFormError)
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => postsService.update(id, body),
    onSuccess: () => {
      gooeyToast.success("Post updated");
      setEditFieldErrors({});
      setEditFormError(null);
      setEditingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["control", "posts"] });
    },
    onError: (error) => applyMutationFormError(error, postFieldNames, setEditFieldErrors, setEditFormError)
  });
  const records = useMemo(() => postsQuery.data?.pages.flatMap(extractList).map(mapPost) ?? [], [postsQuery.data]);
  const typeOptions = useMemo(() => Array.from(new Set(records.map((record) => String(record.raw && typeof record.raw === "object" ? ((record.raw as Raw).type ?? "Post") : "Post")))), [records]);
  const filtered = records.filter((record) => contains(record, query) && dateMatches((record.raw as Raw) ?? {}, dateRange) && (type === "all" || String((record.raw as Raw)?.type ?? "Post") === type));

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
        postsQuery.fetchNextPage();
      }
    }, { rootMargin: "360px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [postsQuery.hasNextPage, postsQuery.isFetchingNextPage, postsQuery.fetchNextPage]);

  return (
    <div className="space-y-5">
      {!discussionId ? <ControlHeader meta={{ ...postsMeta, description: "Review posts as content cards with scrolling, filters, and real moderation actions." }} onCreate={() => setCreateOpen(true)} /> : null}
      <FilterBar query={query} onQuery={setQuery} dateRange={dateRange} onDateRange={setDateRange} typeValue={type} onTypeValue={setType} typeOptions={typeOptions} />
      {postsQuery.isLoading ? <LoadingSkeleton /> : null}
      {postsQuery.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{displayError(postsQuery.error)}</div> : null}
      {!postsQuery.isLoading && !filtered.length ? <EmptyState title="No posts found" description="No posts match the current filters." /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {filtered.map((record) => (
          <PostControlCard
            key={record.id}
            record={record}
            onView={() => { window.location.assign(`/control/posts/${encodeURIComponent(record.id)}`); }}
            onEdit={() => setEditingRecord(record)}
            onDelete={() => setDeleteId(record.id)}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="h-2" />
      {postsQuery.hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-lg" disabled={postsQuery.isFetchingNextPage} onClick={() => postsQuery.fetchNextPage()}>
            {postsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
      <CreateModal
        open={createOpen}
        title={postsMeta.primaryAction ?? "Create Post"}
        fields={postsMeta.createFields ?? []}
        fieldErrors={createFieldErrors}
        formError={createFormError}
        onClearFieldError={(field) => setCreateFieldErrors((current) => {
          const next = { ...current };
          delete next[field];
          return next;
        })}
        onClose={() => {
          setCreateFieldErrors({});
          setCreateFormError(null);
          setCreateOpen(false);
        }}
        onSubmit={(body) => createMutation.mutate(body)}
      />
      <EditModal
        open={Boolean(editingRecord)}
        title="Edit post"
        fields={postsMeta.editFields ?? [{ name: "message", label: "Content", type: "textarea" }]}
        initialValues={{ message: String((editingRecord?.raw as Raw)?.message ?? editingRecord?.values.preview ?? "") }}
        fieldErrors={editFieldErrors}
        formError={editFormError}
        onClearFieldError={(field) => setEditFieldErrors((current) => {
          const next = { ...current };
          delete next[field];
          return next;
        })}
        onClose={() => {
          setEditFieldErrors({});
          setEditFormError(null);
          setEditingRecord(null);
        }}
        onSubmit={(body) => editingRecord ? updateMutation.mutate({ id: editingRecord.id, body: { message: body.message } }) : undefined}
      />
      <AdminConfirmDeleteModal
        open={Boolean(deleteId)}
        title="Delete this post?"
        message="The author will be notified that this post was removed for a Terms of Service violation."
        onClose={() => setDeleteId(null)}
        onConfirm={(reason) => {
          if (!deleteId) return;
          deleteMutation.mutate({ id: deleteId, reason });
        }}
      />
    </div>
  );
}

function DiscussionCard({ record, onEdit, onDelete }: { record: AdminRecord; onEdit: () => void; onDelete: () => void }) {
  const raw = (record.raw as Raw) ?? {};
  const slug = String(raw.slug ?? record.id);
  const href = `/control/discussions/${encodeURIComponent(slug)}?id=${encodeURIComponent(record.id)}`;
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40">
      <Link href={href} className="block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{record.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{String(record.values.description ?? "Open this discussion to review its posts.")}</p>
          </div>
          <StatusBadge status={record.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span className="rounded-full bg-muted px-2.5 py-1">{String(record.values.posts)} posts</span>
          <span className="rounded-full bg-muted px-2.5 py-1">{String(record.values.rooms)} rooms</span>
          <span className="rounded-full bg-muted px-2.5 py-1">{record.createdAt}</span>
        </div>
      </Link>
      <div className="mt-4 flex justify-end">
        <AdminActionMenu
          actions={["Edit", "Delete"]}
          onAction={(action) => {
            if (action === "Edit") onEdit();
            if (action === "Delete") onDelete();
          }}
        />
      </div>
    </article>
  );
}

export function ControlDiscussionsCardsPage() {
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<FieldErrors>({});
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const discussionFieldNames = useMemo(
    () => [...(discussionsMeta.createFields ?? []), ...(discussionsMeta.editFields ?? [])].map((field) => field.name),
    []
  );
  const discussions = useQuery({ queryKey: ["control", "discussions"], queryFn: () => discussionsService.list<Raw>() });
  const records = useMemo(() => extractList(discussions.data).map(mapDiscussion), [discussions.data]);
  const filtered = records.filter((record) => contains(record, query) && dateMatches((record.raw as Raw) ?? {}, dateRange) && (status === "all" || String(record.status ?? "active") === status));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["control", "discussions"] });
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => discussionsService.create(omitEmpty(body as Record<string, string | boolean>)),
    onSuccess: () => {
      gooeyToast.success("Discussion created");
      setCreateFieldErrors({});
      setCreateFormError(null);
      setCreateOpen(false);
      invalidate();
    },
    onError: (error) => applyMutationFormError(error, discussionFieldNames, setCreateFieldErrors, setCreateFormError)
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => discussionsService.update(id, omitEmpty(body as Record<string, string | boolean>)),
    onSuccess: () => {
      gooeyToast.success("Discussion updated");
      setEditFieldErrors({});
      setEditFormError(null);
      setEditingRecord(null);
      invalidate();
    },
    onError: (error) => applyMutationFormError(error, discussionFieldNames, setEditFieldErrors, setEditFormError)
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => discussionsService.remove(id),
    onSuccess: () => {
      gooeyToast.success("Discussion deleted");
      invalidate();
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });

  return (
    <div className="space-y-5">
      <ControlHeader meta={discussionsMeta} onCreate={() => setCreateOpen(true)} />
      <FilterBar query={query} onQuery={setQuery} dateRange={dateRange} onDateRange={setDateRange} typeValue={status} onTypeValue={setStatus} typeOptions={["active", "closed"]} typeLabel="Status" />
      {discussions.isLoading ? <LoadingSkeleton /> : null}
      {discussions.isError ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{displayError(discussions.error)}</div> : null}
      {!discussions.isLoading && !filtered.length ? <EmptyState title={discussionsMeta.emptyTitle} description={discussionsMeta.emptyDescription} /> : null}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((record) => <DiscussionCard key={record.id} record={record} onEdit={() => setEditingRecord(record)} onDelete={() => deleteMutation.mutate(record.id)} />)}
      </div>
      <CreateModal
        open={createOpen}
        title={discussionsMeta.primaryAction ?? "Create Discussion"}
        fields={discussionsMeta.createFields ?? []}
        fieldErrors={createFieldErrors}
        formError={createFormError}
        onClearFieldError={(field) => setCreateFieldErrors((current) => {
          const next = { ...current };
          delete next[field];
          return next;
        })}
        onClose={() => {
          setCreateFieldErrors({});
          setCreateFormError(null);
          setCreateOpen(false);
        }}
        onSubmit={(body) => createMutation.mutate(body)}
      />
      <EditModal
        open={Boolean(editingRecord)}
        title={`Edit ${editingRecord?.title ?? "Discussion"}`}
        fields={discussionsMeta.editFields ?? discussionsMeta.createFields ?? []}
        initialValues={editingRecord?.values}
        fieldErrors={editFieldErrors}
        formError={editFormError}
        onClearFieldError={(field) => setEditFieldErrors((current) => {
          const next = { ...current };
          delete next[field];
          return next;
        })}
        onClose={() => {
          setEditFieldErrors({});
          setEditFormError(null);
          setEditingRecord(null);
        }}
        onSubmit={(body) => editingRecord ? updateMutation.mutate({ id: editingRecord.id, body }) : undefined}
      />
    </div>
  );
}

export function ControlDiscussionPostsPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const suppliedId = searchParams.get("id");
  const slug = decodeURIComponent(params.slug);
  const discussions = useQuery({ queryKey: ["control", "discussions", "resolve", slug], queryFn: () => discussionsService.list<Raw>() });
  const discussion = extractList(discussions.data).find((item) => String(item.id) === suppliedId || String(item.slug) === slug || String(item.id) === slug);
  const discussionId = String(suppliedId ?? discussion?.id ?? slug);

  return (
    <div className="space-y-5">
      <ControlHeader meta={{ title: String(discussion?.topic ?? discussion?.title ?? "Discussion Posts"), description: "Review every post in this discussion as admin content cards." }} />
      <ControlPostsCardsPage discussionId={discussionId} />
    </div>
  );
}

function GenericCard({ record, imageLabel, onView, onEdit, onDelete }: { record: AdminRecord; imageLabel?: string; onView: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const image = rawImage(record.raw);
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={imageLabel ?? record.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="grid h-44 place-items-center bg-muted text-2xl font-semibold text-muted-foreground">{record.title.slice(0, 2).toUpperCase()}</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 font-semibold text-foreground">{record.title}</h3>
            {record.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{record.subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} />
            <AdminActionMenu
              actions={[
                "View",
                ...(onEdit ? ["Edit"] : []),
                ...(onDelete ? ["Delete"] : [])
              ]}
              onAction={(action) => {
                if (action === "View") onView();
                if (action === "Edit") onEdit?.();
                if (action === "Delete") onDelete?.();
              }}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          {record.details.slice(0, 4).map((detail) => (
            <div key={detail.label} className="flex justify-between gap-3">
              <span className="text-muted-foreground/80">{detail.label}</span>
              <span className="text-right font-medium text-foreground">{String(detail.value ?? "-")}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function CardGridResourcePage({
  meta,
  queryKey,
  queryFn,
  mapRecord,
  createFields,
  editFields,
  createFn,
  updateFn,
  deleteFn,
  payload = omitEmpty,
  optionVariant
}: {
  meta: AdminPageMeta;
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
  mapRecord: (record: Raw) => AdminRecord;
  createFields?: AdminField[];
  editFields?: AdminField[];
  createFn?: (payload: Raw) => Promise<unknown>;
  updateFn?: (id: string, payload: Raw) => Promise<unknown>;
  deleteFn?: (id: string) => Promise<unknown>;
  payload?: (payload: Record<string, string | boolean>) => Raw;
  optionVariant?: "poll" | "election";
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [typeValue, setTypeValue] = useState("all");
  const [detailRecord, setDetailRecord] = useState<AdminRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AdminRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<FieldErrors>({});
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<FieldErrors>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const formFieldNames = useMemo(() => {
    const fields = [...(createFields ?? meta.createFields ?? []), ...(editFields ?? meta.editFields ?? [])];
    const optionFields = optionVariant === "poll"
      ? ["discussionId", "question", "options"]
      : optionVariant === "election"
        ? ["title", "description", "options"]
        : [];
    return Array.from(new Set([...fields.map((field) => field.name), ...optionFields]));
  }, [createFields, editFields, meta.createFields, meta.editFields, optionVariant]);
  const recordsQuery = useQuery({ queryKey, queryFn });
  const records = useMemo(() => extractList(recordsQuery.data).map(mapRecord), [recordsQuery.data, mapRecord]);
  const typeOptions = useMemo(() => Array.from(new Set(records.map((record) => String(record.values.type ?? record.values.position ?? record.values.status ?? "Active")))), [records]);
  const filtered = records.filter((record) => contains(record, query) && dateMatches((record.raw as Raw) ?? {}, dateRange) && (typeValue === "all" || Object.values(record.values).map(String).includes(typeValue)));
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const clearCreateErrors = () => {
    setCreateFieldErrors({});
    setCreateFormError(null);
  };
  const clearEditErrors = () => {
    setEditFieldErrors({});
    setEditFormError(null);
  };
  const createMutation = useMutation({
    mutationFn: (body: Raw) => {
      if (!createFn) throw new Error("Creating is not available for this module yet.");
      return createFn(body);
    },
    onSuccess: () => {
      gooeyToast.success("Created successfully");
      clearCreateErrors();
      setCreateOpen(false);
      invalidate();
    },
    onError: (error) => applyMutationFormError(error, formFieldNames, setCreateFieldErrors, setCreateFormError)
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Raw }) => {
      if (!updateFn) throw new Error("Updating is not available for this module yet.");
      return updateFn(id, body);
    },
    onSuccess: () => {
      gooeyToast.success("Updated successfully");
      clearEditErrors();
      setEditingRecord(null);
      invalidate();
    },
    onError: (error) => applyMutationFormError(error, formFieldNames, setEditFieldErrors, setEditFormError)
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!deleteFn) throw new Error("Deleting is not available for this module yet.");
      return deleteFn(id);
    },
    onSuccess: () => {
      gooeyToast.success("Deleted successfully");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => gooeyToast.error(displayError(error))
  });

  return (
    <div className="space-y-5">
      <ControlHeader meta={meta} onCreate={createFn ? () => setCreateOpen(true) : undefined} />
      <FilterBar query={query} onQuery={setQuery} dateRange={dateRange} onDateRange={setDateRange} typeValue={typeValue} onTypeValue={setTypeValue} typeOptions={typeOptions} />
      {recordsQuery.isLoading ? <LoadingSkeleton /> : null}
      {recordsQuery.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{displayError(recordsQuery.error)}</div> : null}
      {!recordsQuery.isLoading && !filtered.length ? <EmptyState title={meta.emptyTitle} description={meta.emptyDescription} actionLabel={meta.primaryAction} onAction={createFn ? () => setCreateOpen(true) : undefined} /> : null}
      <div className={cn("grid gap-4", "lg:grid-cols-2 2xl:grid-cols-3")}>
        {filtered.map((record) => (
          <GenericCard
            key={record.id}
            record={record}
            onView={() => setDetailRecord(record)}
            onEdit={updateFn ? () => setEditingRecord(record) : undefined}
            onDelete={deleteFn ? () => setDeleteId(record.id) : undefined}
          />
        ))}
      </div>
      <DetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />
      <AdminConfirmDeleteModal
        open={Boolean(deleteId)}
        title="Delete this record?"
        message="This action cannot be undone."
        requireReason={false}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          deleteMutation.mutate(deleteId);
        }}
      />
      {optionVariant ? (
        <>
          <OptionBuilderModal
            open={createOpen}
            title={meta.primaryAction ?? "Create"}
            variant={optionVariant}
            fieldErrors={createFieldErrors}
            formError={createFormError}
            onClearFieldError={(field) => setCreateFieldErrors((current) => {
              const next = { ...current };
              delete next[field];
              return next;
            })}
            onClose={() => {
              clearCreateErrors();
              setCreateOpen(false);
            }}
            onSubmit={(body) => createMutation.mutate(body as Raw)}
          />
          <OptionBuilderModal
            open={Boolean(editingRecord)}
            title={`Edit ${editingRecord?.title ?? meta.title}`}
            variant={optionVariant}
            initialRecord={editingRecord}
            fieldErrors={editFieldErrors}
            formError={editFormError}
            onClearFieldError={(field) => setEditFieldErrors((current) => {
              const next = { ...current };
              delete next[field];
              return next;
            })}
            onClose={() => {
              clearEditErrors();
              setEditingRecord(null);
            }}
            onSubmit={(body) => editingRecord ? updateMutation.mutate({ id: editingRecord.id, body: body as Raw }) : undefined}
          />
        </>
      ) : (
        <>
          <CreateModal
            open={createOpen}
            title={meta.primaryAction ?? `Create ${meta.title}`}
            fields={createFields ?? meta.createFields ?? []}
            fieldErrors={createFieldErrors}
            formError={createFormError}
            onClearFieldError={(field) => setCreateFieldErrors((current) => {
              const next = { ...current };
              delete next[field];
              return next;
            })}
            onClose={() => {
              clearCreateErrors();
              setCreateOpen(false);
            }}
            onSubmit={(formPayload) => createMutation.mutate(payload(formPayload))}
          />
          <EditModal
            open={Boolean(editingRecord)}
            title={`Edit ${editingRecord?.title ?? meta.title}`}
            fields={editFields ?? meta.editFields ?? createFields ?? meta.createFields ?? []}
            initialValues={editingRecord?.values}
            fieldErrors={editFieldErrors}
            formError={editFormError}
            onClearFieldError={(field) => setEditFieldErrors((current) => {
              const next = { ...current };
              delete next[field];
              return next;
            })}
            onClose={() => {
              clearEditErrors();
              setEditingRecord(null);
            }}
            onSubmit={(formPayload) => editingRecord ? updateMutation.mutate({ id: editingRecord.id, body: payload(formPayload) }) : undefined}
          />
        </>
      )}
    </div>
  );
}

export function ControlPollsCardsPage() {
  return (
    <CardGridResourcePage
      meta={pollsMeta}
      queryKey={["control", "polls"]}
      queryFn={() => pollsService.list<Raw>({ take: 50 })}
      mapRecord={mapPoll}
      createFn={(body) => {
        const { discussionId, ...payload } = body;
        return pollsService.create(String(discussionId), payload);
      }}
      updateFn={(id, body) => pollsService.update(id, body)}
      deleteFn={(id) => pollsService.remove(id)}
      optionVariant="poll"
    />
  );
}

export function ControlElectionsCardsPage() {
  return (
    <CardGridResourcePage
      meta={electionsMeta}
      queryKey={["control", "elections"]}
      queryFn={() => electionsService.list<Raw>({ take: 50 })}
      mapRecord={mapElection}
      createFn={(body) => electionsService.create(body)}
      updateFn={(id, body) => electionsService.update(id, body)}
      deleteFn={(id) => electionsService.remove(id)}
      optionVariant="election"
    />
  );
}

export function ControlRatingsCardsPage() {
  return (
    <CardGridResourcePage
      meta={ratingsMeta}
      queryKey={["control", "ratings"]}
      queryFn={() => ratingsService.list<Raw>({ take: 50 })}
      mapRecord={mapRating}
      createFn={(body) => ratingsService.create(body)}
      updateFn={(_, body) => ratingsService.update(body)}
      deleteFn={(id) => ratingsService.remove(id)}
      payload={withNumericPartyId}
    />
  );
}

export function ControlPartiesCardsPage() {
  return (
    <CardGridResourcePage
      meta={partiesMeta}
      queryKey={["control", "parties"]}
      queryFn={() => partiesService.list<Raw>()}
      mapRecord={mapParty}
      createFn={(body) => partiesService.create(body)}
      updateFn={(id, body) => partiesService.update(id, body)}
      deleteFn={(id) => partiesService.remove(id)}
    />
  );
}

export function ControlPoliticiansCardsPage() {
  return (
    <CardGridResourcePage
      meta={politiciansMeta}
      queryKey={["control", "politicians"]}
      queryFn={() => politiciansService.list<Raw>()}
      mapRecord={mapPolitician}
      createFn={(body) => politiciansService.create(body)}
      updateFn={(id, body) => politiciansService.update(id, body)}
      deleteFn={(id) => politiciansService.remove(id)}
      payload={omitEmpty}
    />
  );
}

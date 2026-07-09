import type { ApiRecord, Issue, Politician, Poll, Post, User } from "@/types";

export function asArray<T = ApiRecord>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["items", "results", "records", "data", "comments"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

export function extractComments(value: unknown): ApiRecord[] {
  return asArray<ApiRecord>(value);
}

export function commentAuthor(comment: ApiRecord) {
  const user = (comment.user ?? comment.createdBy) as ApiRecord | undefined;
  if (user && typeof user === "object" && Object.keys(user).length > 0) {
    return displayName(user);
  }
  return "Citizen";
}

export function displayName(record: ApiRecord) {
  return String(
    record.title ??
      record.name ??
      record.topic ??
      record.question ??
      record.username ??
      record.email ??
      record.id ??
      "Untitled"
  );
}

export function recordId(record: ApiRecord) {
  return String(record.id ?? record.slug ?? displayName(record));
}

export function formatDate(value: unknown) {
  if (!value) return "Not set";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function resolveUserReaction(raw: ApiRecord, userId?: string): Post["userReaction"] {
  if (!userId) return null;
  const stores = asArray<ApiRecord>(raw.postStore);
  const mine = stores.find((store) => String(store.userId) === userId);
  if (!mine) return null;
  if (mine.liked) return "like";
  if (mine.disliked) return "dislike";
  return null;
}

export function normalizeBadge(value: string): string | undefined {
  return value.replace(/_/g, " ").trim();
}

export function normalizePost(raw: ApiRecord, userId?: string): Post {
  const user = (raw.user ?? raw.createdBy ?? raw.author) as ApiRecord | string | undefined;
  const discussion = (raw.discussion ?? raw.discussions) as ApiRecord | string | undefined;
  const count = raw._count && typeof raw._count === "object" ? raw._count as ApiRecord : {};
  const author =
    typeof user === "object" && user
      ? String(user.username ?? user.firstName ?? user.email ?? "Citizen")
      : String(user ?? "Citizen");

  return {
    id: recordId(raw),
    author,
    handle: author.startsWith("@") ? author : `@${author}`,
    user: user as User,
    topic:
      typeof discussion === "object" && discussion
        ? String(discussion.topic ?? discussion.question ?? "Civic discourse")
        : String(raw.topic ?? discussion ?? "Civic discourse"),
    message: String(raw.message ?? raw.description ?? raw.content ?? ""),
    likes: Number(raw.likes ?? raw.likeCount ?? 0),
    dislikes: Number(raw.dislikes ?? raw.dislikeCount ?? 0),
    comments: Number(raw.comments ?? raw.commentCount ?? 0),
    shares: Number(raw.shares ?? raw.shareCount ?? 0),
    badge: raw.type ? String(raw.type) : undefined,
    discussionId: raw.discussionsId ? String(raw.discussionsId) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    userReaction: resolveUserReaction(raw, userId),
    _count: {
      comments: Number(count.comments ?? raw.comments ?? raw.commentCount ?? 0),
    },
  };
}

export function normalizeIssue(raw: ApiRecord): Issue {
  return {
    id: recordId(raw),
    title: String(raw.title ?? "Untitled issue"),
    description: String(raw.description ?? ""),
    location: [raw.ward, raw.lga, raw.state].filter(Boolean).join(", ") || String(raw.location ?? "Nigeria"),
    category: String(raw.category ?? raw.type ?? "Civic issue"),
    status: (String(raw.status ?? "OPEN") as Issue["status"]),
    upvotes: Number(raw.upvoteCount ?? raw.upvotes ?? raw.votes ?? 0),
    comments: Number(raw.commentCount ?? raw.comments ?? 0),
    priority: Number(raw.priority ?? 1) >= 3 ? "High" : Number(raw.priority ?? 1) === 2 ? "Medium" : "Low"
  };
}

export function normalizePolitician(raw: ApiRecord): Politician {
  const party = raw.party as ApiRecord | string | undefined;
  return {
    id: recordId(raw),
    name: String(raw.name ?? "Unnamed politician"),
    party: typeof party === "object" && party ? String(party.acronym ?? party.name ?? "Party") : String(party ?? raw.partyName ?? "Party"),
    position: String(raw.position ?? raw.office ?? "Public office"),
    state: String(raw.state ?? raw.constituency ?? "Nigeria"),
    approvalScore: Number(raw.approvalScore ?? raw.approval ?? 0),
    performanceScore: Number(raw.performanceScore ?? raw.score ?? 0),
    verified: Boolean(raw.verified)
  };
}

export function normalizePoll(raw: ApiRecord): Poll {
  const optionsRecord = raw.options && typeof raw.options === "object" ? raw.options as Record<string, ApiRecord> : {};
  const options = Object.entries(optionsRecord).map(([key, option]) => ({
    label: String(option.text ?? option.label ?? key),
    key,
    value: Number(option.value ?? 0)
  }));
  const votes = Number(raw.pollCount ?? raw.voteCount ?? options.reduce((total, option) => total + option.value, 0));
  const percentageOptions = options.map((option) => ({
    label: option.label,
    key: option.key,
    value: votes > 0 ? Math.round((option.value / votes) * 100) : 0,
    rawValue: option.value
  }));

  return {
    id: recordId(raw),
    question: String(raw.question ?? raw.title ?? "Untitled poll"),
    votes,
    expiresIn: String(raw.status ?? raw.expiresIn ?? "Active"),
    options: percentageOptions
  };
}

export function stringifyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export function userDisplayName(user: Pick<User, "firstName" | "lastName" | "username" | "email">) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.email || "Citizen";
}

export function userInitials(user: Pick<User, "firstName" | "lastName" | "username" | "email">) {
  const name = userDisplayName(user);
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function normalizeUserProfile(raw: ApiRecord): User {
  return {
    id: recordId(raw),
    email: raw.email ? String(raw.email) : undefined,
    firstName: raw.firstName ? String(raw.firstName) : undefined,
    lastName: raw.lastName ? String(raw.lastName) : undefined,
    username: String(raw.username ?? "citizen"),
    role: String(raw.role ?? "USER") as User["role"],
    state: raw.state ? String(raw.state) : undefined,
    lga: raw.lga ? String(raw.lga) : undefined,
    ward: raw.ward ? String(raw.ward) : undefined,
    constituency: raw.constituency ? String(raw.constituency) : undefined,
    profilePic: raw.profilePic ? String(raw.profilePic) : undefined,
    reputationScore: Number(raw.reputationScore ?? 0),
    about: raw.about ? String(raw.about) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    verified: Boolean(raw.verified),
    verifiedPhone: Boolean(raw.verifiedPhone),
    interests: Array.isArray(raw.interests) ? raw.interests.map(String) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    posts: asArray<ApiRecord>(raw.posts)
  };
}

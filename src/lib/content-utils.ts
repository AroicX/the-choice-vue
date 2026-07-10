import type { ApiRecord, Community, Election, FactCheck, Issue, Politician, Poll, Post, RatingCandidate, Scorecard, User } from "@/types";
import { normalizeMediaAttachments } from "@/lib/media-utils";

export function asArray<T = ApiRecord>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "records",
      "data",
      "comments",
      "posts",
      "polls",
      "poll",
      "elections",
      "election",
      "room",
      "rooms",
      "discussions"
    ]) {
      const nested = record[key];
      if (Array.isArray(nested)) return nested as T[];
    }

    // Some endpoints return a single resource under a singular key (e.g. `{ poll: {...} }`).
    for (const key of ["poll", "election", "post", "comment", "discussion"]) {
      const nested = record[key];
      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        return [nested as T];
      }
    }

    // getData may already unwrap to a single resource object.
    if (record.id != null) return [value as T];
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

export function commentAuthorProfilePic(comment: ApiRecord) {
  const user = (comment.user ?? comment.createdBy) as ApiRecord | undefined;
  if (!user || typeof user !== "object") return undefined;
  return user.profilePic ? String(user.profilePic) : undefined;
}

export function displayName(record: ApiRecord) {
  return String(
    record.title ??
      record.name ??
      record.claim ??
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

export function isRoomMember(rooms: Array<{ discussionsId?: string; discussions?: { id?: string } }>, discussionId: string) {
  const target = String(discussionId);
  return rooms.some((room) => String(room.discussionsId ?? room.discussions?.id ?? "") === target);
}

export function formatDate(value: unknown) {
  if (!value) return "Not set";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function formatRelativeTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 1)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return formatDate(value);
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
    attachments: normalizeMediaAttachments(raw.attachments),
    _count: {
      comments: Number(count.comments ?? raw.comments ?? raw.commentCount ?? 0),
    },
  };
}

export function normalizeIssue(raw: ApiRecord): Issue {
  const politician = raw.politician as ApiRecord | undefined;
  const createdBy = raw.createdBy as ApiRecord | undefined;
  const evidence = raw.evidence && typeof raw.evidence === "object" ? raw.evidence as ApiRecord : {};
  const photos = Array.isArray(evidence.photos) ? evidence.photos.map(String).filter(Boolean) : [];
  const documents = Array.isArray(evidence.documents) ? evidence.documents.map(String).filter(Boolean) : [];

  return {
    id: recordId(raw),
    title: String(raw.title ?? "Untitled issue"),
    description: String(raw.description ?? ""),
    location: [raw.ward, raw.lga, raw.state].filter(Boolean).join(", ") || String(raw.location ?? "Nigeria"),
    category: String(raw.category ?? raw.type ?? "Civic issue"),
    status: (String(raw.status ?? "OPEN") as Issue["status"]),
    upvotes: Number(raw.upvoteCount ?? raw.upvotes ?? raw.votes ?? 0),
    comments: Number(raw.commentCount ?? raw.comments ?? 0),
    priority: Number(raw.priority ?? 1) >= 3 ? "High" : Number(raw.priority ?? 1) === 2 ? "Medium" : "Low",
    type: raw.type ? String(raw.type) : undefined,
    evidencePhotos: photos,
    evidenceDocuments: documents,
    aiSummary: raw.aiSummary ? String(raw.aiSummary) : undefined,
    politicianId: politician?.id ? String(politician.id) : raw.politicianId ? String(raw.politicianId) : undefined,
    politicianName: politician?.name ? String(politician.name) : undefined,
    politicianImage: politician?.imageUrl ? String(politician.imageUrl) : undefined,
    createdByName: createdBy
      ? [createdBy.firstName, createdBy.lastName].filter(Boolean).join(" ") || String(createdBy.username ?? "Citizen")
      : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined
  };
}

export function normalizePolitician(raw: ApiRecord): Politician {
  const party = raw.party as ApiRecord | string | undefined;
  const count = raw._count && typeof raw._count === "object" ? raw._count as ApiRecord : {};
  const partyImage = typeof party === "object" && party ? String(party.image ?? "").trim() : "";
  const image = String(raw.imageUrl ?? raw.image ?? "").trim();

  return {
    id: recordId(raw),
    name: String(raw.name ?? "Unnamed politician"),
    party: typeof party === "object" && party ? String(party.acronym ?? party.name ?? "Party") : String(party ?? raw.partyName ?? "Party"),
    partyImage: partyImage || undefined,
    position: String(raw.position ?? raw.office ?? "Public office"),
    state: String(raw.state ?? "Nigeria"),
    lga: raw.lga ? String(raw.lga) : undefined,
    constituency: raw.constituency ? String(raw.constituency) : undefined,
    biography: raw.biography ? String(raw.biography) : undefined,
    manifesto: raw.manifesto ? String(raw.manifesto) : undefined,
    imageUrl: image || undefined,
    slug: raw.slug ? String(raw.slug) : undefined,
    approvalScore: Number(raw.approvalScore ?? raw.approval ?? 0),
    performanceScore: Number(raw.performanceScore ?? raw.score ?? 0),
    verified: Boolean(raw.verified),
    termStart: raw.termStart ? String(raw.termStart) : undefined,
    termEnd: raw.termEnd ? String(raw.termEnd) : undefined,
    promiseCount: Number(count.promises ?? raw.promiseCount ?? 0),
    issueCount: Number(count.issues ?? raw.issueCount ?? 0),
    ratingCount: Number(count.ratings ?? raw.ratingCount ?? 0)
  };
}

export function normalizeScorecard(raw: ApiRecord): Scorecard {
  return {
    approvalRating: Number(raw.approvalRating ?? raw.approvalScore ?? 0),
    performanceScore: Number(raw.performanceScore ?? 0),
    promiseDeliveryRate: Number(raw.promiseDeliveryRate ?? 0),
    publicSentiment: Number(raw.publicSentiment ?? 0),
    issueResponseRate: Number(raw.issueResponseRate ?? 0),
    factCheckScore: Number(raw.factCheckScore ?? 0),
    transparencyScore: Number(raw.transparencyScore ?? 0)
  };
}

export function normalizeFactCheck(raw: ApiRecord): FactCheck {
  const sourcesRaw = raw.sources;
  let sources: string[] = [];
  if (Array.isArray(sourcesRaw)) sources = sourcesRaw.map(String);
  else if (sourcesRaw && typeof sourcesRaw === "object") {
    const record = sourcesRaw as ApiRecord;
    if (Array.isArray(record.urls)) sources = record.urls.map(String);
  }

  const related = raw.relatedIds && typeof raw.relatedIds === "object" ? raw.relatedIds as ApiRecord : {};
  const relatedPoliticianIds = Array.isArray(related.politicians) ? related.politicians.map(String) : [];

  return {
    id: recordId(raw),
    claim: String(raw.claim ?? raw.title ?? "Untitled claim"),
    verdict: String(raw.verdict ?? "UNVERIFIED"),
    explanation: String(raw.explanation ?? raw.description ?? ""),
    sources,
    relatedPoliticianIds,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined
  };
}

export function normalizeCommunity(raw: ApiRecord): Community {
  return {
    id: recordId(raw),
    name: String(raw.name ?? "Untitled community"),
    slug: raw.slug ? String(raw.slug) : undefined,
    type: String(raw.type ?? "TOPIC"),
    description: String(raw.description ?? ""),
    state: raw.state ? String(raw.state) : undefined,
    lga: raw.lga ? String(raw.lga) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined
  };
}

export function normalizeVoteOptions(raw: ApiRecord, totalVotes?: number) {
  const optionsRecord = raw.options && typeof raw.options === "object" && !Array.isArray(raw.options)
    ? raw.options as Record<string, ApiRecord>
    : {};
  const options = Object.entries(optionsRecord).map(([key, option]) => {
    const image = String(option.image ?? option.imageUrl ?? option.photo ?? option.avatar ?? "").trim();
    return {
      label: String(option.text ?? option.label ?? key),
      key,
      value: Number(option.value ?? 0),
      image: image || undefined
    };
  });
  const votes = totalVotes ?? options.reduce((total, option) => total + option.value, 0);
  return options.map((option) => ({
    ...option,
    value: votes > 0 ? Math.round((option.value / votes) * 100) : 0,
    rawValue: option.value
  }));
}

export function normalizePoll(raw: ApiRecord): Poll {
  const votes = Number(raw.pollCount ?? raw.voteCount ?? 0);
  return {
    id: recordId(raw),
    question: String(raw.question ?? raw.title ?? "Untitled poll"),
    votes: votes || normalizeVoteOptions(raw).reduce((total, option) => total + (option.rawValue ?? 0), 0),
    expiresIn: String(raw.status ?? raw.expiresIn ?? "Active"),
    options: normalizeVoteOptions(raw, votes || undefined),
    hasVoted: Boolean(raw.hasVoted),
    userOption: raw.userOption ? String(raw.userOption) : null
  };
}

export function normalizeElection(raw: ApiRecord): Election {
  const votes = Number(raw.electionCount ?? raw.voteCount ?? 0);
  const options = normalizeVoteOptions(raw, votes || undefined);
  const cover = String(raw.image ?? raw.imageUrl ?? raw.banner ?? raw.coverImage ?? "").trim();
  const firstOptionImage = options.find((option) => option.image)?.image;
  return {
    id: recordId(raw),
    title: String(raw.title ?? raw.question ?? "Untitled election"),
    description: raw.description ? String(raw.description) : undefined,
    status: String(raw.status ?? "Live"),
    type: raw.type ? String(raw.type) : undefined,
    votes: votes || options.reduce((total, option) => total + (option.rawValue ?? 0), 0),
    options,
    image: cover || firstOptionImage || undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    hasVoted: Boolean(raw.hasVoted),
    userOption: raw.userOption ? String(raw.userOption) : null
  };
}

export function normalizeRatingOffice(value: unknown) {
  const raw = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  if (!raw) return "OTHER";
  if (/(PRESIDEN|PRESIDENCY)/.test(raw)) return "PRESIDENCY";
  if (/SENAT/.test(raw)) return "SENATOR";
  if (/GOVERN/.test(raw)) return "GOVERNOR";
  if (/(HOUSE|REPRESENT|ASSEMBLY)/.test(raw)) return "HOUSE";
  if (["PRESIDENCY", "SENATOR", "GOVERNOR", "HOUSE"].includes(raw)) return raw;
  return raw;
}

export function ratingOfficeLabel(office: string) {
  switch (normalizeRatingOffice(office)) {
    case "PRESIDENCY":
      return "President";
    case "SENATOR":
      return "Senators";
    case "GOVERNOR":
      return "Governors";
    case "HOUSE":
      return "House of Reps";
    default:
      return office
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export function normalizeRatingCandidate(raw: ApiRecord): RatingCandidate {
  const party = raw.party as ApiRecord | string | undefined;
  const partyName = typeof party === "object" && party
    ? String(party.acronym ?? party.slug ?? party.name ?? "").toUpperCase()
    : String(party ?? raw.partyName ?? "");
  const partyImage = typeof party === "object" && party ? String(party.image ?? "").trim() : "";
  const image = String(raw.image ?? raw.imageUrl ?? raw.avatar ?? "").trim();
  const office = normalizeRatingOffice(raw.candidate ?? raw.position);
  return {
    id: recordId(raw),
    name: String(raw.name ?? "Unnamed candidate"),
    image: image || undefined,
    position: office === "OTHER" ? String(raw.position ?? raw.candidate ?? "Public office") : office,
    party: partyName || undefined,
    partyImage: partyImage || undefined,
    state: raw.state ? String(raw.state) : undefined,
    score: Number(raw.score ?? raw.performanceScore ?? raw.approvalScore ?? 0),
    politicianId: raw.politicianId ? String(raw.politicianId) : undefined,
    education: raw.education ? String(raw.education) : undefined,
    profession: raw.profession ? String(raw.profession) : undefined,
    constituency: raw.constituency ? String(raw.constituency) : undefined,
    hasRated: Boolean(raw.hasRated)
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
  const statsRaw = raw.stats && typeof raw.stats === "object" ? (raw.stats as ApiRecord) : null;
  const viewerRaw = raw.viewer && typeof raw.viewer === "object" ? (raw.viewer as ApiRecord) : null;

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
    posts: asArray<ApiRecord>(raw.posts),
    stats: statsRaw
      ? {
          posts: Number(statsRaw.posts ?? 0),
          comments: Number(statsRaw.comments ?? 0),
          likesGiven: Number(statsRaw.likesGiven ?? 0),
          likesReceived: Number(statsRaw.likesReceived ?? 0),
          shares: Number(statsRaw.shares ?? 0),
          votes: Number(statsRaw.votes ?? 0),
          issues: Number(statsRaw.issues ?? 0),
          media: Number(statsRaw.media ?? 0),
          followers: Number(statsRaw.followers ?? 0),
          following: Number(statsRaw.following ?? 0)
        }
      : undefined,
    viewer: viewerRaw
      ? {
          isFollowing: Boolean(viewerRaw.isFollowing),
          isSelf: Boolean(viewerRaw.isSelf)
        }
      : undefined
  };
}

export function profilePath(
  user?: { username?: string; id?: string } | null,
  fallback?: string
) {
  const username = user?.username?.trim().replace(/^@+/, "");
  if (username) return `/u/${encodeURIComponent(username)}`;
  if (user?.id) return `/u/${encodeURIComponent(user.id)}`;
  if (fallback) return `/u/${encodeURIComponent(fallback.replace(/^@+/, ""))}`;
  return "/profile";
}

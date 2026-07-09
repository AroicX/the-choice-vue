import { detailsFrom, nestedValue, roles, states, statusField, valueFrom, type AdminPageMeta, type AdminRecord } from "@/lib/admin-control-data";

type Raw = Record<string, unknown>;

export type OptionPayload = Record<string, unknown> & {
  options: Record<string, { text: string; image: string | null; value: number }>;
};

function idOf(raw: Raw) {
  return String(raw.id ?? raw._id ?? raw.slug ?? crypto.randomUUID());
}

function fullName(raw: Raw) {
  return [raw.firstName, raw.lastName].filter(Boolean).join(" ") || String(raw.name ?? raw.username ?? raw.email ?? "Untitled");
}

function dateOf(raw: Raw) {
  const value = raw.createdAt ?? raw.publishedAt ?? raw.updatedAt;
  return value ? new Date(String(value)).toLocaleDateString() : "-";
}

function recordFrom(raw: Raw, title: string, values: AdminRecord["values"], status?: string, subtitle?: string): AdminRecord {
  return {
    id: idOf(raw),
    title,
    subtitle,
    status,
    role: typeof values.role === "string" ? values.role : undefined,
    createdAt: String(values.createdAt ?? dateOf(raw)),
    values,
    details: detailsFrom(values),
    raw
  };
}

export const usersMeta: AdminPageMeta = {
  title: "Users",
  description: "Manage accounts, verification, roles, suspensions, and user activity.",
  primaryAction: "Add User",
  secondaryActions: ["Export Users"],
  filters: ["Role", "State", "Verification", "Status"],
  bulkActions: ["Export Selected", "Suspend Selected"],
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "state", label: "State" },
    { key: "verified", label: "Verification" },
    { key: "accountStatus", label: "Account" },
    { key: "createdAt", label: "Date joined" }
  ],
  rowActions: ["View", "Suspend", "Unsuspend"],
  createFields: [
    { name: "firstName", label: "First name" },
    { name: "lastName", label: "Last name" },
    { name: "username", label: "Username" },
    { name: "email", label: "Email", type: "email" },
    { name: "phoneNo", label: "Phone", type: "tel" },
    { name: "password", label: "Password", type: "password" }
  ],
  emptyTitle: "No users returned",
  emptyDescription: "No users are available right now."
};

export function mapUser(raw: Raw): AdminRecord {
  const active = raw.active !== false && raw.isSuspended !== true;
  const values = {
    name: fullName(raw),
    email: String(raw.email ?? "-"),
    phone: String(raw.phone ?? raw.phoneNo ?? "-"),
    role: String(raw.role ?? "USER"),
    state: String(raw.state ?? "-"),
    verified: raw.verified ? "Verified" : "Unverified",
    accountStatus: active ? "Active" : "Suspended",
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.name), values, active ? "active" : "suspended", String(values.email));
}

export const discussionsMeta: AdminPageMeta = {
  title: "Discussions",
  description: "Manage civic discourse topics.",
  primaryAction: "Create Discussion",
  filters: ["Status"],
  columns: [
    { key: "title", label: "Title" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    { key: "posts", label: "Posts" },
    { key: "rooms", label: "Rooms" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "topic", label: "Title" },
    { name: "question", label: "Question" },
    { name: "description", label: "Description", type: "textarea" }
  ],
  editFields: [
    { name: "topic", label: "Title" },
    { name: "question", label: "Question" },
    { name: "description", label: "Description", type: "textarea" }
  ],
  emptyTitle: "No discussions returned",
  emptyDescription: "No discussions are available right now."
};

export function mapDiscussion(raw: Raw): AdminRecord {
  const values = {
    title: String(raw.topic ?? raw.title ?? "-"),
    slug: String(raw.slug ?? "-"),
    description: String(raw.description ?? raw.question ?? "-"),
    posts: Array.isArray(raw.posts) ? raw.posts.length : Number(raw.postsCount ?? 0),
    rooms: Array.isArray(raw.rooms) ? raw.rooms.length : Number(raw.roomsCount ?? 0),
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.title), values, "active");
}

export const postsMeta: AdminPageMeta = {
  title: "Posts",
  description: "Review posts, inspect activity, and remove content when needed.",
  primaryAction: "Create Post",
  filters: ["Discussion", "Status"],
  columns: [
    { key: "author", label: "Author" },
    { key: "preview", label: "Content preview" },
    { key: "discussion", label: "Discussion" },
    { key: "likes", label: "Likes" },
    { key: "dislikes", label: "Dislikes" },
    { key: "comments", label: "Comments" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Delete"],
  createFields: [
    { name: "discussionsId", label: "Discussion ID" },
    { name: "message", label: "Content", type: "textarea" }
  ],
  emptyTitle: "No posts returned",
  emptyDescription: "No posts are available right now."
};

export function mapPost(raw: Raw): AdminRecord {
  const values = {
    author: nestedValue(raw, "user", ["username", "firstName", "email"], String(raw.author ?? "-")),
    preview: String(raw.message ?? raw.content ?? "-").slice(0, 120),
    discussion: nestedValue(raw, "discussions", ["topic", "question"], String(raw.discussion ?? raw.discussionsId ?? "-")),
    likes: Number(raw.likes ?? 0),
    dislikes: Number(raw.dislikes ?? 0),
    comments: Array.isArray(raw.comments) ? raw.comments.length : Number(raw.commentCount ?? 0),
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.preview), values, "active", String(values.author));
}

export const commentsMeta: AdminPageMeta = {
  title: "Comments",
  description: "Moderate comments and thread context.",
  primaryAction: "Create Comment",
  filters: ["Status"],
  columns: [
    { key: "author", label: "Author" },
    { key: "preview", label: "Comment preview" },
    { key: "parentPost", label: "Parent post" },
    { key: "likes", label: "Likes" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "postId", label: "Parent post ID" },
    { name: "message", label: "Comment", type: "textarea" }
  ],
  editFields: [{ name: "message", label: "Comment", type: "textarea" }],
  emptyTitle: "No comments returned",
  emptyDescription: "No comments are available right now."
};

export function mapComment(raw: Raw): AdminRecord {
  const values = {
    author: nestedValue(raw, "user", ["username", "firstName", "email"], "-"),
    preview: String(raw.message ?? "-").slice(0, 120),
    parentPost: String(raw.postsId ?? raw.postId ?? "-"),
    likes: Number(raw.likes ?? 0),
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.preview), values, "active", String(values.author));
}

export const pollsMeta: AdminPageMeta = {
  title: "Polls",
  description: "Manage polls, voting windows, and results.",
  primaryAction: "Create Poll",
  filters: ["Status"],
  columns: [
    { key: "question", label: "Question" },
    { key: "discussion", label: "Discussion" },
    { key: "votes", label: "Total votes" },
    { key: "status", label: "Status" },
    { key: "endDate", label: "End date" }
  ],
  rowActions: ["View Results", "Edit", "Delete"],
  createFields: [
    { name: "discussionId", label: "Discussion ID" },
    { name: "question", label: "Question", type: "textarea" },
    { name: "optionText", label: "Option text" },
    { name: "optionImage", label: "Option image URL" }
  ],
  editFields: [
    { name: "question", label: "Question", type: "textarea" },
    { name: "optionText", label: "Option text" },
    { name: "optionImage", label: "Option image URL" }
  ],
  emptyTitle: "No polls returned",
  emptyDescription: "No polls are available right now."
};

export function mapPoll(raw: Raw): AdminRecord {
  const values = {
    question: String(raw.question ?? "-"),
    discussion: nestedValue(raw, "discussions", ["topic", "question"], String(raw.discussionsId ?? "-")),
    votes: Number(raw.pollCount ?? raw.voteCount ?? 0),
    status: String(raw.status ?? "Created"),
    endDate: raw.expiresAt ? new Date(String(raw.expiresAt)).toLocaleDateString() : "-",
    options: raw.options && typeof raw.options === "object" ? Object.keys(raw.options as Raw).length : 0
  };
  return recordFrom(raw, String(values.question), values, String(values.status).toLowerCase());
}

export const electionsMeta: AdminPageMeta = {
  title: "Elections",
  description: "Manage elections, candidates, voting windows, and results.",
  primaryAction: "Create Election",
  secondaryActions: ["Import Candidates"],
  filters: ["Type", "Status"],
  columns: [
    { key: "title", label: "Election title" },
    { key: "type", label: "Election type" },
    { key: "status", label: "Status" },
    { key: "votes", label: "Votes" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Edit", "View Results", "Delete"],
  createFields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "optionText", label: "Candidate/option name" },
    { name: "optionImage", label: "Candidate/option image URL" }
  ],
  editFields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "optionText", label: "Candidate/option name" },
    { name: "optionImage", label: "Candidate/option image URL" }
  ],
  emptyTitle: "No elections returned",
  emptyDescription: "No elections are available right now."
};

export function mapElection(raw: Raw): AdminRecord {
  const values = {
    title: String(raw.title ?? "-"),
    type: String(raw.type ?? "-"),
    status: String(raw.status ?? "Upcoming"),
    votes: Number(raw.electionCount ?? raw.voteCount ?? 0),
    options: raw.options && typeof raw.options === "object" ? Object.keys(raw.options as Raw).length : 0,
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.title), values, String(values.status).toLowerCase());
}

export const ratingsMeta: AdminPageMeta = {
  title: "Ratings",
  description: "Manage rating candidates, criteria, and SDG data.",
  primaryAction: "Create Rating Candidate",
  secondaryActions: ["Manage Criteria", "Export Ratings"],
  filters: ["Position", "State"],
  columns: [
    { key: "name", label: "Politician/Candidate" },
    { key: "position", label: "Position" },
    { key: "constituency", label: "Constituency" },
    { key: "state", label: "State" },
    { key: "education", label: "Education" }
  ],
  rowActions: ["View Summary", "Edit", "Delete"],
  createFields: [
    { name: "name", label: "Name" },
    { name: "candidate", label: "Candidate type", type: "select", options: ["PRESIDENCY", "GOVERNOR", "SENATOR", "HOUSE"] },
    { name: "partyId", label: "Party ID", type: "number" },
    { name: "position", label: "Position" },
    { name: "constituency", label: "Constituency" },
    { name: "age", label: "Age" },
    { name: "education", label: "Education" },
    { name: "profession", label: "Profession" },
    { name: "image", label: "Candidate image URL" },
    { name: "state", label: "State", type: "select", options: states }
  ],
  editFields: [
    { name: "candidate_id", label: "Candidate ID" },
    { name: "name", label: "Name" },
    { name: "position", label: "Position" },
    { name: "constituency", label: "Constituency" },
    { name: "age", label: "Age" },
    { name: "education", label: "Education" },
    { name: "profession", label: "Profession" },
    { name: "image", label: "Candidate image URL" }
  ],
  emptyTitle: "No ratings returned",
  emptyDescription: "No ratings are available right now."
};

export function mapRating(raw: Raw): AdminRecord {
  const values = {
    name: String(raw.name ?? "-"),
    position: String(raw.position ?? raw.candidate ?? "-"),
    constituency: String(raw.constituency ?? "-"),
    state: String(raw.state ?? "-"),
    education: String(raw.education ?? "-"),
    profession: String(raw.profession ?? "-"),
    image: String(raw.image ?? "")
  };
  return recordFrom(raw, String(values.name), values, "active", String(values.position));
}

export const partiesMeta: AdminPageMeta = {
  title: "Political Parties",
  description: "Manage political parties and party profiles.",
  primaryAction: "Create Party",
  secondaryActions: ["Export"],
  filters: ["Status"],
  columns: [
    { key: "name", label: "Name" },
    { key: "acronym", label: "Acronym" },
    { key: "chairman", label: "Chairman" },
    { key: "website", label: "Website" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "name", label: "Party name" },
    { name: "slug", label: "Slug" },
    { name: "acronym", label: "Acronym" },
    { name: "founded", label: "Founded" },
    { name: "image", label: "Logo image URL" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "website", label: "Website" },
    { name: "chairman", label: "Chairman" }
  ],
  editFields: [
    { name: "name", label: "Party name" },
    { name: "slug", label: "Slug" },
    { name: "acronym", label: "Acronym" },
    { name: "founded", label: "Founded" },
    { name: "image", label: "Logo image URL" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "website", label: "Website" },
    { name: "chairman", label: "Chairman" }
  ],
  emptyTitle: "No parties returned",
  emptyDescription: "No parties are available right now."
};

export function mapParty(raw: Raw): AdminRecord {
  const values = {
    name: String(raw.name ?? "-"),
    acronym: String(raw.acronym ?? "-"),
    chairman: String(raw.chairman ?? "-"),
    founded: String(raw.founded ?? "-"),
    image: String(raw.image ?? ""),
    website: String(raw.website ?? "-"),
    description: String(raw.description ?? "-"),
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.name), values, "active", String(values.acronym));
}

export const politiciansMeta: AdminPageMeta = {
  title: "Candidates / Politicians",
  description: "Manage politician profiles, verification, and scorecards.",
  primaryAction: "Add Politician",
  secondaryActions: ["Import CSV"],
  filters: ["Position", "State", "Party"],
  columns: [
    { key: "name", label: "Name" },
    { key: "party", label: "Party" },
    { key: "position", label: "Position" },
    { key: "state", label: "State" },
    { key: "constituency", label: "Constituency" },
    { key: "verified", label: "Verification" },
    { key: "approval", label: "Approval rating" }
  ],
  rowActions: ["View", "Edit", "Verify", "Unverify", "View Scorecard", "Delete"],
  createFields: [
    { name: "name", label: "Full name" },
    { name: "slug", label: "Slug" },
    { name: "partyId", label: "Party ID" },
    { name: "position", label: "Position", type: "select", options: ["PRESIDENCY", "GOVERNOR", "SENATOR", "HOUSE"] },
    { name: "state", label: "State", type: "select", options: states },
    { name: "lga", label: "LGA" },
    { name: "constituency", label: "Constituency" },
    { name: "biography", label: "Biography", type: "textarea" },
    { name: "imageUrl", label: "Profile image URL" },
    { name: "manifesto", label: "Manifesto", type: "textarea" },
    { name: "approvalScore", label: "Approval score", type: "number" },
    { name: "performanceScore", label: "Performance score", type: "number" },
    { name: "termStart", label: "Term start", type: "date" },
    { name: "termEnd", label: "Term end", type: "date" },
    { name: "verified", label: "Verified", type: "checkbox" }
  ],
  editFields: [
    { name: "name", label: "Full name" },
    { name: "slug", label: "Slug" },
    { name: "partyId", label: "Party ID" },
    { name: "position", label: "Position", type: "select", options: ["PRESIDENCY", "GOVERNOR", "SENATOR", "HOUSE"] },
    { name: "state", label: "State", type: "select", options: states },
    { name: "lga", label: "LGA" },
    { name: "constituency", label: "Constituency" },
    { name: "biography", label: "Biography", type: "textarea" },
    { name: "imageUrl", label: "Profile image URL" },
    { name: "manifesto", label: "Manifesto", type: "textarea" },
    { name: "approvalScore", label: "Approval score", type: "number" },
    { name: "performanceScore", label: "Performance score", type: "number" },
    { name: "termStart", label: "Term start", type: "date" },
    { name: "termEnd", label: "Term end", type: "date" },
    { name: "verified", label: "Verified", type: "checkbox" }
  ],
  emptyTitle: "No politicians returned",
  emptyDescription: "No politicians are available right now."
};

export function mapPolitician(raw: Raw): AdminRecord {
  const values = {
    name: String(raw.name ?? "-"),
    party: nestedValue(raw, "party", ["acronym", "name"], String(raw.partyId ?? "-")),
    position: String(raw.position ?? "-"),
    state: String(raw.state ?? "-"),
    constituency: String(raw.constituency ?? "-"),
    verified: raw.verified ? "Verified" : "Unverified",
    approval: `${Number(raw.approvalScore ?? 0)}%`,
    performance: `${Number(raw.performanceScore ?? 0)}%`,
    imageUrl: String(raw.imageUrl ?? ""),
    biography: String(raw.biography ?? "-"),
    manifesto: String(raw.manifesto ?? "-"),
    termStart: raw.termStart ? new Date(String(raw.termStart)).toLocaleDateString() : "-",
    termEnd: raw.termEnd ? new Date(String(raw.termEnd)).toLocaleDateString() : "-"
  };
  return recordFrom(raw, String(values.name), values, raw.verified ? "verified" : "active", String(values.position));
}

export const issuesMeta: AdminPageMeta = {
  title: "Issues",
  description: "Review civic issues, assignments, and resolution status.",
  primaryAction: "Create Issue",
  filters: ["Status", "Category", "State"],
  columns: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "upvotes", label: "Upvotes" },
    { key: "location", label: "Location" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "type", label: "Type", type: "select", options: ["NATIONAL", "STATE", "LGA", "WARD"] },
    { name: "category", label: "Category" },
    { name: "state", label: "State", type: "select", options: states },
    { name: "lga", label: "LGA" },
    { name: "priority", label: "Priority", type: "number" },
    { name: "politicianId", label: "Politician ID" }
  ],
  editFields: [
    { name: "title", label: "Title" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "category", label: "Category" },
    { name: "status", label: "Status", type: "select", options: ["OPEN", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED", "ARCHIVED"] },
    { name: "priority", label: "Priority", type: "number" },
    { name: "politicianId", label: "Politician ID" }
  ],
  emptyTitle: "No issues returned",
  emptyDescription: "No civic issues are available right now."
};

export function mapIssue(raw: Raw): AdminRecord {
  const values = {
    title: String(raw.title ?? "-"),
    category: String(raw.category ?? "-"),
    status: String(raw.status ?? "OPEN"),
    priority: String(raw.priority ?? 0),
    upvotes: Number(raw.upvoteCount ?? 0),
    location: [raw.ward, raw.lga, raw.state].filter(Boolean).join(", ") || "-",
    politician: nestedValue(raw, "politician", ["name"], String(raw.politicianId ?? "-"))
  };
  return recordFrom(raw, String(values.title), values, String(values.status).toLowerCase(), String(values.category));
}

export const factChecksMeta: AdminPageMeta = {
  title: "Fact Checks",
  description: "Manage claims, verdicts, explanations, and source links.",
  primaryAction: "Create Fact Check",
  filters: ["Verdict"],
  columns: [
    { key: "claim", label: "Claim" },
    { key: "verdict", label: "Verdict" },
    { key: "sources", label: "Sources" },
    { key: "updatedAt", label: "Updated" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "claim", label: "Claim", type: "textarea" },
    { name: "verdict", label: "Verdict", type: "select", options: ["TRUE", "MOSTLY_TRUE", "MIXED", "MOSTLY_FALSE", "FALSE", "UNVERIFIED", "MISLEADING"] },
    { name: "explanation", label: "Explanation", type: "textarea" },
    { name: "sources", label: "Sources JSON", type: "textarea", placeholder: '{"urls":["https://example.com"]}' },
    { name: "relatedIds", label: "Related IDs JSON", type: "textarea", placeholder: '{"politicians":["uuid"]}' }
  ],
  editFields: [
    { name: "claim", label: "Claim", type: "textarea" },
    { name: "verdict", label: "Verdict", type: "select", options: ["TRUE", "MOSTLY_TRUE", "MIXED", "MOSTLY_FALSE", "FALSE", "UNVERIFIED", "MISLEADING"] },
    { name: "explanation", label: "Explanation", type: "textarea" },
    { name: "sources", label: "Sources JSON", type: "textarea" },
    { name: "relatedIds", label: "Related IDs JSON", type: "textarea" }
  ],
  emptyTitle: "No fact checks returned",
  emptyDescription: "No fact checks are available right now."
};

export function mapFactCheck(raw: Raw): AdminRecord {
  const sources = raw.sources && typeof raw.sources === "object" ? raw.sources as Raw : {};
  const urls = Array.isArray(sources.urls) ? sources.urls.length : 0;
  const values = {
    claim: String(raw.claim ?? "-").slice(0, 100),
    verdict: String(raw.verdict ?? "UNVERIFIED"),
    sources: `${urls} source${urls === 1 ? "" : "s"}`,
    updatedAt: dateOf(raw),
    explanation: String(raw.explanation ?? "-")
  };
  return recordFrom(raw, String(values.claim), values, String(values.verdict).toLowerCase());
}

export const communitiesMeta: AdminPageMeta = {
  title: "Communities",
  description: "Manage civic communities by state, LGA, and topic.",
  primaryAction: "Create Community",
  filters: ["Type", "State"],
  columns: [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "state", label: "State" },
    { key: "slug", label: "Slug" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Edit", "Delete"],
  createFields: [
    { name: "name", label: "Name" },
    { name: "slug", label: "Slug" },
    { name: "type", label: "Type", type: "select", options: ["STATE", "LGA", "WARD", "CONSTITUENCY", "TOPIC", "POLITICAL_PARTY", "CIVIL_SOCIETY"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "state", label: "State", type: "select", options: states },
    { name: "lga", label: "LGA" }
  ],
  editFields: [
    { name: "name", label: "Name" },
    { name: "slug", label: "Slug" },
    { name: "type", label: "Type", type: "select", options: ["STATE", "LGA", "WARD", "CONSTITUENCY", "TOPIC", "POLITICAL_PARTY", "CIVIL_SOCIETY"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "state", label: "State", type: "select", options: states },
    { name: "lga", label: "LGA" }
  ],
  emptyTitle: "No communities returned",
  emptyDescription: "No communities are available right now."
};

export function mapCommunity(raw: Raw): AdminRecord {
  const values = {
    name: String(raw.name ?? "-"),
    type: String(raw.type ?? "-"),
    state: String(raw.state ?? "-"),
    slug: String(raw.slug ?? "-"),
    createdAt: dateOf(raw),
    description: String(raw.description ?? "-")
  };
  return recordFrom(raw, String(values.name), values, "active", String(values.type));
}

export function factCheckPayload(payload: Record<string, string | boolean>) {
  const clean = omitEmpty(payload);
  return {
    claim: clean.claim,
    verdict: clean.verdict,
    explanation: clean.explanation,
    sources: parseJsonField(clean.sources ?? ""),
    relatedIds: parseJsonField(clean.relatedIds ?? "")
  };
}

export const notificationsMeta: AdminPageMeta = {
  title: "Notifications",
  description: "Create notifications and review user-targeted messages.",
  primaryAction: "Create Notification",
  secondaryActions: ["Send Broadcast"],
  filters: ["Read status"],
  columns: [
    { key: "message", label: "Message preview" },
    { key: "userId", label: "User" },
    { key: "read", label: "Read" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["View", "Delete"],
  createFields: [
    { name: "userId", label: "Target user ID" },
    { name: "message", label: "Message", type: "textarea" },
    { name: "data", label: "Data JSON", type: "textarea" }
  ],
  emptyTitle: "No notifications returned",
  emptyDescription: "No notifications are available for the current admin session."
};

export function mapNotification(raw: Raw): AdminRecord {
  const values = {
    message: String(raw.message ?? "-").slice(0, 120),
    userId: String(raw.userId ?? "-"),
    read: raw.isRead ? "Read" : "Unread",
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, String(values.message), values, raw.isRead ? "active" : "pending");
}

export const moderationMeta: AdminPageMeta = {
  title: "Reports / Moderation",
  description: "Review pending reports and record moderation actions.",
  primaryAction: "Record Moderation Action",
  filters: ["Reason", "Priority", "Status"],
  columns: [
    { key: "target", label: "Reported content" },
    { key: "type", label: "Content type" },
    { key: "reporter", label: "Reporter" },
    { key: "reason", label: "Report reason" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created" }
  ],
  rowActions: ["Review", "Dismiss", "Remove Content", "Warn User", "Suspend User", "Escalate"],
  createFields: [
    { name: "targetId", label: "Target ID" },
    { name: "targetType", label: "Target type", type: "select", options: ["POST", "COMMENT", "USER"] },
    { name: "action", label: "Action", type: "select", options: ["WARN_USER", "REMOVE_CONTENT", "SUSPEND_USER", "BAN_USER", "RESTORE_CONTENT", "ESCALATE"] },
    { name: "reason", label: "Reason", type: "textarea" }
  ],
  emptyTitle: "No reports returned",
  emptyDescription: "There are no pending reports in the moderation queue."
};

export function mapReport(raw: Raw): AdminRecord {
  const values = {
    target: String(raw.targetId ?? "-"),
    type: String(raw.targetType ?? "-"),
    reporter: nestedValue(raw, "user", ["username", "firstName", "email"], String(raw.userId ?? "-")),
    reason: String(raw.reason ?? "-"),
    status: raw.reviewed ? "Reviewed" : "Pending",
    createdAt: dateOf(raw)
  };
  return recordFrom(raw, `${values.type}: ${values.target}`, values, raw.reviewed ? "active" : "pending", String(values.reason));
}

export const analyticsMeta: AdminPageMeta = {
  title: "Analytics",
  description: "Review platform analytics and operational metrics.",
  secondaryActions: ["Export Report", "Change Date Range"],
  filters: ["Module", "Date range"],
  columns: [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
    { key: "source", label: "Source" }
  ],
  rowActions: ["View"],
  emptyTitle: "No analytics returned",
  emptyDescription: "No analytics metrics are available right now."
};

export function mapAnalytics(raw: Raw): AdminRecord {
  const key = String(raw.metric ?? raw.key ?? "metric");
  const values = {
    metric: key,
    value: String(raw.value ?? "-"),
    source: String(raw.source ?? "Analytics")
  };
  return recordFrom(raw, key, values, "active");
}

export const settingsMeta: AdminPageMeta = {
  title: "Settings",
  description: "Manage platform settings when configuration support is available.",
  columns: [
    { key: "setting", label: "Setting" },
    { key: "value", label: "Value" },
    { key: "status", label: "Status" }
  ],
  rowActions: ["View"],
  emptyTitle: "Settings unavailable",
  emptyDescription: "Settings controls are not available yet."
};

export function parseJsonField(value: string | boolean) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function omitEmpty(payload: Record<string, string | boolean>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== ""));
}

export function ratingPayload(payload: Record<string, string | boolean>) {
  const clean: Record<string, unknown> = omitEmpty(payload);
  if (clean.partyId !== undefined) {
    clean.partyId = Number(clean.partyId);
  }
  return clean;
}

export function userPayload(payload: Record<string, string | boolean>) {
  return omitEmpty(payload);
}

export function pollPayload(payload: Record<string, string | boolean>) {
  const clean = omitEmpty(payload);
  return { question: clean.question, options: parseJsonField(clean.options ?? "") };
}

export function pollCreatePayload(payload: Record<string, string | boolean>) {
  const clean = omitEmpty(payload);
  return { discussionId: clean.discussionId, question: clean.question, options: parseJsonField(clean.options ?? "") };
}

export function electionPayload(payload: Record<string, string | boolean>) {
  const clean = omitEmpty(payload);
  return { title: clean.title, description: clean.description, options: parseJsonField(clean.options ?? "") };
}

export function notificationPayload(payload: Record<string, string | boolean>) {
  const clean = omitEmpty(payload);
  return { userId: clean.userId, message: clean.message, data: parseJsonField(clean.data ?? "") };
}

export const roleOptions = roles;
export const stateOptions = states;
export const sharedStatusField = statusField;

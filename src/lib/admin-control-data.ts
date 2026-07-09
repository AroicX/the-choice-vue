import type { UserRole } from "@/types";

export type AdminStatus = "active" | "pending" | "suspended" | "draft" | "archived" | "verified" | "hidden" | "closed" | "open";

export type AdminRecord = {
  id: string;
  title: string;
  subtitle?: string;
  status?: AdminStatus | string;
  role?: UserRole | string;
  createdAt?: string;
  values: Record<string, string | number | boolean | null | undefined>;
  details: { label: string; value: string | number | boolean | null | undefined }[];
};

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "textarea" | "select" | "date" | "file" | "checkbox" | "number";
  options?: string[];
  placeholder?: string;
};

export type AdminResourceConfig = {
  slug: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryActions?: string[];
  filters?: string[];
  bulkActions?: string[];
  columns: { key: string; label: string }[];
  rowActions: string[];
  createFields: AdminField[];
  editFields?: AdminField[];
  records: AdminRecord[];
  emptyTitle: string;
  emptyDescription: string;
};

const roles: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN", "MODERATOR", "JOURNALIST", "POLITICIAN"];
const states = ["Lagos", "Abuja", "Rivers", "Kano", "Kaduna", "Oyo"];
const statuses = ["Active", "Pending", "Suspended", "Draft", "Archived", "Verified"];

function record(id: string, title: string, values: AdminRecord["values"], status: AdminRecord["status"] = "active", subtitle?: string): AdminRecord {
  return {
    id,
    title,
    subtitle,
    status,
    role: typeof values.role === "string" ? values.role : undefined,
    createdAt: String(values.createdAt ?? "2026-07-01"),
    values,
    details: Object.entries(values).map(([label, value]) => ({ label: label.replace(/([A-Z])/g, " $1"), value }))
  };
}

const commonActions = ["View", "Edit", "Delete"];
const statusField: AdminField = { name: "status", label: "Status", type: "select", options: statuses };

export const adminResources: AdminResourceConfig[] = [
  {
    slug: "users",
    title: "Users",
    description: "Manage accounts, verification, roles, suspensions, and user activity.",
    primaryAction: "Add User",
    secondaryActions: ["Export Users", "Filter"],
    filters: ["Role", "State", "Verification", "Status"],
    bulkActions: ["Export Selected", "Suspend Selected", "Delete Selected"],
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
    rowActions: ["View", "Edit", "Suspend", "Unsuspend", "Verify", "Change Role", "Delete"],
    createFields: [
      { name: "firstName", label: "First name" },
      { name: "lastName", label: "Last name" },
      { name: "email", label: "Email", type: "email" },
      { name: "phoneNo", label: "Phone", type: "tel" },
      { name: "role", label: "Role", type: "select", options: roles },
      { name: "state", label: "State", type: "select", options: states },
      { name: "lga", label: "LGA" },
      { name: "password", label: "Password", type: "password" },
      { name: "confirmPassword", label: "Confirm password", type: "password" }
    ],
    editFields: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "state", label: "State", type: "select", options: states },
      { name: "lga", label: "LGA" },
      { name: "role", label: "Role", type: "select", options: roles },
      { name: "verified", label: "Verification status", type: "select", options: ["Verified", "Unverified"] }
    ],
    records: [
      record("usr_001", "Adaora Okeke", { name: "Adaora Okeke", email: "adaora@example.com", phone: "+2348012345678", role: "ADMIN", state: "Lagos", verified: "Verified", accountStatus: "Active", posts: 42, comments: 118, reports: 0, createdAt: "2026-06-14" }, "verified", "adaora@example.com"),
      record("usr_002", "Musa Danladi", { name: "Musa Danladi", email: "musa@example.com", phone: "+2348099911222", role: "USER", state: "Kaduna", verified: "Pending", accountStatus: "Active", posts: 8, comments: 31, reports: 1, createdAt: "2026-06-28" }, "pending", "musa@example.com"),
      record("usr_003", "Teni Balogun", { name: "Teni Balogun", email: "teni@example.com", phone: "+2348077712345", role: "MODERATOR", state: "Oyo", verified: "Verified", accountStatus: "Suspended", posts: 18, comments: 64, reports: 3, createdAt: "2026-05-02" }, "suspended", "teni@example.com")
    ],
    emptyTitle: "No users found",
    emptyDescription: "Try adjusting search, filters, or create a new user."
  },
  {
    slug: "discussions",
    title: "Discussions",
    description: "Manage civic discourse categories and the rooms/posts attached to them.",
    primaryAction: "Create Discussion",
    secondaryActions: ["Export", "Filter"],
    filters: ["Category", "Status"],
    bulkActions: ["Archive Selected", "Export Selected"],
    columns: [
      { key: "title", label: "Title" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
      { key: "posts", label: "Posts" },
      { key: "rooms", label: "Rooms" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["View", "Edit", "Archive", "Activate", "Delete"],
    createFields: [
      { name: "topic", label: "Title" },
      { name: "shortTitle", label: "Short title" },
      { name: "slug", label: "Slug" },
      { name: "question", label: "Question" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category" },
      { name: "coverImage", label: "Cover image", type: "file" },
      { name: "icon", label: "Icon" },
      statusField
    ],
    records: [
      record("dis_001", "Fuel subsidy impact", { title: "Fuel subsidy impact", slug: "fuel-subsidy-impact", description: "Public debate on subsidy removal effects", posts: 482, rooms: 18, status: "Active", createdAt: "2026-06-01" }, "active"),
      record("dis_002", "Education reform", { title: "Education reform", slug: "education-reform", description: "Tracking policy and budget decisions", posts: 231, rooms: 9, status: "Archived", createdAt: "2026-04-19" }, "archived")
    ],
    emptyTitle: "No discussions yet",
    emptyDescription: "Create a discussion category to organize civic conversations."
  },
  {
    slug: "posts",
    title: "Posts",
    description: "Review, create, feature, hide, restore, and remove platform posts.",
    primaryAction: "Create Post",
    secondaryActions: ["Filter by Discussion", "Filter by Status"],
    filters: ["Discussion", "Status", "Reports"],
    bulkActions: ["Delete Selected", "Export Selected"],
    columns: [
      { key: "author", label: "Author" },
      { key: "preview", label: "Content preview" },
      { key: "discussion", label: "Discussion" },
      { key: "likes", label: "Likes" },
      { key: "dislikes", label: "Dislikes" },
      { key: "comments", label: "Comments" },
      { key: "reports", label: "Reports" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["View", "Edit", "Approve", "Hide", "Restore", "Delete", "Feature", "Unfeature"],
    createFields: [
      { name: "discussionsId", label: "Discussion ID" },
      { name: "message", label: "Content", type: "textarea" },
      { name: "attachments", label: "Attached media", type: "file" },
      statusField
    ],
    records: [
      record("pst_001", "Power supply accountability", { author: "Musa Danladi", preview: "The transformer in Kawo has been out for three weeks...", discussion: "Infrastructure", likes: 213, dislikes: 12, comments: 44, reports: 2, status: "Pending", createdAt: "2026-07-03" }, "pending"),
      record("pst_002", "Budget town hall notes", { author: "Adaora Okeke", preview: "Here are the local budget items discussed today...", discussion: "Budget", likes: 98, dislikes: 4, comments: 19, reports: 0, status: "Active", createdAt: "2026-07-01" }, "active")
    ],
    emptyTitle: "No posts found",
    emptyDescription: "No posts match the current query."
  },
  {
    slug: "comments",
    title: "Comments",
    description: "Moderate comment threads, replies, and reported conversation context.",
    primaryAction: "Create Comment",
    secondaryActions: ["Filter"],
    filters: ["Status", "Reports"],
    bulkActions: ["Delete Selected", "Export Selected"],
    columns: [
      { key: "author", label: "Author" },
      { key: "preview", label: "Comment preview" },
      { key: "parentPost", label: "Parent post" },
      { key: "likes", label: "Likes" },
      { key: "reports", label: "Reports" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["View", "Edit", "Hide", "Restore", "Delete"],
    createFields: [
      { name: "postId", label: "Parent post ID" },
      { name: "message", label: "Comment", type: "textarea" }
    ],
    records: [
      record("cmt_001", "Comment by Teni", { author: "Teni Balogun", preview: "Please share the source for this claim.", parentPost: "Power supply accountability", likes: 18, reports: 0, status: "Active", createdAt: "2026-07-04" }, "active")
    ],
    emptyTitle: "No comments found",
    emptyDescription: "Comments will appear here as discussions grow."
  },
  {
    slug: "polls",
    title: "Polls",
    description: "Create polls, manage voting windows, and inspect results.",
    primaryAction: "Create Poll",
    secondaryActions: ["Filter by Status"],
    filters: ["Status", "Discussion"],
    bulkActions: ["Export Selected", "Delete Selected"],
    columns: [
      { key: "question", label: "Question" },
      { key: "discussion", label: "Discussion" },
      { key: "votes", label: "Total votes" },
      { key: "status", label: "Status" },
      { key: "startDate", label: "Start date" },
      { key: "endDate", label: "End date" },
      { key: "createdBy", label: "Created by" }
    ],
    rowActions: ["View Results", "Edit", "Close Poll", "Reopen Poll", "Delete"],
    createFields: [
      { name: "question", label: "Question", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "discussionId", label: "Discussion ID" },
      { name: "pollType", label: "Poll type", type: "select", options: ["Single choice", "Multiple choice"] },
      { name: "options", label: "Options", type: "textarea", placeholder: "One option per line" },
      { name: "multipleChoice", label: "Allow multiple choice", type: "checkbox" },
      { name: "anonymous", label: "Anonymous voting", type: "checkbox" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      statusField
    ],
    records: [
      record("pol_001", "Should LG budgets be published monthly?", { question: "Should LG budgets be published monthly?", discussion: "Budget", votes: 12480, status: "Open", startDate: "2026-07-01", endDate: "2026-07-20", createdBy: "Admin" }, "open")
    ],
    emptyTitle: "No polls yet",
    emptyDescription: "Create a poll to collect structured civic feedback."
  },
  {
    slug: "elections",
    title: "Elections",
    description: "Manage elections, candidates, voting windows, and result review.",
    primaryAction: "Create Election",
    secondaryActions: ["Import Candidates", "Filter by Type", "Filter by Status"],
    filters: ["Type", "Status", "State"],
    bulkActions: ["Export Selected", "Delete Selected"],
    columns: [
      { key: "title", label: "Election title" },
      { key: "type", label: "Election type" },
      { key: "status", label: "Status" },
      { key: "candidates", label: "Candidates" },
      { key: "votes", label: "Votes" },
      { key: "startDate", label: "Start" },
      { key: "endDate", label: "End" }
    ],
    rowActions: ["View", "Edit", "Manage Candidates", "View Results", "Open Election", "Close Election", "Delete"],
    createFields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "type", label: "Election type", type: "select", options: ["Presidential", "Governorship", "Senatorial", "House of Representatives", "House of Assembly", "Local Government"] },
      { name: "state", label: "State", type: "select", options: states },
      { name: "lga", label: "LGA" },
      { name: "constituency", label: "Constituency" },
      { name: "bannerImage", label: "Banner image", type: "file" },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      statusField
    ],
    records: [
      record("ele_001", "2027 Presidential Pulse", { title: "2027 Presidential Pulse", type: "Presidential", status: "Upcoming", candidates: 14, votes: 0, startDate: "2027-01-01", endDate: "2027-02-01" }, "pending")
    ],
    emptyTitle: "No elections configured",
    emptyDescription: "Create an election to manage candidates and voting."
  },
  {
    slug: "ratings",
    title: "Ratings",
    description: "Manage approval ratings, SDG criteria, scorecards, and submissions.",
    primaryAction: "Create Rating Category",
    secondaryActions: ["Manage Criteria", "Export Ratings"],
    filters: ["Position", "Status"],
    bulkActions: ["Export Selected"],
    columns: [
      { key: "politician", label: "Politician/Candidate" },
      { key: "position", label: "Position" },
      { key: "ratings", label: "Total ratings" },
      { key: "average", label: "Average score" },
      { key: "approval", label: "Approval score" },
      { key: "status", label: "Status" }
    ],
    rowActions: ["View Summary", "View Submissions", "Edit Criteria", "Reset Rating"],
    createFields: [
      { name: "criteriaName", label: "Criteria name" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "weight", label: "Weight", type: "number" },
      { name: "positionType", label: "Position type", type: "select", options: ["PRESIDENCY", "GOVERNOR", "SENATOR", "HOUSE"] },
      { name: "active", label: "Active status", type: "checkbox" }
    ],
    records: [
      record("rat_001", "Governor Adebayo", { politician: "Governor Adebayo", position: "Governor", ratings: 8392, average: "4.1/5", approval: "72%", status: "Active" }, "active")
    ],
    emptyTitle: "No ratings found",
    emptyDescription: "Ratings and criteria will appear here."
  },
  {
    slug: "parties",
    title: "Political Parties",
    description: "Manage party profiles, logos, leadership details, and candidates.",
    primaryAction: "Create Party",
    secondaryActions: ["Export"],
    filters: ["Status"],
    bulkActions: ["Export Selected", "Activate Selected", "Delete Selected"],
    columns: [
      { key: "logo", label: "Logo" },
      { key: "name", label: "Name" },
      { key: "acronym", label: "Acronym" },
      { key: "candidates", label: "Candidates" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["View", "Edit", "Deactivate", "Activate", "Delete"],
    createFields: [
      { name: "name", label: "Party name" },
      { name: "acronym", label: "Acronym" },
      { name: "image", label: "Logo", type: "file" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "website", label: "Website" },
      { name: "chairman", label: "Chairman" },
      statusField
    ],
    records: [
      record("pty_001", "Progressive Citizens Party", { logo: "PCP", name: "Progressive Citizens Party", acronym: "PCP", candidates: 43, status: "Active", createdAt: "2026-05-16" }, "active")
    ],
    emptyTitle: "No parties found",
    emptyDescription: "Create party records before assigning candidates."
  },
  {
    slug: "politicians",
    title: "Candidates / Politicians",
    description: "Manage politician profiles, verification, promises, and scorecards.",
    primaryAction: "Add Politician",
    secondaryActions: ["Import CSV", "Filter by Position", "Filter by State", "Filter by Party"],
    filters: ["Position", "State", "Party", "Verification"],
    bulkActions: ["Export Selected", "Delete Selected"],
    columns: [
      { key: "photo", label: "Photo" },
      { key: "name", label: "Name" },
      { key: "party", label: "Party" },
      { key: "position", label: "Position" },
      { key: "state", label: "State" },
      { key: "constituency", label: "Constituency" },
      { key: "verified", label: "Verification" },
      { key: "approval", label: "Approval rating" }
    ],
    rowActions: ["View", "Edit", "Verify", "Unverify", "Manage Promises", "View Scorecard", "Delete"],
    createFields: [
      { name: "name", label: "Full name" },
      { name: "partyId", label: "Party ID" },
      { name: "position", label: "Position", type: "select", options: ["PRESIDENCY", "GOVERNOR", "SENATOR", "HOUSE"] },
      { name: "state", label: "State", type: "select", options: states },
      { name: "lga", label: "LGA" },
      { name: "constituency", label: "Constituency" },
      { name: "biography", label: "Biography", type: "textarea" },
      { name: "imageUrl", label: "Profile image", type: "file" },
      { name: "manifesto", label: "Manifesto", type: "textarea" },
      { name: "termStart", label: "Term start date", type: "date" },
      { name: "termEnd", label: "Term end date", type: "date" },
      { name: "verified", label: "Verification status", type: "checkbox" }
    ],
    records: [
      record("polt_001", "Nkechi Ibrahim", { photo: "NI", name: "Nkechi Ibrahim", party: "PCP", position: "Senator", state: "Lagos", constituency: "Lagos Central", verified: "Verified", approval: "68%" }, "verified")
    ],
    emptyTitle: "No politicians found",
    emptyDescription: "Add politicians or import candidate data."
  },
  {
    slug: "notifications",
    title: "Notifications",
    description: "Create, schedule, and send targeted platform notifications.",
    primaryAction: "Create Notification",
    secondaryActions: ["Send Broadcast", "Filter"],
    filters: ["Audience", "Type", "Sent status"],
    bulkActions: ["Delete Selected", "Export Selected"],
    columns: [
      { key: "title", label: "Title" },
      { key: "preview", label: "Message preview" },
      { key: "audience", label: "Audience" },
      { key: "type", label: "Type" },
      { key: "status", label: "Sent status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["View", "Edit Draft", "Send", "Duplicate", "Delete"],
    createFields: [
      { name: "title", label: "Title" },
      { name: "message", label: "Message", type: "textarea" },
      { name: "type", label: "Type", type: "select", options: ["Announcement", "Moderation", "Election", "Poll", "System"] },
      { name: "audience", label: "Audience", type: "select", options: ["All users", "Specific users", "Users by state", "Users by role", "Users following politician", "Users in discussion"] },
      { name: "targetUsers", label: "Target users" },
      { name: "targetState", label: "Target state", type: "select", options: states },
      { name: "targetRole", label: "Target role", type: "select", options: roles },
      { name: "relatedPost", label: "Related post" },
      { name: "relatedPoll", label: "Related poll" },
      { name: "relatedElection", label: "Related election" },
      { name: "scheduleDate", label: "Schedule date", type: "date" }
    ],
    records: [
      record("not_001", "PVC reminder", { title: "PVC reminder", preview: "Check your polling unit information before...", audience: "All users", type: "Election", status: "Draft", createdAt: "2026-07-05" }, "draft")
    ],
    emptyTitle: "No notifications",
    emptyDescription: "Create a notification draft or broadcast."
  },
  {
    slug: "moderation",
    title: "Reports / Moderation",
    description: "Review reports, remove harmful content, warn users, and escalate cases.",
    primaryAction: "View Queue",
    secondaryActions: ["Assign Moderator", "Filter by Reason", "Filter by Priority"],
    filters: ["Reason", "Priority", "Status"],
    bulkActions: ["Export Selected", "Dismiss Selected"],
    columns: [
      { key: "content", label: "Reported content" },
      { key: "type", label: "Content type" },
      { key: "reporter", label: "Reporter" },
      { key: "reason", label: "Report reason" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Created" }
    ],
    rowActions: ["Review", "Dismiss", "Remove Content", "Warn User", "Suspend User", "Escalate"],
    createFields: [
      { name: "targetId", label: "Target ID" },
      { name: "targetType", label: "Target type", type: "select", options: ["POST", "COMMENT", "USER"] },
      { name: "action", label: "Action", type: "select", options: ["WARN_USER", "REMOVE_CONTENT", "SUSPEND_USER", "BAN_USER", "RESTORE_CONTENT", "ESCALATE"] },
      { name: "reason", label: "Reason", type: "textarea" },
      { name: "notifyUser", label: "Notify user", type: "checkbox" }
    ],
    records: [
      record("rep_001", "Repeated spam links in discussion", { content: "Repeated spam links in discussion", type: "POST", reporter: "Musa Danladi", reason: "SPAM", priority: "High", status: "Pending", createdAt: "2026-07-06" }, "pending")
    ],
    emptyTitle: "No reports in queue",
    emptyDescription: "New user reports will appear here for review."
  },
  {
    slug: "analytics",
    title: "Analytics",
    description: "Monitor user growth, participation, ratings, reports, and civic activity trends.",
    primaryAction: "Export Report",
    secondaryActions: ["Change Date Range", "Filter by State", "Filter by Module"],
    filters: ["State", "Module", "Date range"],
    bulkActions: ["Export Selected"],
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "change", label: "Change" },
      { key: "segment", label: "Segment" },
      { key: "status", label: "Status" }
    ],
    rowActions: ["View Details", "Export", "Pin"],
    createFields: [
      { name: "range", label: "Date range", type: "select", options: ["7 days", "30 days", "90 days", "1 year"] },
      { name: "state", label: "State", type: "select", options: states },
      { name: "module", label: "Module", type: "select", options: ["Users", "Posts", "Polls", "Elections", "Ratings", "Reports"] }
    ],
    records: [
      record("ana_001", "Daily active users", { metric: "Daily active users", value: "18,420", change: "+12.4%", segment: "All states", status: "Healthy" }, "active"),
      record("ana_002", "Reports trend", { metric: "Reports trend", value: "82", change: "-4.8%", segment: "Moderation", status: "Stable" }, "active")
    ],
    emptyTitle: "No analytics available",
    emptyDescription: "Analytics data will appear when the API returns metrics."
  },
  {
    slug: "settings",
    title: "Settings",
    description: "Configure platform, security, roles, permissions, and feature flags.",
    primaryAction: "Save Settings",
    secondaryActions: ["Reset Changes"],
    filters: ["Section"],
    bulkActions: [],
    columns: [
      { key: "section", label: "Section" },
      { key: "setting", label: "Setting" },
      { key: "value", label: "Value" },
      { key: "status", label: "Status" }
    ],
    rowActions: ["View", "Edit", "Reset"],
    createFields: [
      { name: "platformName", label: "Platform name" },
      { name: "logo", label: "Logo", type: "file" },
      { name: "supportEmail", label: "Support email", type: "email" },
      { name: "defaultLanguage", label: "Default language", type: "select", options: ["English", "Hausa", "Yoruba", "Igbo"] },
      { name: "sessionTimeout", label: "Session timeout", type: "number" },
      { name: "enablePolls", label: "Enable polls", type: "checkbox" },
      { name: "enableElections", label: "Enable elections", type: "checkbox" },
      { name: "enableRatings", label: "Enable ratings", type: "checkbox" },
      { name: "enableAiModeration", label: "Enable AI moderation", type: "checkbox" }
    ],
    records: [
      record("set_001", "General settings", { section: "General", setting: "Platform name", value: "TheChoice9ja", status: "Active" }, "active"),
      record("set_002", "Feature flags", { section: "Feature Flags", setting: "AI moderation", value: "Enabled", status: "Active" }, "active")
    ],
    emptyTitle: "No settings found",
    emptyDescription: "Settings will appear here when configuration endpoints are available."
  }
];

export const adminNav = [
  { href: "/control", label: "Dashboard" },
  ...adminResources.map((resource) => ({ href: `/control/${resource.slug}`, label: resource.title }))
];

export function getAdminResource(slug: string) {
  return adminResources.find((resource) => resource.slug === slug);
}

export const dashboardStats = [
  { label: "Total users", value: "24,892", change: "+8.4%", period: "last 30 days", href: "/control/users" },
  { label: "Active users", value: "18,420", change: "+12.1%", period: "last 7 days", href: "/control/users" },
  { label: "Total posts", value: "51,203", change: "+6.8%", period: "last 30 days", href: "/control/posts" },
  { label: "Total comments", value: "188,904", change: "+9.3%", period: "last 30 days", href: "/control/comments" },
  { label: "Total polls", value: "612", change: "+3.1%", period: "this quarter", href: "/control/polls" },
  { label: "Total elections", value: "24", change: "+2", period: "configured", href: "/control/elections" },
  { label: "Discussions", value: "142", change: "+5.6%", period: "active", href: "/control/discussions" },
  { label: "Ratings", value: "87,450", change: "+14.8%", period: "submitted", href: "/control/ratings" },
  { label: "Pending reports", value: "82", change: "-4.8%", period: "needs review", href: "/control/moderation" },
  { label: "Suspended users", value: "119", change: "+7", period: "current", href: "/control/users" }
];

export const recentActivity = [
  { type: "New user", title: "Musa Danladi joined from Kaduna", time: "12 min ago", target: "users" },
  { type: "New post", title: "Budget town hall notes posted", time: "23 min ago", target: "posts" },
  { type: "New report", title: "Spam report submitted on a post", time: "35 min ago", target: "moderation" },
  { type: "Poll vote", title: "124 new votes on LG budget poll", time: "1 hr ago", target: "polls" },
  { type: "Election vote", title: "Election pulse received 312 votes", time: "2 hrs ago", target: "elections" },
  { type: "Rating", title: "Governor Adebayo received 44 ratings", time: "3 hrs ago", target: "ratings" }
];

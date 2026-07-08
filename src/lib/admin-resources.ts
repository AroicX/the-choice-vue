import { endpoints } from "@/services/client/endpoints";

export type AdminResource = {
  key: string;
  label: string;
  list: string;
  create?: string;
  update?: (id: string) => string;
  delete?: (id: string) => string;
  sample: Record<string, unknown>;
};

export const adminResources: AdminResource[] = [
  {
    key: "users",
    label: "Users",
    list: endpoints.admin.users,
    update: endpoints.admin.suspendUser,
    sample: { suspended: true }
  },
  {
    key: "politicians",
    label: "Politicians",
    list: endpoints.politicians.list,
    create: endpoints.politicians.create,
    update: endpoints.politicians.update,
    delete: endpoints.politicians.delete,
    sample: { name: "Peter Obi", slug: "peter-obi", partyId: "uuid", position: "PRESIDENCY", state: "Anambra" }
  },
  {
    key: "parties",
    label: "Parties",
    list: endpoints.parties.list,
    create: endpoints.parties.create,
    update: endpoints.parties.update,
    delete: endpoints.parties.delete,
    sample: { name: "All Progressives Congress", slug: "apc", acronym: "APC" }
  },
  {
    key: "issues",
    label: "Issues",
    list: endpoints.issues.list,
    create: endpoints.issues.create,
    update: endpoints.issues.update,
    delete: endpoints.issues.delete,
    sample: { title: "Bad road in Ikeja", description: "Road has been unmaintained", type: "LOCAL", category: "Infrastructure", state: "Lagos" }
  },
  {
    key: "posts",
    label: "Posts",
    list: endpoints.posts.list,
    create: endpoints.posts.create,
    delete: endpoints.posts.delete,
    sample: { discussionsId: "uuid", message: "My thoughts on the economy", attachments: {} }
  },
  {
    key: "discussions",
    label: "Discussions",
    list: endpoints.discussions.list,
    create: endpoints.discussions.create,
    update: endpoints.discussions.update,
    delete: endpoints.discussions.delete,
    sample: { topic: "Education", question: "Is the education system in crisis?", description: "Discussion about education reform" }
  },
  {
    key: "polls",
    label: "Polls",
    list: endpoints.polls.list,
    update: endpoints.polls.update,
    delete: endpoints.polls.delete,
    sample: { question: "Who is best for Minister of Finance?", options: { option1: { text: "Candidate A", value: 0 } } }
  },
  {
    key: "elections",
    label: "Elections",
    list: endpoints.elections.list,
    create: endpoints.elections.create,
    update: endpoints.elections.update,
    delete: endpoints.elections.delete,
    sample: { title: "Presidential Election", description: "2027 candidates", options: { option1: { text: "Candidate A", value: 0 } } }
  },
  {
    key: "ratings",
    label: "Ratings",
    list: endpoints.ratings.list,
    create: endpoints.ratings.create,
    delete: endpoints.ratings.delete,
    sample: { candidateId: "uuid", category: "ECONOMY", score: 4 }
  },
  {
    key: "promises",
    label: "Campaign Promises",
    list: endpoints.promises.list,
    create: endpoints.promises.create,
    update: endpoints.promises.update,
    delete: endpoints.promises.delete,
    sample: { politicianId: "uuid", title: "Build 100 schools", description: "Education promise" }
  },
  {
    key: "news",
    label: "News",
    list: endpoints.news.list,
    create: endpoints.news.create,
    update: endpoints.news.update,
    delete: endpoints.news.delete,
    sample: { title: "Senate passes new bill", content: "Full article text", source: "Premium Times", sourceUrl: "https://example.com" }
  },
  {
    key: "fact-checks",
    label: "Fact Checks",
    list: endpoints.factChecks.list,
    create: endpoints.factChecks.create,
    update: endpoints.factChecks.update,
    delete: endpoints.factChecks.delete,
    sample: { claim: "Statement being fact-checked", verdict: "UNVERIFIED", explanation: "Supporting evidence" }
  },
  {
    key: "topics",
    label: "Topics",
    list: endpoints.topics.list,
    create: endpoints.topics.create,
    update: endpoints.topics.update,
    delete: endpoints.topics.delete,
    sample: { name: "Economy", slug: "economy", description: "Economic policy and finance" }
  },
  {
    key: "communities",
    label: "Communities",
    list: endpoints.communities.list,
    create: endpoints.communities.create,
    update: endpoints.communities.update,
    delete: endpoints.communities.delete,
    sample: { name: "Lagos Civic Forum", slug: "lagos-civic", type: "STATE", description: "Community for Lagos residents", state: "Lagos" }
  },
  {
    key: "notifications",
    label: "Notifications",
    list: endpoints.notifications.byUser(":user_id"),
    create: endpoints.notifications.create,
    update: endpoints.notifications.markRead,
    delete: endpoints.notifications.delete,
    sample: { userId: "uuid", message: "Your post received a new comment", data: {} }
  },
  {
    key: "reports",
    label: "Reports",
    list: endpoints.moderation.reports,
    create: endpoints.reports.create,
    sample: { targetId: "uuid", targetType: "POST", reason: "MISINFORMATION", description: "Needs review" }
  },
  {
    key: "moderation",
    label: "Moderation",
    list: endpoints.moderation.reports,
    create: endpoints.moderation.action,
    sample: { reportId: "uuid", action: "WARN", note: "Reviewed by admin" }
  },
  {
    key: "analytics",
    label: "Analytics",
    list: endpoints.analytics.dashboard,
    sample: {}
  },
  {
    key: "settings",
    label: "Settings",
    list: endpoints.countries.multiRegion,
    sample: { platformName: "Choice9ja" }
  }
];

export function getAdminResource(key: string) {
  return adminResources.find((resource) => resource.key === key);
}

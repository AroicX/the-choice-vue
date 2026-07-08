import type { Issue, Politician, Poll, Post } from "@/types";

export const posts: Post[] = [
  {
    id: "post-1",
    author: "Aisha Bello",
    handle: "@aishacivic",
    topic: "Economy",
    message: "Fuel pricing, food inflation, and transport costs should be tracked together. People feel policy through the market basket first.",
    likes: 482,
    comments: 91,
    shares: 35,
    badge: "Citizen insight"
  },
  {
    id: "post-2",
    author: "Tunde Adeyemi",
    handle: "@lagoswatch",
    topic: "Infrastructure",
    message: "The Lekki drainage petition crossed 4,000 signatures. Residents want a public timeline and budget disclosure.",
    likes: 326,
    comments: 44,
    shares: 19,
    badge: "Issue update"
  },
  {
    id: "post-3",
    author: "Choice9ja Desk",
    handle: "@choice9ja",
    topic: "Governance",
    message: "Three governors improved public procurement publication this quarter. Compare transparency scores in the ratings hub.",
    likes: 618,
    comments: 72,
    shares: 84,
    badge: "Data brief"
  }
];

export const issues: Issue[] = [
  {
    id: "issue-1",
    title: "Bad road in Ikeja industrial corridor",
    description: "Commuters and small businesses report heavy losses from damaged road access.",
    location: "Ikeja, Lagos",
    category: "Infrastructure",
    status: "IN_PROGRESS",
    upvotes: 3120,
    comments: 184,
    priority: "High"
  },
  {
    id: "issue-2",
    title: "Primary healthcare centre lacks night staff",
    description: "Residents say emergency cases are redirected after 7pm.",
    location: "Nsukka, Enugu",
    category: "Healthcare",
    status: "UNDER_REVIEW",
    upvotes: 1460,
    comments: 63,
    priority: "Medium"
  },
  {
    id: "issue-3",
    title: "School roof repair abandoned",
    description: "Community photos show open classrooms during rainy season.",
    location: "Kano Municipal, Kano",
    category: "Education",
    status: "OPEN",
    upvotes: 2088,
    comments: 97,
    priority: "High"
  }
];

export const politicians: Politician[] = [
  {
    id: "pol-1",
    name: "Amara Okonkwo",
    party: "LP",
    position: "Governor",
    state: "Anambra",
    approvalScore: 74,
    performanceScore: 69,
    verified: true
  },
  {
    id: "pol-2",
    name: "Musa Danladi",
    party: "APC",
    position: "Senator",
    state: "Kaduna",
    approvalScore: 61,
    performanceScore: 58,
    verified: true
  },
  {
    id: "pol-3",
    name: "Kemi Johnson",
    party: "PDP",
    position: "House of Representatives",
    state: "Oyo",
    approvalScore: 67,
    performanceScore: 64,
    verified: false
  }
];

export const polls: Poll[] = [
  {
    id: "poll-1",
    question: "Which issue should your state assembly prioritize this quarter?",
    votes: 12840,
    expiresIn: "2 days",
    options: [
      { label: "Healthcare access", value: 34 },
      { label: "Road maintenance", value: 42 },
      { label: "School funding", value: 24 }
    ]
  },
  {
    id: "poll-2",
    question: "Should campaign promise trackers be mandatory for elected officials?",
    votes: 9241,
    expiresIn: "6 hours",
    options: [
      { label: "Yes", value: 81 },
      { label: "No", value: 9 },
      { label: "Not sure", value: 10 }
    ]
  }
];

export const discourseRooms = [
  { id: "economy", title: "Economy Watch", category: "National", posts: 2840, members: 19400, active: "8 min ago" },
  { id: "security", title: "Security and Safety", category: "National", posts: 1930, members: 12100, active: "21 min ago" },
  { id: "lagos", title: "Lagos Local Issues", category: "State", posts: 4210, members: 24800, active: "3 min ago" },
  { id: "education", title: "Education Reform", category: "Policy", posts: 1184, members: 8300, active: "1 hr ago" }
];

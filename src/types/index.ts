export type UserRole =
  | "USER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "MODERATOR"
  | "JOURNALIST"
  | "VERIFIED_ORG"
  | "POLITICIAN";

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  role: UserRole;
  state?: string;
  profilePic?: string;
  reputationScore?: number;
};

export type Post = {
  id: string;
  author: string;
  handle: string;
  topic: string;
  message: string;
  likes: number;
  dislikes?: number;
  comments: number;
  shares: number;
  badge?: string;
  discussionId?: string;
  createdAt?: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: "OPEN" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "ARCHIVED";
  upvotes: number;
  comments: number;
  priority: "Low" | "Medium" | "High";
};

export type Politician = {
  id: string;
  name: string;
  party: string;
  position: string;
  state: string;
  approvalScore: number;
  performanceScore: number;
  verified: boolean;
};

export type Poll = {
  id: string;
  question: string;
  votes: number;
  expiresIn: string;
  options: { label: string; key?: string; value: number; rawValue?: number }[];
};

export type ApiRecord = Record<string, unknown> & {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  topic?: string;
  question?: string;
  description?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
};

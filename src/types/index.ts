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
  lga?: string;
  ward?: string;
  constituency?: string;
  profilePic?: string;
  reputationScore?: number;
  about?: string;
  phone?: string;
  verified?: boolean;
  verifiedPhone?: boolean;
  interests?: string[];
  createdAt?: string;
  posts?: ApiRecord[];
};

export type FollowRecord = {
  id?: string;
  targetId: string;
  targetType: "POLITICIAN" | "USER" | "TOPIC";
  createdAt?: string;
};

export type RoomRecord = {
  id: string;
  userId?: string;
  discussionsId?: string;
  discussions?: {
    id?: string;
    topic?: string;
    polls?: unknown[];
  };
};

export type UserReaction = "like" | "dislike";

export type MediaKind = "image" | "video";

export type MediaAttachment = {
  id?: string;
  url: string;
  type: MediaKind;
  mimeType?: string;
  size?: number;
};

export type MediaAttachments = {
  items: MediaAttachment[];
};

export type Post = {
  id: string;
  user?: User;
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
  userReaction?: UserReaction | null;
  attachments?: MediaAttachment[];
  _count?: {
    comments: number;
  };
};

export type Politician = {
  id: string;
  name: string;
  party: string;
  partyImage?: string;
  position: string;
  state: string;
  lga?: string;
  constituency?: string;
  biography?: string;
  manifesto?: string;
  imageUrl?: string;
  slug?: string;
  approvalScore: number;
  performanceScore: number;
  verified: boolean;
  termStart?: string;
  termEnd?: string;
  promiseCount?: number;
  issueCount?: number;
  ratingCount?: number;
};

export type Scorecard = {
  approvalRating: number;
  performanceScore: number;
  promiseDeliveryRate: number;
  publicSentiment: number;
  issueResponseRate: number;
  factCheckScore: number;
  transparencyScore: number;
};

export type FactCheck = {
  id: string;
  claim: string;
  verdict: string;
  explanation: string;
  sources: string[];
  relatedPoliticianIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Community = {
  id: string;
  name: string;
  slug?: string;
  type: string;
  description: string;
  state?: string;
  lga?: string;
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
  type?: string;
  evidencePhotos?: string[];
  evidenceDocuments?: string[];
  aiSummary?: string;
  politicianId?: string;
  politicianName?: string;
  politicianImage?: string;
  createdByName?: string;
  createdAt?: string;
};

export type VoteOption = {
  label: string;
  key: string;
  value: number;
  rawValue?: number;
  image?: string;
};

export type Poll = {
  id: string;
  question: string;
  votes: number;
  expiresIn: string;
  options: VoteOption[];
  hasVoted?: boolean;
  userOption?: string | null;
};

export type Election = {
  id: string;
  title: string;
  description?: string;
  status: string;
  type?: string;
  votes: number;
  options: VoteOption[];
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  hasVoted?: boolean;
  userOption?: string | null;
};

export type RatingCandidate = {
  id: string;
  name: string;
  image?: string;
  position: string;
  party?: string;
  partyImage?: string;
  state?: string;
  score: number;
  politicianId?: string;
  education?: string;
  profession?: string;
  constituency?: string;
  hasRated?: boolean;
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

import type { UserRole } from "@/types";

export type AdminStatus = "active" | "pending" | "suspended" | "draft" | "archived" | "verified" | "hidden" | "closed" | "open";

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "textarea" | "select" | "date" | "file" | "checkbox" | "number";
  options?: string[];
  placeholder?: string;
};

export type AdminRecord = {
  id: string;
  title: string;
  subtitle?: string;
  status?: AdminStatus | string;
  role?: UserRole | string;
  createdAt?: string;
  values: Record<string, string | number | boolean | null | undefined>;
  details: { label: string; value: string | number | boolean | null | undefined }[];
  raw?: unknown;
};

export type AdminColumn = {
  key: string;
  label: string;
};

export type AdminPageMeta = {
  title: string;
  description: string;
  primaryAction?: string;
  secondaryActions?: string[];
  filters?: string[];
  bulkActions?: string[];
  columns: AdminColumn[];
  rowActions: string[];
  createFields?: AdminField[];
  editFields?: AdminField[];
  emptyTitle: string;
  emptyDescription: string;
};

export const adminNav = [
  { href: "/control", label: "Dashboard" },
  { href: "/control/users", label: "Users" },
  { href: "/control/discussions", label: "Discussions" },
  { href: "/control/posts", label: "Posts" },
  { href: "/control/comments", label: "Comments" },
  { href: "/control/polls", label: "Polls" },
  { href: "/control/elections", label: "Elections" },
  { href: "/control/ratings", label: "Ratings" },
  { href: "/control/parties", label: "Political Parties" },
  { href: "/control/politicians", label: "Candidates / Politicians" },
  { href: "/control/notifications", label: "Notifications" },
  { href: "/control/moderation", label: "Reports / Moderation" },
  { href: "/control/analytics", label: "Analytics" },
  { href: "/control/settings", label: "Settings" }
];

export const roles: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN", "MODERATOR", "JOURNALIST", "POLITICIAN"];
export const states = ["Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
export const statuses = ["Active", "Pending", "Suspended", "Draft", "Archived", "Verified"];
export const statusField: AdminField = { name: "status", label: "Status", type: "select", options: statuses };

export function detailsFrom(values: AdminRecord["values"]) {
  return Object.entries(values).map(([label, value]) => ({
    label: label.replace(/([A-Z])/g, " $1"),
    value
  }));
}

export function valueFrom(record: Record<string, unknown>, keys: string[], fallback: string | number | boolean | null = "-") {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") return value as string | number | boolean;
  }
  return fallback;
}

export function nestedValue(record: Record<string, unknown>, key: string, nestedKeys: string[], fallback = "-") {
  const nested = record[key];
  if (!nested || typeof nested !== "object") return fallback;
  return String(valueFrom(nested as Record<string, unknown>, nestedKeys, fallback));
}

import {
  BarChart3,
  Bell,
  Building2,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  Home,
  Landmark,
  Megaphone,
  MessageSquareText,
  Newspaper,
  ShieldCheck,
  Vote
} from "lucide-react";

export const mainNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Megaphone },
  { href: "/discourse", label: "Discourse", icon: MessageSquareText },
  { href: "/issues", label: "Issues", icon: ClipboardCheck },
  { href: "/politicians", label: "Politicians", icon: Landmark },
  { href: "/ratings", label: "Ratings", icon: BarChart3 },
  { href: "/elections", label: "Elections", icon: Vote },
  { href: "/polls", label: "Polls", icon: Compass },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/fact-checks", label: "Fact Checks", icon: ShieldCheck },
  { href: "/communities", label: "Communities", icon: Building2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: CircleUserRound }
];

export const mobileNav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/discourse", label: "Discourse", icon: MessageSquareText },
  { href: "/issues", label: "Issues", icon: ClipboardCheck },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/ratings", label: "Ratings", icon: BarChart3 }
];

export const controlNav = [
  "Dashboard",
  "Users",
  "Politicians",
  "Parties",
  "Issues",
  "Posts",
  "Discussions",
  "Polls",
  "Elections",
  "Ratings",
  "Promises",
  "Reports",
  "Moderation",
  "News",
  "Fact Checks",
  "Topics",
  "Communities",
  "Analytics",
  "Notifications",
  "Settings"
].map((label) => ({
  label,
  href: `/control/${label.toLowerCase().replaceAll(" ", "-")}`
}));

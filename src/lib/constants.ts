import {
  Analytics01Icon,
  Building01Icon,
  CheckListIcon,
  GavelIcon,
  Home01Icon,
  LandmarkIcon,
  Megaphone01Icon,
  Message01Icon,
  News01Icon,
  Notification03Icon,
  SecurityCheckIcon,
  Task01Icon,
  UserCircleIcon
} from "@/lib/icons";

export const mainNav = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/feed", label: "Feed", icon: Megaphone01Icon },
  { href: "/discourse", label: "Discourse", icon: Message01Icon },
  { href: "/issues", label: "Issues", icon: Task01Icon },
  { href: "/politicians", label: "Politicians", icon: LandmarkIcon },
  { href: "/ratings", label: "Ratings", icon: Analytics01Icon },
  { href: "/elections", label: "Elections", icon: GavelIcon },
  { href: "/polls", label: "Polls", icon: CheckListIcon },
  { href: "/news", label: "News", icon: News01Icon },
  { href: "/fact-checks", label: "Fact Checks", icon: SecurityCheckIcon },
  { href: "/communities", label: "Communities", icon: Building01Icon },
  { href: "/notifications", label: "Notifications", icon: Notification03Icon },
  { href: "/profile", label: "Account", icon: UserCircleIcon }
];

export const mobileNav = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/discourse", label: "Discourse", icon: Message01Icon },
  { href: "/issues", label: "Issues", icon: Task01Icon },
  { href: "/notifications", label: "Alerts", icon: Notification03Icon },
  { href: "/ratings", label: "Ratings", icon: Analytics01Icon }
];

export const controlNav = [
  { label: "Dashboard", href: "/control" },
  { label: "Users", href: "/control/users" },
  { label: "Discussions", href: "/control/discussions" },
  { label: "Posts", href: "/control/posts" },
  { label: "Polls", href: "/control/polls" },
  { label: "Elections", href: "/control/elections" },
  { label: "Ratings", href: "/control/ratings" },
  { label: "Political Parties", href: "/control/parties" },
  { label: "Candidates / Politicians", href: "/control/politicians" },
  { label: "Issues", href: "/control/issues" },
  { label: "Fact Checks", href: "/control/fact-checks" },
  { label: "Communities", href: "/control/communities" },
  { label: "Notifications", href: "/control/notifications" },
  { label: "Reports / Moderation", href: "/control/moderation" },
  { label: "Analytics", href: "/control/analytics" },
  { label: "Settings", href: "/control/settings" }
];

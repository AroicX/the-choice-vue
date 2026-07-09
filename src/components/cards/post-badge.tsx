import { useMemo } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide", {
    variants: {
        variant: {
            featured: "bg-gradient-to-br from-primary/20 to-emerald-500/10 text-primary ring-1 ring-primary/20",
            verified: "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-200 dark:ring-green-800/40",
            official: "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800/40",
            news: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:ring-yellow-800/40",
            event: "bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:ring-purple-800/40",
            poll: "bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800/40",
            "fact check": "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-200 dark:ring-green-800/40",
            opinion: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:ring-yellow-800/40",
            question: "bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:ring-purple-800/40",
            debate: "bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800/40",
            discussion: "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-200 dark:ring-green-800/40",
            report: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:ring-yellow-800/40",
            analysis: "bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:ring-purple-800/40",
            comment: "bg-red-100 text-red-800 ring-1 ring-red-200 dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800/40",
            suggestion: "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-200 dark:ring-green-800/40",
            idea: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:ring-yellow-800/40",
            default: "bg-gray-100 text-gray-800 ring-1 ring-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:ring-gray-800/40",
        },
        defaultVariants: {
            variant: "default"
        }
    }
});
export function PostBadge({ badge }: { badge: string | undefined }) {
    const badgeVariant = useMemo(() => {
        if (!badge) return "default";
        switch (badge.toLowerCase()) {
            case "featured":
                return "featured";
            case "verified":
                return "verified";
            case "official":
                return "official";
            case "news":
                return "news";
            case "event":
                return "event";
            case "poll":
                return "poll";
            case "fact check":
                return "fact check";
            case "opinion":
                return "opinion";
            case "question":
                return "question";
            case "debate":
                return "debate";
            case "discussion":
                return "discussion";
            case "report":
                return "report";
            case "analysis":
                return "analysis";
            case "comment":
                return "comment";
            case "suggestion":
                return "suggestion";
            case "idea":
                return "idea";
            default:
                return "default";
        }
    }, [badge]);
    const badgeText = useMemo(() => {
        return String(badge).replace(/_/g, " ").trim();
    }, [badge]);
    return (
        <div className={cn(badgeVariants({ variant: badgeVariant }), "text-xs font-semibold tracking-wide")}>{badgeText}</div>
    );
}
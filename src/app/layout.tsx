import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "goey-toast/styles.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { LoginModal } from "@/components/auth/login-modal";
import { CommentModal } from "@/components/comments/comment-modal";
import { ShareModal } from "@/components/share/share-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://thechoice9ja.com"),
  title: "Choice9ja",
  description:
    "Choice9ja provides a platform for Nigerian citizens to increase transparency, strengthen participatory governance, and ensure accountability of leaders.",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png"
  },
  openGraph: {
    title: "Choice9ja",
    description:
      "Raise issues, join civic discussions, track leaders, and rate politicians according to their actions.",
    images: ["/icon.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <LoginModal />
            <CommentModal />
            <ShareModal />
          </QueryProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

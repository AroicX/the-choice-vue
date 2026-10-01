import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import "goey-toast/styles.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ConnectionSnackbar } from "@/components/providers/connection-snackbar";
import { ToastProvider } from "@/components/providers/toast-provider";
import { LoginModal } from "@/components/auth/login-modal";
import { ShareModal } from "@/components/share/share-modal";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://thechoice9ja.com"),
  title: { default: "Choice9ja", template: "%s" },
  description:
    "Know your leaders. Track their performance. Rate politicians, report local issues and join civic conversations in Nigeria.",
  applicationName: "Choice9ja",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png"
  },
  // Page-level metadata overrides these; the image comes from app/opengraph-image.tsx.
  openGraph: {
    siteName: "Choice9ja",
    type: "website",
    locale: "en_NG",
    title: "Choice9ja",
    description: "Rate politicians, report local issues and join civic conversations in Nigeria."
  },
  twitter: {
    card: "summary_large_image",
    title: "Choice9ja",
    description: "Rate politicians, report local issues and join civic conversations in Nigeria."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MotionProvider>
          <QueryProvider>
            {children}
            <LoginModal />
            <ShareModal />
            <ConnectionSnackbar />
          </QueryProvider>
          </MotionProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

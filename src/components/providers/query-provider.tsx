"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { usePostReactionStore } from "@/stores/post-reaction-store";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  // Cached responses carry per-user state (profile, notifications, likes,
  // "already rated"...). When the signed-in user changes - logout from any of
  // the several places that call clearSession, a 401, or a different account
  // signing in - drop it all so the next person on a shared device never sees
  // the previous one's data.
  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        // The first rehydration from storage is not a user change.
        if (!prev.hasHydrated) return;
        if ((state.user?.id ?? null) === (prev.user?.id ?? null)) return;

        queryClient.getMutationCache().clear();
        queryClient.removeQueries({ type: "inactive" });
        queryClient.resetQueries({ type: "active" });
        usePostReactionStore.setState({ reactions: {} });
      }),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

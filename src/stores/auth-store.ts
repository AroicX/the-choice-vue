"use client";

import type { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (payload: { token: string; user: User }) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setSession: ({ token, user }) => {
        if (typeof document !== "undefined") {
          document.cookie = `choice9ja-role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ token, user, isAuthenticated: true });
      },
      clearSession: () => {
        if (typeof document !== "undefined") {
          document.cookie = "choice9ja-role=; path=/; max-age=0; SameSite=Lax";
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: "choice9ja-auth",
      onRehydrateStorage: () => (state) => {
        if (typeof document !== "undefined" && state?.user?.role && state.isAuthenticated) {
          document.cookie = `choice9ja-role=${state.user.role}; path=/; max-age=604800; SameSite=Lax`;
        }
        state?.setHasHydrated(true);
      }
    }
  )
);

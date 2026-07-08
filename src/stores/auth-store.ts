"use client";

import type { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (payload: { token: string; user: User }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ token, user }) => set({ token, user, isAuthenticated: true }),
      clearSession: () => set({ token: null, user: null, isAuthenticated: false })
    }),
    {
      name: "choice9ja-auth"
    }
  )
);

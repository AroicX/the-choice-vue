"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useLoginModalStore } from "@/stores/login-modal-store";

export function useRequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginModalStore((state) => state.open);

  const requireAuth = useCallback(
    (message?: string) => {
      if (isAuthenticated) return true;
      openLoginModal(message ?? "Sign in to continue.");
      return false;
    },
    [isAuthenticated, openLoginModal]
  );

  return { isAuthenticated, requireAuth };
}

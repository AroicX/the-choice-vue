"use client";

import { create } from "zustand";

type LoginModalState = {
  isOpen: boolean;
  message: string | null;
  open: (message?: string) => void;
  close: () => void;
};

export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  message: null,
  open: (message) => set({ isOpen: true, message: message ?? null }),
  close: () => set({ isOpen: false, message: null })
}));

"use client";

import { create } from "zustand";
import type { Post } from "@/types";

type CommentModalState = {
  isOpen: boolean;
  post: Post | null;
  open: (post: Post) => void;
  close: () => void;
};

export const useCommentModalStore = create<CommentModalState>((set) => ({
  isOpen: false,
  post: null,
  open: (post) => set({ isOpen: true, post }),
  close: () => set({ isOpen: false, post: null })
}));

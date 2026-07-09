"use client";

import { create } from "zustand";
import type { Post } from "@/types";

export type ShareQuotedPost = Pick<Post, "author" | "handle" | "topic" | "message">;

export type SharePayload = {
  type: "post" | "comment";
  url: string;
  author: string;
  handle?: string;
  message: string;
  topic?: string;
  quotedPost?: ShareQuotedPost;
};

type ShareModalState = {
  isOpen: boolean;
  payload: SharePayload | null;
  open: (payload: SharePayload) => void;
  close: () => void;
};

export const useShareModalStore = create<ShareModalState>((set) => ({
  isOpen: false,
  payload: null,
  open: (payload) => set({ isOpen: true, payload }),
  close: () => set({ isOpen: false, payload: null })
}));

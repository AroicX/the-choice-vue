"use client";

import { create } from "zustand";
import type { MediaAttachment, Post } from "@/types";

export type ShareQuotedPost = Pick<Post, "author" | "handle" | "topic" | "message"> & {
  attachments?: MediaAttachment[];
};

export type SharePayload = {
  type: "post" | "comment" | "election";
  url: string;
  author: string;
  handle?: string;
  authorAvatar?: string;
  message: string;
  topic?: string;
  attachments?: MediaAttachment[];
  quotedPost?: ShareQuotedPost;
  /** Elections: status line (e.g. "Voting now") and candidates for the card. */
  status?: string;
  candidates?: Array<{ label: string; image?: string }>;
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

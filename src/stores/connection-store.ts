"use client";

import { create } from "zustand";

/**
 * online      - all good, nothing shown
 * offline     - the browser reports no network
 * unreachable - online, but the API isn't answering (dropped request, 502-504)
 * restored    - just recovered; shown briefly, then back to online
 */
export type ConnectionStatus = "online" | "offline" | "unreachable" | "restored";

type ConnectionState = {
  status: ConnectionStatus;
  setOffline: () => void;
  reportUnreachable: () => void;
  reportReachable: () => void;
  settle: () => void;
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "online",
  setOffline: () => set({ status: "offline" }),
  // Offline wins: an unreachable API is expected while there's no network.
  reportUnreachable: () => {
    if (get().status !== "offline") set({ status: "unreachable" });
  },
  reportReachable: () => {
    const { status } = get();
    if (status === "offline" || status === "unreachable") set({ status: "restored" });
  },
  settle: () => {
    if (get().status === "restored") set({ status: "online" });
  }
}));

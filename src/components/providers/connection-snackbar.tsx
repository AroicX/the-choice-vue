"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onlineManager, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/client/api";
import { useConnectionStore } from "@/stores/connection-store";
import { cn } from "@/lib/utils";

/** Seconds before each automatic reconnect attempt. After these run out,
 *  retrying is manual: endless countdowns read as nagging, not helping. */
const BACKOFF = [3, 6];
const PROBE_TIMEOUT_MS = 6_000;
const RESTORED_VISIBLE_MS = 2_500;

/** Cheap reachability check against the API root. Any non-5xx answer counts. */
async function probeApi() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(String(api.defaults.baseURL ?? ""), { cache: "no-store", signal: controller.signal });
    return response.status < 500;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Bottom-centre status pill for connectivity, in the style social apps use:
 * "You're offline", "Can't reach Choice9ja · Retrying in 5s", "Back online".
 * Rendered once, at the root. Retries on a backoff while the API is
 * unreachable and refetches visible data once it's back.
 */
export function ConnectionSnackbar() {
  const queryClient = useQueryClient();
  const status = useConnectionStore((state) => state.status);
  const [attempt, setAttempt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BACKOFF[0]);
  const [checking, setChecking] = useState(false);
  const previous = useRef(status);

  // Browser network events.
  useEffect(() => {
    const store = useConnectionStore.getState();
    if (!navigator.onLine) store.setOffline();
    const goOffline = () => useConnectionStore.getState().setOffline();
    // Coming back online doesn't prove the API is reachable: verify first.
    const goOnline = () => {
      void probeApi().then((ok) => {
        const connection = useConnectionStore.getState();
        if (ok) connection.reportReachable();
        else useConnectionStore.setState({ status: "unreachable" });
      });
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const retryNow = useCallback(async () => {
    setChecking(true);
    const ok = await probeApi();
    setChecking(false);
    if (ok) {
      useConnectionStore.getState().reportReachable();
    } else {
      setAttempt((value) => value + 1);
    }
  }, []);

  const autoRetrying = status === "unreachable" && attempt < BACKOFF.length;

  // Countdown to the next automatic attempt, for the first BACKOFF.length tries.
  useEffect(() => {
    if (!autoRetrying) return;
    const wait = BACKOFF[attempt];
    setSecondsLeft(wait);
    const tick = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(tick);
          void retryNow();
          return 0;
        }
        return value - 1;
      });
    }, 1_000);
    return () => window.clearInterval(tick);
  }, [attempt, autoRetrying, retryNow]);

  // On recovery: refetch what's on screen, show "Back online" briefly, reset.
  useEffect(() => {
    const was = previous.current;
    previous.current = status;
    if (status === "restored" && (was === "offline" || was === "unreachable")) {
      onlineManager.setOnline(true);
      void queryClient.refetchQueries({ type: "active" });
      setAttempt(0);
      const timer = window.setTimeout(() => useConnectionStore.getState().settle(), RESTORED_VISIBLE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [queryClient, status]);

  // Keep the last message rendered while the pill fades out.
  const lastShown = useRef<Exclude<typeof status, "online">>("restored");
  if (status !== "online") lastShown.current = status;
  const visible = status !== "online";
  const shown = lastShown.current;
  const tone = shown === "restored" ? "bg-primary" : shown === "offline" ? "bg-destructive" : "bg-amber-400";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-[76px] z-[120] flex justify-center px-4 transition-[opacity,transform] duration-200 motion-reduce:transition-none lg:bottom-6",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <div
        aria-hidden={!visible}
        className={cn(
          "flex h-11 max-w-full items-center gap-3 rounded-full bg-foreground pl-4 pr-1.5 text-sm text-background",
          visible && "pointer-events-auto"
        )}
      >
        <span className="relative flex size-2 shrink-0" aria-hidden>
          {shown === "unreachable" ? (
            <span className={cn("absolute inset-0 rounded-full opacity-75 motion-safe:animate-ping", tone)} />
          ) : null}
          <span className={cn("relative size-2 rounded-full", tone)} />
        </span>

        <span className="truncate font-medium">
          {shown === "offline"
            ? "You’re offline"
            : shown === "restored"
              ? "Back online"
              : checking
                ? "Reconnecting…"
                : autoRetrying
                  ? `Can’t reach Choice9ja · Retrying in ${secondsLeft}s`
                  : "Can’t reach Choice9ja"}
        </span>

        {shown === "offline" || shown === "unreachable" ? (
          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={() => void retryNow()}
            disabled={checking}
            className="h-8 shrink-0 rounded-full px-3 font-semibold transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background disabled:opacity-60"
          >
            {shown === "offline" || !autoRetrying ? "Retry" : "Retry now"}
          </button>
        ) : (
          <span className="w-2.5" aria-hidden />
        )}
      </div>
    </div>
  );
}

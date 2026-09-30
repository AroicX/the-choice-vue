"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

const DEBOUNCE_MS = 400;
const MIN_LENGTH = 3;

/**
 * Live "is this username free?" check. Waits for typing to pause before
 * asking, and ignores answers for anything other than what's in the box now.
 */
export function useUsernameAvailability(value: string): UsernameStatus {
  const username = value.trim().replace(/^@+/, "");
  const [debounced, setDebounced] = useState(username);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(username), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [username]);

  const enabled = debounced.length >= MIN_LENGTH;
  const query = useQuery({
    queryKey: ["auth", "username-available", debounced.toLowerCase()],
    queryFn: () => authService.usernameAvailable(debounced),
    enabled,
    staleTime: 30_000,
    retry: false
  });

  if (username.length < MIN_LENGTH) return "idle";
  // Still typing, or waiting on the answer for the current value.
  if (username !== debounced || query.isFetching) return "checking";
  if (query.isError) return "error";
  if (!query.data) return "checking";
  return query.data.available ? "available" : "taken";
}

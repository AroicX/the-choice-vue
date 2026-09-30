"use client";

import { ApiClientError } from "@/lib/api-validation";
import { AuthAlert } from "@/components/auth/auth-field";

/**
 * Renders an auth failure with the detail the API already sent.
 *
 * The API answers a failed signup/login with `{ message: "Validation failed",
 * errors: ["phoneNo must be a string"] }`. Showing only `message` left people
 * staring at "Validation failed" with no way to know which field was wrong.
 */
export function AuthError({ error }: { error: unknown }) {
  if (!error) return null;

  const message = error instanceof Error ? error.message : "Request failed";
  const details =
    error instanceof ApiClientError
      ? error.errors?.length
        ? error.errors
        : Object.entries(error.fieldErrors ?? {}).map(
            ([field, detail]) => `${field}: ${detail}`
          )
      : [];

  return (
    <AuthAlert>
      <p className="font-medium">{message}</p>
      {details.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </AuthAlert>
  );
}

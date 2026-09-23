"use client";

import { ApiClientError } from "@/lib/api-validation";

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
    <div className="space-y-1 text-sm text-destructive" role="alert">
      <p>{message}</p>
      {details.length ? (
        <ul className="list-disc space-y-0.5 pl-5">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

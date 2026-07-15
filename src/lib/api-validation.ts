export type FieldErrors = Record<string, string>;

export class ApiClientError extends Error {
  status?: number;
  errors?: string[];
  fieldErrors?: FieldErrors;
  raw?: unknown;

  constructor(message: string, status?: number, errors?: string[], fieldErrors?: FieldErrors, raw?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
    this.fieldErrors = fieldErrors;
    this.raw = raw;
  }
}

type ParsedValidation = {
  message: string;
  fieldErrors: FieldErrors;
};

function firstMessage(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return firstMessage(record.message ?? record.msg ?? record.error ?? record.description);
  }
  return "";
}

function normalizeFieldKey(key: string) {
  return key.replace(/^body\./, "").replace(/^data\./, "").replace(/\[\d+\]/g, "").trim();
}

function assignFieldError(target: FieldErrors, key: string, message: string) {
  const field = normalizeFieldKey(key);
  if (!field || !message) return;
  if (!target[field]) target[field] = message;
}

function matchMessageToField(message: string, fieldNames: string[]) {
  const normalized = message.trim();
  if (!normalized || !fieldNames.length) return null;

  const lower = normalized.toLowerCase();
  const sorted = [...fieldNames].sort((a, b) => b.length - a.length);

  for (const field of sorted) {
    const fieldLower = field.toLowerCase();
    const snake = fieldLower.replace(/([A-Z])/g, "_$1").replace(/^_/, "");
    const spaced = fieldLower.replace(/([A-Z])/g, " $1").trim().toLowerCase();
    const patterns = [
      new RegExp(`^${fieldLower}\\b`),
      new RegExp(`\\b${fieldLower}\\b`),
      new RegExp(`^${snake}\\b`),
      new RegExp(`\\b${snake}\\b`),
      new RegExp(`\\b${spaced}\\b`)
    ];
    if (patterns.some((pattern) => pattern.test(lower))) {
      return field;
    }
  }

  return null;
}

function collectFromObject(source: Record<string, unknown>, target: FieldErrors) {
  for (const [key, value] of Object.entries(source)) {
    if (["message", "error", "statusCode", "status", "success", "data"].includes(key)) continue;
    const message = firstMessage(value);
    if (message) assignFieldError(target, key, message);
  }
}

export function parseValidationPayload(payload: unknown, fieldNames: string[] = []): ParsedValidation {
  const fieldErrors: FieldErrors = {};
  let message = "Validation failed";

  if (!payload) return { message, fieldErrors };

  if (typeof payload === "string") {
    return { message: payload, fieldErrors };
  }

  if (Array.isArray(payload)) {
    const unmatched: string[] = [];
    for (const item of payload) {
      if (typeof item === "string") {
        const field = matchMessageToField(item, fieldNames);
        if (field) assignFieldError(fieldErrors, field, item);
        else unmatched.push(item);
        continue;
      }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const field = String(record.field ?? record.path ?? record.property ?? record.param ?? "");
        const itemMessage = firstMessage(record.message ?? record.msg ?? record.error ?? item);
        if (field && itemMessage) assignFieldError(fieldErrors, field, itemMessage);
        else if (itemMessage) {
          const matched = matchMessageToField(itemMessage, fieldNames);
          if (matched) assignFieldError(fieldErrors, matched, itemMessage);
          else unmatched.push(itemMessage);
        }
      }
    }
    if (Object.keys(fieldErrors).length) message = "Please fix the highlighted fields.";
    else if (unmatched.length) message = unmatched.join(". ");
    return { message, fieldErrors };
  }

  if (typeof payload !== "object") return { message, fieldErrors };

  const record = payload as Record<string, unknown>;
  const topMessage = firstMessage(record.message ?? record.error ?? record.title);
  if (topMessage && !Array.isArray(record.message)) message = topMessage;

  const errorsValue = record.errors ?? record.fieldErrors ?? record.validationErrors ?? record.details;

  if (errorsValue && typeof errorsValue === "object" && !Array.isArray(errorsValue)) {
    collectFromObject(errorsValue as Record<string, unknown>, fieldErrors);
  } else if (Array.isArray(errorsValue)) {
    const nested = parseValidationPayload(errorsValue, fieldNames);
    Object.assign(fieldErrors, nested.fieldErrors);
    if (!Object.keys(fieldErrors).length && nested.message !== "Validation failed") message = nested.message;
  }

  if (Array.isArray(record.message)) {
    const nested = parseValidationPayload(record.message, fieldNames);
    Object.assign(fieldErrors, nested.fieldErrors);
    if (Object.keys(fieldErrors).length) message = "Please fix the highlighted fields.";
    else if (nested.message !== "Validation failed") message = nested.message;
  }

  if (!Object.keys(fieldErrors).length && typeof record.message === "string") {
    const matched = matchMessageToField(record.message, fieldNames);
    if (matched) assignFieldError(fieldErrors, matched, record.message);
  }

  if (Object.keys(fieldErrors).length && (/validation failed/i.test(message) || message === "Bad Request")) {
    message = "Please fix the highlighted fields.";
  }

  return { message, fieldErrors };
}

export function getApiFieldErrors(error: unknown, fieldNames: string[] = []): ParsedValidation {
  if (error instanceof ApiClientError) {
    if (error.raw) {
      const fromRaw = parseValidationPayload(error.raw, fieldNames);
      const merged = { ...(error.fieldErrors ?? {}), ...fromRaw.fieldErrors };
      if (Object.keys(merged).length || fromRaw.message !== "Validation failed") {
        return {
          message: Object.keys(merged).length
            ? fromRaw.message || error.message || "Please fix the highlighted fields."
            : error.message || fromRaw.message,
          fieldErrors: merged
        };
      }
    }
    if (error.fieldErrors && Object.keys(error.fieldErrors).length) {
      return {
        message: error.message || "Please fix the highlighted fields.",
        fieldErrors: error.fieldErrors
      };
    }
    if (error.errors?.length) return parseValidationPayload(error.errors, fieldNames);
    return parseValidationPayload({ message: error.message }, fieldNames);
  }

  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response?.data) return parseValidationPayload(response.data, fieldNames);
  }

  if (error instanceof Error) {
    return parseValidationPayload({ message: error.message }, fieldNames);
  }

  return parseValidationPayload(error, fieldNames);
}

export function displayApiError(error: unknown) {
  const parsed = getApiFieldErrors(error);
  if (Object.keys(parsed.fieldErrors).length) {
    return parsed.message || "Please fix the highlighted fields.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

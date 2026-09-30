import { apiClient, type ApiClientParams } from "@/lib/api-client";

export type AdminListParams = ApiClientParams & {
  skip?: number;
  take?: number;
  keyword?: string;
};

export function crudService(basePath: string) {
  return {
    list: <T = unknown>(params?: AdminListParams) => apiClient.get<T[]>(basePath, params),
    detail: <T = unknown>(id: string) => apiClient.get<T>(`${basePath}/${id}`),
    create: <T = unknown>(payload: unknown) => apiClient.post<T>(basePath, payload),
    update: <T = unknown>(id: string, payload: unknown) => apiClient.patch<T>(`${basePath}/${id}`, payload),
    remove: <T = unknown>(id: string) => apiClient.delete<T>(`${basePath}/${id}`)
  };
}

// The API caps most pages at 100 (and defaults to 20), so a single list call
// silently drops everything past the first page.
const LIST_ALL_PAGE = 100;
const LIST_ALL_MAX_PAGES = 50;

function pageItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const data = payload && typeof payload === "object" ? (payload as { data?: unknown }).data : undefined;
  return Array.isArray(data) ? data : [];
}

/** Every record from a paginated list endpoint. For admin pickers and tables, not public feeds. */
export async function listAllPages<T = unknown>(list: (params: AdminListParams) => Promise<unknown>) {
  const all: T[] = [];
  for (let page = 0; page < LIST_ALL_MAX_PAGES; page += 1) {
    const items = pageItems(await list({ skip: page * LIST_ALL_PAGE, take: LIST_ALL_PAGE })) as T[];
    all.push(...items);
    if (items.length < LIST_ALL_PAGE) break;
  }
  return all;
}

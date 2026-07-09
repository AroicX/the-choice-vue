# TheChoice9ja Control/Admin Frontend Todo

## Correction Pass

- [x] Remove the dynamic `/control/[resource]` page and any mock-record driven admin UI.
- [x] Create explicit route folders/pages for every control module.
- [x] Replace mock dashboard/resource data with real API-backed React Query calls.
- [x] Make each route call its own module component/service, using reusable components only for shared UI.
- [x] Wire all available admin/control endpoints from the API codebase and show honest empty/unavailable states for missing backend endpoints.
- [x] Run build and update this checklist.

## Follow-up Fixes

- [x] Remove visible `/api` and backend implementation copy from the control UI.
- [x] Fix control-page reload logout by waiting for persisted auth hydration before redirecting.
- [x] Centralize role cookie handling in the auth store and restore it after hydration.
- [x] Prefill edit forms from the selected record and submit real payload values.
- [x] Make custom actions invalidate data and surface request errors.
- [x] Re-run build after follow-up fixes.

- [x] Read the full admin/control prompt and extract the required routes, components, behaviours, and security rules.
- [x] Study the existing frontend architecture, routing groups, UI primitives, auth store, middleware, services, and data-fetching patterns.
- [x] Study the API reference at `/Users/Gabriel/Desktop/Dev/theChoice9ja/thechoice9ja-api/docs/API_REFERENCE.md`.
- [x] Inspect the API codebase at `/Users/Gabriel/Desktop/Dev/theChoice9ja/thechoice9ja-api` to confirm real endpoints, request/response shapes, auth, roles, and moderation flows.
- [x] Compare the requested admin features against available API capabilities and note gaps or mock-only areas.
- [x] Design the admin frontend structure: layouts, shared components, route modules, API services, state flows, loading/error/empty states, and role-aware redirects.
- [x] Implement shared admin UI components and the full-screen control layout.
- [x] Implement shared API client and admin service files aligned with the backend.
- [x] Implement role-aware middleware/login redirect behaviour for users, admins, super admins, and moderators.
- [x] Implement the dashboard and all control resource pages.
- [x] Add CRUD modals, detail drawers, confirmation flows, table filters/search/pagination, toasts, and bulk action affordances.
- [x] Run typecheck/build and fix issues.
- [x] Review the UI for desktop-first admin usability and mobile fallback.
- [x] Update this checklist with completed work and summarize final changes.

## Study Notes

- Existing frontend: Next.js app router, citizen pages under `src/app/(main)`, auth pages under `src/app/(auth)`, no existing `src/app/(control)` route group yet.
- Existing frontend UI: Tailwind primitives in `src/components/ui`, `goey-toast`, React Query, Axios client, React Table, Recharts, Zustand auth store.
- Existing auth flow: `LoginForm` stores JWT/user in Zustand and writes `choice9ja-role` cookie; middleware currently guards `/control` with `ADMIN` and `SUPER_ADMIN` only and redirects non-admin users to `/home`.
- Required role flow: normal users should go to `/`, admins/super admins/moderators to `/control`; unauthenticated `/control` should go to `/login`; normal users attempting `/control` should go to `/`.
- Backend roles: Prisma includes `USER`, `ADMIN`, `SUPER_ADMIN`, `MODERATOR`, `JOURNALIST`, `VERIFIED_ORG`, `POLITICIAN`.
- Backend role decorators: `AdminOnly()` allows `ADMIN` and `SUPER_ADMIN`; `ModeratorOnly()` allows `MODERATOR`, `ADMIN`, `SUPER_ADMIN`, but most admin endpoints currently use `AdminOnly()`.
- Real admin/user endpoints: `/api/auth/users`, `/api/auth/users/:user_id`, `/api/auth/users/suspend/:user_id`.
- Real analytics endpoints: `/api/analytics` and `/api/analytics/dashboard`, plus an older overview controller returning counts at `/api/analytics/`.
- Real moderation endpoints: `/api/moderation/reports` and `/api/moderation/actions`, admin-only.
- Real reports endpoint: `/api/reports` creates a user report; report listing is via moderation.
- Real CRUD-style resources: discussions, posts, comments, polls, elections, parties, politicians, ratings/candidates, notifications, promises, news, fact-checks, topics, communities.
- API gaps vs requested UI: feature/unfeature posts, hide/restore content, notification audience broadcast, full admin settings, direct user edit/delete/change-role/verify endpoints, and some status transitions are not first-class backend endpoints yet.

## Implementation Design

- Route group: add `src/app/(control)/control/layout.tsx`, `src/app/(control)/control/page.tsx`, and explicit route folders/pages for each requested admin module.
- Layout: replace the existing lightweight `ControlShell` with fixed dark sidebar, sticky header, breadcrumbs, profile dropdown, notification button, and independently scrolling main content.
- Shared admin UI: place reusable primitives under `src/components/admin` and keep them client-compatible where they manage table/drawer/modal state.
- Data pages: use explicit module pages that call their own service functions; share only UI/table/form primitives.
- Service layer: add `src/lib/api-client.ts` as a normalized wrapper around the existing Axios client, plus `src/services/*.service.ts` files matching the requested API pattern.
- Auth/routing: update middleware and login success routing to recognize `ADMIN`, `SUPER_ADMIN`, and `MODERATOR` for frontend `/control` access, while noting backend write endpoints may still reject moderators.
- Dashboard: load live analytics from `/api/analytics` and moderation reports from `/api/moderation/reports`; show empty/error states when the API returns no data.

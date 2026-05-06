## Plan: Supabase List Collection Backend

Build backend CRUD for user-scoped lists with song items, backed by Supabase tables `lists` and `list_songs`. Use existing Express structure (routes/controllers/services) and Supabase client. Provide REST endpoints for list CRUD and song add/remove, and document required request/response shapes based on current frontend list object.

**Steps**

1. Define Supabase schema: `lists` (id, user_id, title, description, created_at) and `list_songs` (id, list_id, song_id, title, artist, image, created_at) with indexes and unique constraint on (list_id, song_id). _Depends on decisions about primary key types._
2. Add RLS policies for both tables: user can select/insert/update/delete only where `user_id = auth.uid()`; allow `list_songs` access by joining to parent list’s user_id. _Depends on step 1._
3. Create service layer functions for list CRUD and song add/remove using [server/src/config/supabase.js](server/src/config/supabase.js). Reuse error handling patterns from auth/spotify services. _Parallel with step 4._
4. Add controller handlers to validate inputs, map request bodies to service calls, and return consistent JSON payloads. _Parallel with step 3._
5. Add routes in `server/src/routes/list.route.js` and register in [server/index.js](server/index.js). _Depends on steps 3–4._
6. Confirm auth strategy for backend: use Supabase JWT from frontend in `Authorization: Bearer <token>` and validate user via Supabase `auth.getUser()` on each request (or middleware). _Depends on auth choice._
7. Provide example requests for frontend usage, including list CRUD and add/remove songs.

**Relevant files**

- `server/index.js` — register new list routes (e.g., `/api/lists`)
- `server/src/config/supabase.js` — Supabase client used by services
- `server/src/routes/list.route.js` — new list endpoints
- `server/src/controllers/list.controller.js` — request validation + responses
- `server/src/services/list.service.js` — Supabase queries for lists and list_songs
- `server/src/middlewares` — optional auth middleware if added

**Verification**

1. Create list, get list(s), update, delete via REST client; verify DB rows created.
2. Add song to list, ensure unique constraint prevents duplicates; remove song and verify.
3. Verify RLS: user A cannot access user B’s lists (manual test with two tokens).

**Decisions**

- User-scoped lists using `user_id`.
- Persist song fields: `song_id`, `title`, `artist`, `image`.
- Endpoints include list CRUD + add/remove songs.

**Further Considerations**

1. Primary key type: use `uuid` for list ids vs. `bigint` autoincrement. Recommendation: `uuid` for easier client-side creation.
2. Auth middleware: centralized JWT validation vs. per-controller checks. Recommendation: middleware for reuse.
3. Soft delete vs hard delete. Recommendation: hard delete for now.

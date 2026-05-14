## Plan: Profile Pages With Supabase Data

Implement Instagram-like profile pages with editable profile data, follow system, stats, top picks, and collections tied to Supabase. Add backend routes for public profile lookup by username, profile updates (including avatar upload), followers/following counts, user-specific review and list stats, and top picks sorting. Wire frontend profile components to new APIs with auth context and route params.

**Steps**

1. Backend: define data model for followers and profile images (Supabase storage bucket + DB fields). Add migration notes and table expectations: `follows` table with `follower_id`, `following_id`, timestamps; `profiles` table extended to store `avatar_url`, `full_name` (display name), `username`.
2. Backend: add profile routes and controllers for public profile by username, update profile (auth), follow/unfollow (auth), and stats aggregations. _depends on 1_
3. Backend: add query methods in services for stats (reviews count, lists count, list songs count), top picks (sorted by likes_count desc, fallback created_at desc), followers/following counts, and profile retrieval including isFollowing for viewer. _depends on 2_
4. Frontend: add profile API client methods (get profile by username, update profile, follow/unfollow, fetch profile stats, fetch top picks, fetch collections). _parallel with step 2 once routes sketched_
5. Frontend routing: update profile page route to accept `:username` param, load viewed profile data, and detect “own profile” from auth user. _depends on 4_
6. Frontend UI: update ProfileHeader to show avatar, display name, username, edit button for own profile, follow button for others; add edit modal with avatar upload + display name/username update. _depends on 5_
7. Frontend UI: update ProfileStats to use live counts (reviews written, followers, lists curated, songs in lists). _depends on 5_
8. Frontend UI: update ProfileTopPicks to fetch top 4 reviews for viewed user with sorting fallback; reuse existing review card UI or add compact card in profile section. _depends on 5_
9. Frontend UI: update ProfileCollection to show 4 list cards from the user’s lists, include list_songs preview in CuratedCard and show Load More only if more than 4; link to full list page. _depends on 5_
10. Authorization: ensure all profile edit and follow actions require auth; public profile and stats are viewable by others. Add error handling for missing users. _depends on 2,5_

**Relevant files**

- `server/src/routes` — add profile and follow routes, or extend existing auth/list/review routes
- `server/src/controllers` — new profile/follow controller logic
- `server/src/services` — new profile/follow service functions for Supabase queries
- `server/src/middlewares/authenticate.js` — ensure auth checks for edit/follow actions
- `src/services/api.js` — reuse apiFetch for new profile endpoints
- `src/services` — new profile client or additions to existing services
- `src/context/AuthContext.jsx` — expose current user/username for own-profile checks
- `src/pages/Profile.jsx` and `src/components/sections/ProfileSection.jsx` — load profile data and pass down props
- `src/components/profile/ProfileHeader.jsx` — render profile data + edit/follow
- `src/components/profile/ProfileStats.jsx` — render stats
- `src/components/profile/ProfileTopPicks.jsx` — render top picks
- `src/components/profile/ProfileCollection.jsx` — render collections from lists
- `src/components/curated/CuratedCard.jsx` — ensure list_songs preview support

**Verification**

1. Manual: view own profile at /profile/{username} shows edit button and editable fields; view another user shows follow button and correct stats.
2. Manual: update avatar and display name; refresh page shows persisted values.
3. Manual: follow/unfollow another user updates follower count and button state.
4. Manual: Top Picks shows 4 reviews sorted by likes; new account uses most recent reviews.
5. Manual: Collection shows 4 lists max with Load More only when more than 4.

**Decisions**

- Profile route uses username in URL.
- Enable full edit now (avatar upload + text fields).
- Implement followers now with new table and endpoints.
- Top Picks fallback sort is newest review when likes are all zero.
- Collections include list_songs previews.

**Further Considerations**

1. Decide if changing username should be allowed for now or restricted to avoid broken profile URLs; recommend restricting changes or adding redirect mapping.
2. Decide if follower counts should include pending or blocked states; recommend simple follow only for MVP.
3. Decide how to handle private profiles; recommend public for MVP.

/**
 * Spotify API Controller
 *
 * Handles all Spotify-proxied endpoints: new releases, search, track/album detail,
 * and discover. Uses client_credentials flow for auth (no user login needed).
 *
 * Error handling overview:
 * - Token errors: If Spotify token fetch fails, the raw error propagates to
 *   the catch block and `error.message` is sent directly to the client (leaks
 *   internal details). TODO: Return safe user-friendly messages.
 * - Upstream errors: Some handlers check `res.ok`, others don't (searchTracks,
 *   getDiscover). When Spotify returns 401/429/5xx, behaviour is inconsistent.
 *   TODO: Standardise all handlers to check `res.ok` and map to safe messages.
 * - Rate limiting (429): Only partially handled in getNewReleases, and the
 *   429 handler is dead code (after a return statement).
 */
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL =
  "https://api.spotify.com/v1/search?q=year:2026&type=album&limit=10";

/** In-memory cache for new releases — avoids hitting Spotify on every request. */
const releasesCache = {
  data: null,
  expiresAt: 0,
};

/** Cached Spotify access token + expiry to avoid re-fetching on every request. */
let cachedToken = null;
let tokenExpiresAt = 0;
/** When true, all requests are rejected with 429 (cooldown after rate limit). */
let isPaused = false;

/**
 * Fetches (or returns cached) Spotify client_credentials access token.
 *
 * Error handling notes:
 * - Does NOT check `tokenResponse.ok` — if Spotify returns 4xx/5xx here,
 *   `tokenData.access_token` will be undefined and downstream fetches fail
 *   with a confusing 401 from Spotify.
 *   TODO: Check `tokenResponse.ok` and throw a clear error.
 * - If SPOTIFY_CLIENT_ID/SECRET are missing, the request will fail silently.
 */
const getSpotifyToken = async () => {
  // Return cached token if it hasn't expired yet
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log("🔑 Meminta token baru dari Spotify...");
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenResponse.json();

  // Cache the token, expiring 60s early as a safety margin
  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;

  return cachedToken;
};

export const getNewReleases = async (req, res) => {
  if (isPaused) {
    return res
      .status(429)
      .json({ error: "Backend is cooling down. Try again later." });
  }

  try {
    if (releasesCache.data && Date.now() < releasesCache.expiresAt) {
      return res.json(releasesCache.data);
    }

    console.log("1️⃣  Requesting token...");
    const token = await getSpotifyToken();
    console.log("✅ Token OK");

    console.log("2️⃣  Fetching releases...");
    const releaseResponse = await fetch(SPOTIFY_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📊 Spotify Status:", releaseResponse.status);

    if (!releaseResponse.ok) {
      const contentType = releaseResponse.headers.get("content-type") || "";
      const retryAfter = releaseResponse.headers.get("retry-after") || null;
      const errorBody = contentType.includes("application/json")
        ? await releaseResponse.json()
        : await releaseResponse.text();

      console.error("❌ Spotify Error:", errorBody);
      return res.status(releaseResponse.status).json({
        error: "Spotify failed",
        detail: errorBody,
        retryAfter,
      });
    }

    const releaseData = await releaseResponse.json();
    const albums = releaseData.albums?.items || [];

    console.log(`✅ Success! Sending ${albums.length} albums`);
    releasesCache.data = albums;
    releasesCache.expiresAt = Date.now() + 1000 * 60 * 5;
    return res.json(albums);

    // ⚠️ BUG: DEAD CODE — this block is unreachable because `return res.json(albums)`
    // is on line above. The 429 rate-limit pause logic never executes.
    // TODO: Move this block BEFORE the return statement, or handle 429 in the
    // `!releaseResponse.ok` check above (around line 67-80).
    if (!releaseResponse.ok && releaseResponse.status === 429) {
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
      }, 30000); // Stop semua request selama 30 detik
    }
  } catch (error) {
    // ⚠️ Leaks internal error message to client (e.g. "fetch failed",
    // network errors, JSON parse errors). TODO: Return safe message.
    console.error("❌ Exception:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Search tracks and albums on Spotify.
 *
 * Error handling notes:
 * - ⚠️ Does NOT check `searchResponse.ok` after the main search fetch.
 *   If Spotify returns 429 or 5xx, `data.albums` / `data.tracks` will be
 *   undefined, and the handler returns empty results silently.
 *   TODO: Add `if (!searchResponse.ok)` check with proper error response.
 * - Individual album detail fetches (for singles) DO check `albumRes.ok`
 *   and gracefully return [] on failure — this is correct.
 * - Catch block leaks `error.message` to client.
 */
export const searchTracks = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.json({ albums: [], tracks: [] });
  }

  try {
    const token = await getSpotifyToken();
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // ⚠️ Missing: `if (!searchResponse.ok)` check here
    const data = await searchResponse.json();

    const albums = data.albums?.items || [];
    const tracks = data.tracks?.items || [];

    // Separate single-track albums from multi-track albums so singles
    // appear as tracks (not albums) in search results
    const singleAlbums = albums.filter((album) => album.total_tracks === 1);
    const multiTrackAlbums = albums.filter((album) => album.total_tracks !== 1);

    // For single-track albums, fetch the actual track data
    let singleTracks = [];
    if (singleAlbums.length) {
      const singleTrackResults = await Promise.all(
        singleAlbums.map(async (album) => {
          try {
            const albumRes = await fetch(
              `https://api.spotify.com/v1/albums/${album.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            // ✅ Correctly checks res.ok — returns empty on failure
            if (!albumRes.ok) {
              return [];
            }

            const albumData = await albumRes.json();
            const albumInfo = {
              id: albumData.id,
              name: albumData.name,
              images: albumData.images,
              album_type: albumData.album_type,
            };

            return (albumData.tracks?.items || []).map((track) => ({
              ...track,
              album: albumInfo,
            }));
          } catch (error) {
            // Gracefully skip failed album detail fetches
            return [];
          }
        }),
      );

      singleTracks = singleTrackResults.flat();
    }

    // Deduplicate tracks by ID (a track could appear in both search results
    // and as a single-album track)
    const trackMap = new Map();
    [...tracks, ...singleTracks].forEach((track) => {
      if (track?.id) {
        trackMap.set(track.id, track);
      }
    });

    return res.json({
      albums: multiTrackAlbums,
      tracks: Array.from(trackMap.values()),
    });
  } catch (error) {
    // ⚠️ Leaks error.message to client. TODO: Return safe message.
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get single track detail from Spotify.
 *
 * Error handling notes:
 * - ✅ Checks `trackRes.ok` and forwards the Spotify status code.
 * - ⚠️ Forwards raw Spotify error body (`trackData`) to client, which may
 *   contain internal Spotify error details. TODO: Wrap in safe message.
 */
export const getTrackDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const token = await getSpotifyToken();
    const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const trackData = await trackRes.json();

    if (!trackRes.ok) {
      // Forwards upstream status (e.g. 404 if track not found)
      // ⚠️ Raw Spotify body is sent to client — should be sanitised
      return res.status(trackRes.status).json(trackData);
    }

    return res.json(trackData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get album detail from Spotify.
 *
 * Error handling notes:
 * - ⚠️ On `!albumRes.ok`, always returns 500 regardless of actual upstream
 *   status (e.g. Spotify 404 → our client sees 500). Should forward the
 *   actual status or at least use 502 for upstream errors.
 * - ⚠️ Sends raw Spotify error body to client.
 */
export const getAlbumDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const token = await getSpotifyToken();
    const albumRes = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const albumData = await albumRes.json();

    if (!albumRes.ok) {
      // ⚠️ Hardcodes 500 — should forward albumRes.status or use 502
      return res.status(500).json(albumData);
    }

    return res.json(albumData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Discover tracks by search query.
 *
 * Error handling notes:
 * - ⚠️ Does NOT check `apiRes.ok` — only checks `data.error` (Spotify's
 *   body-level error field). If Spotify returns 429 with a different body
 *   structure, this won't catch it.
 *   TODO: Use `if (!apiRes.ok)` as the primary error check.
 * - Sends raw Spotify error body (`data`) directly to client.
 * - `console.log("DISCOVER RESPONSE:", data)` logs full response on every
 *   request — noisy in production. TODO: Remove or guard with DEBUG flag.
 */
export const getDiscover = async (req, res) => {
  const query = req.query.q || "top hits 2025";

  try {
    const token = await getSpotifyToken();
    const apiRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await apiRes.json();

    // ⚠️ Verbose logging on every request — remove in production
    console.log("DISCOVER RESPONSE:", data);

    // ⚠️ Checks body-level `data.error` instead of `apiRes.ok`.
    // Spotify may return non-ok status without this field.
    if (data.error) {
      return res.status(500).json(data);
    }

    return res.json({
      tracks: data.tracks?.items || [],
    });
  } catch (error) {
    console.error("Server error:", error);

    // ⚠️ Leaks error.message to client
    return res.status(500).json({
      error: error.message,
    });
  }
};

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL =
  "https://api.spotify.com/v1/search?q=year:2026&type=album&limit=10";

const getSpotifyToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Kredensial Spotify hilang!");
  }

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

  if (!tokenResponse.ok) {
    const detail = tokenData?.error || tokenData;
    throw new Error(detail?.message || "Token failed");
  }

  if (!tokenData.access_token) {
    throw new Error("Token gagal");
  }

  return tokenData.access_token;
};

export const getNewReleases = async (req, res) => {
  console.log("\n📍 Request diterima ke /api/new-releases");

  try {
    console.log("1️⃣  Requesting token...");
    const token = await getSpotifyToken();
    console.log("✅ Token OK");

    console.log("2️⃣  Fetching releases...");
    const releaseResponse = await fetch(SPOTIFY_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("📊 Spotify Status:", releaseResponse.status);

    if (!releaseResponse.ok) {
      const error = await releaseResponse.json();
      console.error("❌ Spotify Error:", error);
      return res.status(releaseResponse.status).json({
        error: "Spotify failed",
        detail: error,
      });
    }

    const releaseData = await releaseResponse.json();
    const albums = releaseData.albums?.items || [];

    console.log(`✅ Success! Sending ${albums.length} albums`);
    return res.json(albums);
  } catch (error) {
    console.error("❌ Exception:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

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

    const data = await searchResponse.json();

    const albums = data.albums?.items || [];
    const tracks = data.tracks?.items || [];

    const singleAlbums = albums.filter((album) => album.total_tracks === 1);
    const multiTrackAlbums = albums.filter((album) => album.total_tracks !== 1);

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
            return [];
          }
        }),
      );

      singleTracks = singleTrackResults.flat();
    }

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
    return res.status(500).json({ error: error.message });
  }
};

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
      return res.status(trackRes.status).json(trackData);
    }

    return res.json(trackData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

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
      return res.status(500).json(albumData);
    }

    return res.json(albumData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

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

    console.log("DISCOVER RESPONSE:", data);

    if (data.error) {
      return res.status(500).json(data);
    }

    return res.json({
      tracks: data.tracks?.items || [],
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

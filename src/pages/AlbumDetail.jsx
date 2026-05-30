import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReviewModal from "../components/review/ReviewModal";
import { getTrackReviews, toggleReviewLike } from "../services/review";
import { getAlbum } from "../services/spotify";

const AlbumDetail = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openReview, setOpenReview] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackReviews, setTrackReviews] = useState([]);

  const loadTrackReviews = async (trackId) => {
    if (!trackId) {
      setTrackReviews([]);
      return;
    }

    try {
      const reviews = await getTrackReviews(trackId);
      setTrackReviews(reviews);
    } catch (error) {
      console.error(error);
      setTrackReviews([]);
    }
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbum(id);
        setAlbum(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAlbum();
  }, [id]);

  useEffect(() => {
    loadTrackReviews(selectedTrack?.id);
  }, [selectedTrack]);

  if (!album) {
    return <p className="p-10">Loading...</p>;
  }

  if (album.error) {
    return <div className="p-10 text-red-500">Failed to load album</div>;
  }

  return (
    <div className="px-6 md:px-16 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={album?.images?.[0]?.url}
          className="w-64 h-64 object-cover rounded-xl shadow-lg"
        />

        <div>
          <h1 className="text-3xl md:text-5xl font-bold">{album.name}</h1>

          <p className="text-gray-500 mt-2">
            {album.artists.map((a) => a.name).join(", ")}
          </p>

          <p className="text-sm text-gray-400 mt-2">
            {album.release_date} • {album.total_tracks} tracks
          </p>

          {openReview && selectedTrack ? (
            <ReviewModal
              track={{
                id: selectedTrack.id,
                title: selectedTrack.name,
                artist: selectedTrack.artists.map((a) => a.name).join(", "),
                image: album.images[0]?.url,
                albumId: album.id,
                albumName: album.name,
                albumType: album.album_type,
              }}
              onClose={() => setOpenReview(false)}
            />
          ) : null}
        </div>
      </div>

      {/* TRACK LIST */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Tracks</h2>

        <div className="space-y-3">
          {album.tracks.items.map((track, i) => (
            <div
              key={track.id}
              className="flex justify-between border-b pb-2 text-sm"
            >
              <p>
                {i + 1}. {track.name}
              </p>

              <div className="flex gap-3 items-center">
                {/* 🔥 REVIEW PER TRACK */}
                <button
                  onClick={() => {
                    setSelectedTrack(track);
                    setOpenReview(true);
                  }}
                  className="text-xs text-blue-500"
                >
                  Review
                </button>

                <p className="text-gray-400">
                  {Math.floor(track.duration_ms / 60000)}:
                  {String(
                    Math.floor((track.duration_ms % 60000) / 1000),
                  ).padStart(2, "0")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Reviews ({trackReviews.length})
        </h2>

        {trackReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {trackReviews.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl bg-white">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">
                      @{r.username || "anonymous"}
                    </p>
                    {r.album_type !== "single" && r.album_name ? (
                      <p className="text-xs text-gray-400">{r.album_name}</p>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* RATING */}
                <p className="text-green-500 mt-1">{"★".repeat(r.rating)}</p>

                {/* CONTENT */}
                <p className="text-sm text-gray-700 mt-2">
                  {r.content || "No comment"}
                </p>

                {/* ACTION */}
                <button
                  onClick={async () => {
                    try {
                      const result = await toggleReviewLike(r.id);
                      setTrackReviews((prev) =>
                        prev.map((review) =>
                          review.id === r.id
                            ? {
                                ...review,
                                likes_count: result.likes_count,
                                liked_by_me: result.liked,
                              }
                            : review,
                        ),
                      );
                    } catch (error) {
                      alert(error?.message || "Gagal update like");
                    }
                  }}
                  className={`text-xs mt-2 ${
                    r.liked_by_me ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {r.liked_by_me ? "Liked" : "Like"} ({r.likes_count || 0})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;


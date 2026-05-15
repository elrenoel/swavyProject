import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReviewModal from "../components/review/ReviewModal";
import { getTrackReviews, toggleReviewLike } from "../services/review";

const TrackDetail = () => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openReview, setOpenReview] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/track/${id}`);
        const data = await res.json();
        setTrack(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getTrackReviews(id);
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [id]);

  const handleToggleLike = async (reviewId) => {
    const result = await toggleReviewLike(reviewId);
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              likes_count: result.likes_count,
              liked_by_me: result.liked,
            }
          : review,
      ),
    );
  };

  if (isLoading) {
    return <p className="p-10">Loading...</p>;
  }

  if (!track || track.error) {
    return <div className="p-10 text-red-500">Failed to load track</div>;
  }

  const albumName = track.album?.name || null;
  const albumType = track.album?.album_type || null;

  return (
    <div className="px-6 md:px-16 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={track.album?.images?.[0]?.url}
          className="w-64 h-64 object-cover rounded-xl shadow-lg"
        />

        <div>
          <h1 className="text-3xl md:text-5xl font-bold">{track.name}</h1>
          <p className="text-gray-500 mt-2">
            {track.artists?.map((artist) => artist.name).join(", ")}
          </p>
          {albumType !== "single" && albumName ? (
            <p className="text-sm text-gray-400 mt-2">{albumName}</p>
          ) : null}
          <p className="text-sm text-gray-400 mt-2">
            {Math.floor(track.duration_ms / 60000)}:
            {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(
              2,
              "0",
            )}
          </p>

          <button
            onClick={() => setOpenReview(true)}
            className="mt-4 text-xs text-blue-500"
          >
            Review
          </button>

          {openReview ? (
            <ReviewModal
              track={{
                id: track.id,
                title: track.name,
                artist: track.artists?.map((artist) => artist.name).join(", "),
                image: track.album?.images?.[0]?.url,
                albumId: track.album?.id || null,
                albumName: albumName,
                albumType: albumType,
              }}
              onClose={() => setOpenReview(false)}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">
                      <a href={`../profile/${review.username}`}>
                        @{review.username || "anonymous"}
                      </a>
                    </p>
                    {review.album_type !== "single" && review.album_name ? (
                      <p className="text-xs text-gray-400">
                        {review.album_name}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-green-500 mt-1">
                  {"★".repeat(review.rating)}
                </p>

                <p className="text-sm text-gray-700 mt-2 line-clamp-2 overflow-hidden break-all">
                  {review.content || "No comment"}
                </p>

                <button
                  onClick={() => handleToggleLike(review.id)}
                  className={`text-xs mt-2 ${
                    review.liked_by_me ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {review.liked_by_me ? "💚" : "❤️"} {review.likes_count || 0}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackDetail;

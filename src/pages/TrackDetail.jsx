import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { IoPlayCircleOutline } from "react-icons/io5";
import ReviewModal from "../components/review/ReviewModal";
import { getTrackReviews, toggleReviewLike } from "../services/review";
import { getTrack } from "../services/spotify";

const formatDuration = (durationMs = 0) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = String(Math.floor((durationMs % 60000) / 1000)).padStart(
    2,
    "0",
  );

  return `${minutes}:${seconds}`;
};

const TrackDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openReview, setOpenReview] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const data = await getTrack(id);
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
    return <p className="p-6 text-sm text-gray-400 md:p-10">Loading...</p>;
  }

  if (!track || track.error) {
    return (
      <div className="p-6 text-sm text-red-500 md:p-10">
        Failed to load track
      </div>
    );
  }

  const albumName = track.album?.name || null;
  const albumType = track.album?.album_type || null;
  const artists = track.artists?.map((artist) => artist.name).join(", ");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <section className="flex flex-col gap-8 md:flex-row md:items-start">
        <img
          src={track.album?.images?.[0]?.url}
          className="h-72 w-72 rounded-2xl object-cover"
          alt=""
        />

        <div className="min-w-0 flex-1 pt-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-600">
            Track
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-gray-950 md:text-6xl">
            {track.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{artists}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            {albumType !== "single" && albumName ? <span>{albumName}</span> : null}
            {albumType !== "single" && albumName ? <span>-</span> : null}
            <span>{formatDuration(track.duration_ms)}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCurrentTrack(track.id)}
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              <IoPlayCircleOutline size={20} />
              Play Music
            </button>

            <button
              type="button"
              onClick={() => setOpenReview(true)}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
            >
              Write Review
            </button>
          </div>

          {openReview ? (
            <ReviewModal
              track={{
                id: track.id,
                title: track.name,
                artist: artists,
                image: track.album?.images?.[0]?.url,
                albumId: track.album?.id || null,
                albumName: albumName,
                albumType: albumType,
              }}
              onClose={() => setOpenReview(false)}
            />
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-950">
              Reviews ({reviews.length})
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Community thoughts for this track.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-400">
            No reviews yet. Be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span>@{review.username || "anonymous"}</span>
                      <a
                        href={`../profile/${review.username}`}
                        className="text-xs font-medium text-green-600 hover:text-green-700"
                      >
                        view profile
                      </a>
                    </div>
                    {review.album_type !== "single" && review.album_name ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {review.album_name}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-2 flex gap-1 text-green-500">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <FaStar key={`${review.id}-star-${index}`} size={14} />
                  ))}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {review.content || "No comment"}
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleLike(review.id)}
                  className={`mt-3 inline-flex items-center gap-1 text-xs transition ${
                    review.liked_by_me
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  {review.liked_by_me ? (
                    <FaHeart size={18} />
                  ) : (
                    <FaRegHeart size={18} />
                  )}
                  {review.likes_count || 0}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrackDetail;

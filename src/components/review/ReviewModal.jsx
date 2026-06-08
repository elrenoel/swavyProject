import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewContext";
import { getMyTrackReview } from "../../services/review";

const ratingLabels = {
  1: "Not for me",
  2: "Has moments",
  3: "Solid",
  4: "Great",
  5: "Essential",
};

const ReviewModal = ({ track, onClose }) => {
  const { user } = useAuth();
  const { createReview, updateReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!user) {
        setIsLoadingReview(false);
        return;
      }
      try {
        const review = await getMyTrackReview(track.id);
        if (review) {
          setExistingReviewId(review.id);
          setRating(review.rating);
          setText(review.content || "");
        }
      } catch (error) {
        console.error("Failed to fetch existing review", error);
      } finally {
        setIsLoadingReview(false);
      }
    };
    fetchExistingReview();
  }, [track.id, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setFormError("Login first to write a review.");
      return;
    }

    if (!rating) {
      setFormError("Choose a rating before publishing.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);
    try {
      const payload = {
        track_id: track.id,
        album_id: track.albumId || null,
        album_name: track.albumName || null,
        album_type: track.albumType || null,
        title: track.title,
        artist: track.artist,
        image_url: track.image,
        rating,
        content: text.trim(),
      };

      if (existingReviewId) {
        await updateReview(existingReviewId, { rating, content: text.trim() });
      } else {
        await createReview(payload);
      }
      onClose();
    } catch (error) {
      setFormError(error?.message || "Failed to save review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
              Track review
            </p>
            <h2 className="text-2xl font-bold leading-tight text-gray-950">
              {isLoadingReview
                ? "Loading..."
                : existingReviewId
                  ? "Update Review"
                  : "Write Review"}
            </h2>
            <p className="mt-2 truncate text-sm text-gray-500">
              {track.title} - {track.artist}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close review modal"
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            <span className="text-xs font-medium text-gray-400">
              {visibleRating ? ratingLabels[visibleRating] : "Tap a star"}
            </span>
          </div>

          <div
            className="flex gap-2"
            onMouseLeave={() => setHoverRating(0)}
            aria-label="Choose rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setFormError("");
                }}
                onMouseEnter={() => setHoverRating(star)}
                className={`
                  rounded-full p-1.5 transition
                  ${
                    star <= visibleRating
                      ? "text-green-500"
                      : "text-gray-300 hover:text-green-300"
                  }
                `}
                aria-label={`${star} star`}
              >
                <FaStar size={24} />
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Thoughts
          </span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What stands out? The hook, production, lyrics, replay value..."
            rows={5}
            maxLength={600}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
          />
          <span className="mt-1 block text-right text-xs text-gray-400">
            {text.length}/600
          </span>
        </label>

        {formError ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingReview || !rating}
            className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSubmitting
              ? existingReviewId
                ? "Updating..."
                : "Publishing..."
              : existingReviewId
                ? "Update"
                : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewModal;

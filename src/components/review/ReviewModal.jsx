import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewContext";
import { getMyTrackReview } from "../../services/review";

const ReviewModal = ({ track, onClose }) => {
  const { user } = useAuth();
  const { createReview, updateReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [existingReviewId, setExistingReviewId] = useState(null);

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

  const handleSubmit = async () => {
    if (!user) {
      alert("Harus login untuk review");
      return;
    }

    if (!rating) {
      alert("Rating wajib");
      return;
    }

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
        content: text,
      };

      if (existingReviewId) {
        await updateReview(existingReviewId, { rating, content: text });
      } else {
        await createReview(payload);
      }
      onClose();
    } catch (error) {
      alert(error?.message || "Gagal membuat review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-100">
        <h2 className="text-lg font-semibold mb-4">
          {isLoadingReview ? "Loading..." : existingReviewId ? "Update Review" : "Write Review"}
        </h2>

        {/* STAR */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={star <= rating ? "text-green-500" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>

        {/* TEXT */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts..."
          className="w-full border rounded p-2 mb-4"
        />

        {/* ACTION */}
        <div className="flex justify-between">
          <button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={isSubmitting || isLoadingReview}
          >
            {isSubmitting
              ? existingReviewId ? "Updating..." : "Publishing..."
              : existingReviewId ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

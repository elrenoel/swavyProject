import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewContext";

const ReviewModal = ({ track, onClose }) => {
  const { user } = useAuth();
  const { createReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createReview({
        track_id: track.id,
        album_id: track.albumId || null,
        album_name: track.albumName || null,
        album_type: track.albumType || null,
        title: track.title,
        artist: track.artist,
        image_url: track.image,
        rating,
        content: text,
      });
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
        <h2 className="text-lg font-semibold mb-4">Write Review</h2>

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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

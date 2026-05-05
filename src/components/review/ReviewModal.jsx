import { useState } from "react";
import { useReviews } from "../../context/ReviewContext";

const ReviewModal = ({ track, onClose }) => {
  const { addReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!rating) return alert("Rating wajib");

    addReview({
      id: Date.now(),
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      image: track.image,
      rating,
      content: text,
      user: "You",
      likes: 0,
      createdAt: Date.now()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px]">

        <h2 className="text-lg font-semibold mb-4">Write Review</h2>

        {/* STAR */}
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(star => (
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
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Publish
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;
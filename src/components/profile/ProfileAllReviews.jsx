import { useState } from "react";
import ReviewCard from "../sections/CuratedEditorial/ReviewCard";
import ReviewModal from "../review/ReviewModal";

const ProfileAllReviews = ({ reviews, isOwnProfile, onBack }) => {
  const [editingReview, setEditingReview] = useState(null);

  const handleReviewClick = (review) => {
    if (!isOwnProfile) return;
    setEditingReview(review);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-black font-semibold text-sm flex items-center gap-2"
        >
          ← BACK TO PROFILE
        </button>
      </div>

      <h2 className="text-xl md:text-2xl font-bold font-['Newsreader'] mb-6">
        All Reviews
      </h2>

      {reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border rounded-xl hover:bg-gray-50 transition"
            >
              <ReviewCard
                title={review.title}
                artist={review.artist}
                rating={review.rating}
                snippet={review.content || ""}
                image={review.image_url}
                trackId={review.track_id}
              />
              {isOwnProfile && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleReviewClick(review)}
                    className="text-sm text-gray-500 underline cursor-pointer"
                  >
                    update review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      )}

      {editingReview && isOwnProfile && (
        <ReviewModal
          track={{
            id: editingReview.track_id,
            title: editingReview.title,
            artist: editingReview.artist,
            image: editingReview.image_url,
            albumId: editingReview.album_id,
            albumName: editingReview.album_name,
            albumType: editingReview.album_type,
          }}
          onClose={() => setEditingReview(null)}
        />
      )}
    </div>
  );
};

export default ProfileAllReviews;

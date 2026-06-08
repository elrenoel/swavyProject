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
    <div className="mx-auto w-full max-w-4xl md:min-w-[720px] lg:min-w-[820px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
        >
          Back to Profile
        </button>
      </div>

      <h2 className="mb-6 font-['Newsreader'] text-3xl font-bold text-gray-950">
        All Reviews
      </h2>

      {reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300"
            >
              <ReviewCard
                title={review.title}
                artist={review.artist}
                rating={review.rating}
                snippet={review.content || ""}
                image={review.image_url}
                trackId={review.track_id}
              />
              {isOwnProfile ? (
                <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleReviewClick(review)}
                    className="rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
                  >
                    Update Review
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-400">
          No reviews yet.
        </div>
      )}

      {editingReview && isOwnProfile ? (
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
      ) : null}
    </div>
  );
};

export default ProfileAllReviews;

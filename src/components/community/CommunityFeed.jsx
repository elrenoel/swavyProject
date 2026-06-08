import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewContext";
import ReviewCard from "../sections/CuratedEditorial/ReviewCard";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const CommunityFeed = ({ activeTab }) => {
  const { user } = useAuth();
  const {
    pagedReviews,
    page,
    totalPages,
    isLoading,
    toggleReviewLike,
    setPage,
  } = useReviews();

  if (activeTab !== "fresh") {
    return <EmptyState text="Belum ada konten untuk tab ini." />;
  }

  if (isLoading) {
    return <EmptyState text="Loading..." />;
  }

  if (!pagedReviews.length) {
    return <EmptyState text="Belum ada review terbaru." />;
  }

  return (
    <div className="space-y-4">
      {pagedReviews.map((review) => (
        <article
          key={review.id}
          className="
            rounded-xl border border-gray-200 bg-white p-4 sm:p-5
            transition hover:border-gray-300
          "
        >
          <ReviewCard
            title={review.title}
            artist={review.artist}
            rating={review.rating ?? 0}
            snippet={review.content || "No review text yet."}
            image={review.image}
            trackId={review.trackId}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="min-w-0 text-xs text-gray-400">
              <span>@{review.username || "anonymous"}</span>
              <a
                href={`../profile/${review.username}`}
                className="ml-2 inline-flex items-center gap-1 font-medium text-green-600 hover:text-green-700"
              >
                view profile
                <FiExternalLink size={12} />
              </a>
            </div>
            <button
              onClick={async () => {
                if (!user) {
                  alert("Harus login untuk like");
                  return;
                }
                try {
                  await toggleReviewLike(review.id);
                } catch (error) {
                  alert(error?.message || "Gagal update like");
                }
              }}
              className={`text-xs flex items-center gap-1 transition ${
                review.likedByMe
                  ? "text-green-600"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              {review.likedByMe ? (
                <FaHeart size={20} />
              ) : (
                <FaRegHeart size={20} />
              )}
              <span className="text-sm">{review.likes}</span>
            </button>
          </div>
        </article>
      ))}

      {totalPages > 1 ? (
        <div className="flex items-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-3 py-1 rounded-full text-xs md:text-sm border ${
                  pageNumber === page
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-500"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-400">
    {text}
  </div>
);

export default CommunityFeed;

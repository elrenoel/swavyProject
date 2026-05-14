import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewContext";

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
    return (
      <div className="text-sm text-gray-400 mt-6">
        Belum ada konten untuk tab ini.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-sm text-gray-400 mt-6">Loading...</div>;
  }

  if (!pagedReviews.length) {
    return (
      <div className="text-sm text-gray-400 mt-6">
        Belum ada review terbaru.
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {pagedReviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-xl bg-white">
          <div className="flex gap-3 items-center">
            {review.image ? (
              <img src={review.image} className="w-12 h-12 rounded" />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100" />
            )}
            <div>
              <p className="font-semibold">{review.title}</p>
              <p className="text-xs text-gray-400">{review.artist}</p>
              {review.albumType !== "single" && review.albumName ? (
                <p className="text-xs text-gray-400">{review.albumName}</p>
              ) : null}
              <p className="text-xs text-gray-400">
                @{review.username || "anonymous"}
              </p>
            </div>
          </div>

          <p className="mt-2 text-green-500">{"★".repeat(review.rating)}</p>

          <p className="text-sm mt-2">{review.content}</p>

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
            className={`text-xs mt-2 ${
              review.likedByMe ? "text-green-600" : "text-gray-500"
            }`}
          >
            {review.likedByMe ? "💚" : "❤️"} {review.likes}
          </button>
        </div>
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

export default CommunityFeed;

import { useReviews } from "../../context/ReviewContext";

const CommunityFeed = () => {
  const { reviews, likeReview } = useReviews();

  return (
    <div className="space-y-6">
      {reviews.map(r => (
        <div key={r.id} className="p-4 border rounded-xl bg-white">

          <div className="flex gap-3 items-center">
            <img src={r.image} className="w-12 h-12 rounded" />
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-gray-400">{r.artist}</p>
            </div>
          </div>

          <p className="mt-2 text-green-500">
            {"★".repeat(r.rating)}
          </p>

          <p className="text-sm mt-2">{r.content}</p>

          <button
            onClick={() => likeReview(r.id)}
            className="text-xs text-gray-500 mt-2"
          >
            ❤️ {r.likes}
          </button>

        </div>
      ))}
    </div>
  );
};

export default CommunityFeed;
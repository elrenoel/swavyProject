import React, { useEffect, useState } from "react";
import ReviewCard from "../CuratedEditorial/ReviewCard";
import { getPopularReviews } from "../../../services/review";

const PopularReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularReviews({ limit: 4, days: 7 });
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load popular reviews", error);
        setReviews([]);
      }
    };

    fetchPopular();
  }, []);

  return (
    <div
      className="w-full
  lg:max-w-87.5
  xl:max-w-100"
    >
      <h2 className="text-2xl font-[Liberation_Serif] text-gray-900 mb-6">
        Popular Reviews
      </h2>

      <div className="flex flex-col gap-6 mb-8">
        {reviews.length ? (
          reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              title={review.title}
              artist={review.artist}
              rating={review.rating ?? 0}
              snippet={review.content || "No review text yet."}
              isGray={index % 2 === 1}
              image={review.image_url}
              trackId={review.track_id}
            />
          ))
        ) : (
          <p className="text-sm text-gray-400">No popular reviews yet.</p>
        )}
      </div>

      <button className="font-[Manrope] w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase py-3 md:py-4 rounded-md transition">
        <a href="/community">View All Reviews</a>
      </button>
    </div>
  );
};

export default PopularReviews;

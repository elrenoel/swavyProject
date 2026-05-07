import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createReview as createReviewRequest,
  getRecentReviews,
  toggleReviewLike as toggleReviewLikeRequest,
} from "../services/review";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const mapReview = (review) => ({
    id: review.id,
    trackId: review.track_id,
    title: review.title,
    username: review.username,
    artist: review.artist,
    image: review.image_url,
    albumId: review.album_id,
    albumName: review.album_name,
    albumType: review.album_type,
    rating: review.rating,
    content: review.content,
    userId: review.user_id,
    likes: review.likes_count || 0,
    likedByMe: !!review.liked_by_me,
    createdAt: review.created_at,
  });

  const refreshReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRecentReviews();
      const nextReviews = Array.isArray(data?.reviews)
        ? data.reviews.map(mapReview)
        : [];
      setReviews(nextReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReview = useCallback(async (reviewPayload) => {
    const created = await createReviewRequest(reviewPayload);
    if (created) {
      const mapped = mapReview(created);
      setReviews((prev) => {
        const filtered = prev.filter((item) => item.id !== mapped.id);
        return [mapped, ...filtered];
      });
      setPage(1);
    }
    return created;
  }, []);

  const likeReview = useCallback((id) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? { ...review, likes: (review.likes || 0) + 1 }
          : review,
      ),
    );
  }, []);

  const toggleReviewLike = useCallback(async (id) => {
    const result = await toggleReviewLikeRequest(id);
    setReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              likes: result.likes_count,
              likedByMe: result.liked,
            }
          : review,
      ),
    );
    return result;
  }, []);

  useEffect(() => {
    refreshReviews();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(reviews.length / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pageSize, reviews.length]);

  const value = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
    const startIndex = (page - 1) * pageSize;
    const pagedReviews = reviews.slice(startIndex, startIndex + pageSize);

    return {
      reviews,
      pagedReviews,
      page,
      pageSize,
      totalPages,
      isLoading,
      refreshReviews,
      createReview,
      likeReview,
      toggleReviewLike,
      setPage,
    };
  }, [
    createReview,
    isLoading,
    likeReview,
    page,
    pageSize,
    refreshReviews,
    reviews,
    toggleReviewLike,
  ]);

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewContext);

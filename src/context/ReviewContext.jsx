import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  createReview as createReviewRequest,
  updateReview as updateReviewRequest,
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

  const updateReview = useCallback(async (reviewId, reviewPayload) => {
    const updated = await updateReviewRequest(reviewId, reviewPayload);
    if (updated) {
      const mapped = mapReview(updated);
      setReviews((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
    }
    return updated;
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

  const pendingToggles = useRef({});

  const toggleReviewLike = useCallback((id) => {
    // 1. Optimistic Update
    setReviews((prev) =>
      prev.map((review) => {
        if (review.id === id) {
          const nextLiked = !review.likedByMe;
          const nextLikes = nextLiked
            ? (review.likes || 0) + 1
            : Math.max((review.likes || 0) - 1, 0);
          return { ...review, likedByMe: nextLiked, likes: nextLikes };
        }
        return review;
      }),
    );

    // 2. Debounce and track clicks
    if (pendingToggles.current[id]) {
      clearTimeout(pendingToggles.current[id].timer);
      pendingToggles.current[id].clicks += 1;
    } else {
      pendingToggles.current[id] = { clicks: 1 };
    }

    // 3. Wait 1 second before sending request
    pendingToggles.current[id].timer = setTimeout(async () => {
      const clicks = pendingToggles.current[id].clicks;
      delete pendingToggles.current[id];

      // Only send to backend if odd number of clicks (net state changed)
      if (clicks % 2 !== 0) {
        try {
          const result = await toggleReviewLikeRequest(id);
          // Sync with true backend state
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
        } catch (error) {
          console.error("Failed to sync like with server:", error);
          // Revert optimistic update
          setReviews((prev) =>
            prev.map((review) => {
              if (review.id === id) {
                // If it failed, we just flip the boolean back. 
                // We don't know the true backend count, so we just undo our own offset.
                // An even better way is to pass the original state into the timeout,
                // but just flipping back is usually enough.
                const revertedLiked = !review.likedByMe;
                const revertedLikes = revertedLiked
                  ? (review.likes || 0) + 1
                  : Math.max((review.likes || 0) - 1, 0);
                return { ...review, likedByMe: revertedLiked, likes: revertedLikes };
              }
              return review;
            }),
          );
          
          if (error.message?.toLowerCase().includes("unauthorized") || error.message?.includes("401")) {
            alert("Sesi login kamu sudah habis, silakan login ulang untuk memberi like.");
          } else {
            alert("Gagal mengupdate like. Silakan coba lagi.");
          }
        }
      }
    }, 1000);
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
      updateReview,
      likeReview,
      toggleReviewLike,
      setPage,
    };
  }, [
    createReview,
    updateReview,
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

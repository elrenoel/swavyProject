import { createContext, useContext, useEffect, useState } from "react";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("reviews");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review) => {
    setReviews(prev => [review, ...prev]);
  };

  const likeReview = (id) => {
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r)
    );
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, likeReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewContext);
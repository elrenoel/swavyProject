import React from "react";
import album from "../../../assets/images/homebg.png";

const ReviewCard = ({
  title,
  artist,
  rating,
  snippet,
  isGray,
  image,
  trackId,
}) => {
  const ratingValue = Number(rating) || 0;
  const ratingClass = (() => {
    if (ratingValue >= 5) return "bg-[#1DB954]";
    if (ratingValue >= 4) return "bg-[#34D399]";
    if (ratingValue >= 3) return "bg-[#F59E0B]";
    if (ratingValue >= 2) return "bg-[#FB7185]";
    if (ratingValue >= 1) return "bg-[#EF4444]";
    return "bg-gray-300 text-gray-700";
  })();
  return (
    <div className="flex items-start gap-4 group cursor-pointer w-full min-w-0">
      {/* Cover Album Kecil */}
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded shrink-0 flex items-center justify-center text-xs text-gray-400 group-hover:scale-105 transition">
        <a href={`../track/${trackId}`}>
          <img
            className="w-full h-full object-cover rounded-md"
            src={image || album}
            alt=""
          />
        </a>
      </div>

      {/* Info Ulasan */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h4 className="text-sm font-bold text-gray-900 leading-none mb-1 truncate">
              {title}
            </h4>
            <p className="text-xs text-gray-500 truncate">{artist}</p>
          </div>
          {/* Badge Rating */}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${ratingClass}`}
          >
            {ratingValue || rating}
          </span>
        </div>
        <p className="text-xs text-gray-500 italic line-clamp-2 overflow-hidden break-all">
          {snippet}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;

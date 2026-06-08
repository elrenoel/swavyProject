import { useNavigate } from "react-router-dom";

const ProfileAlbumCard = ({ review }) => {
  const navigate = useNavigate();
  const trackId = review?.track_id;

  return (
    <button
      type="button"
      onClick={() => {
        if (trackId) navigate(`/track/${trackId}`);
      }}
      className="group min-w-0 text-left"
      disabled={!trackId}
    >
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-100 transition group-hover:border-gray-300">
        <img
          src={review?.image || review?.image_url || "https://picsum.photos/200"}
          className="h-30 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-35 md:h-40"
          alt=""
        />
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-gray-950">
        {review?.title || "Untitled"}
      </p>
      <p className="mt-1 truncate text-xs text-gray-400">
        {review?.artist || "Unknown artist"}
      </p>
    </button>
  );
};

export default ProfileAlbumCard;

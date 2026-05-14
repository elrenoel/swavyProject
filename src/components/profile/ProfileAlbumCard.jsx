const ProfileAlbumCard = ({ review }) => {
  return (
    <div className="space-y-2">
      <img
        src={review?.image || review?.image_url || "https://picsum.photos/200"}
        className="w-full
      h-30 sm:h-35 md:h-40
      object-cover
      rounded-lg"
      />

      <p className="text-xs sm:text-sm font-medium">
        {review?.title || "Untitled"}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400">
        {review?.artist || "Unknown artist"}
      </p>
    </div>
  );
};

export default ProfileAlbumCard;

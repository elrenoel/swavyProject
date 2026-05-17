import ProfileAlbumCard from "./ProfileAlbumCard";

const ProfileTopPicks = ({ reviews = [], onViewAll }) => {
  const visibleReviews = reviews.slice(0, 4);

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row
    sm:justify-between
    gap-2
    mb-4"
      >
        <h2 className="text-lg md:text-xl font-['Newsreader']">The Top 4</h2>
        {reviews.length > 4 && (
          <button
            onClick={onViewAll}
            className="text-xs md:text-sm text-gray-400 cursor-pointer hover:text-black transition"
          >
            VIEW ALL
          </button>
        )}
      </div>

      {visibleReviews.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {visibleReviews.map((review) => (
            <ProfileAlbumCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      )}
    </div>
  );
};

export default ProfileTopPicks;

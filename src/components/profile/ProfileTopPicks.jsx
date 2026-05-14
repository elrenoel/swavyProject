import ProfileAlbumCard from "./ProfileAlbumCard";

const ProfileTopPicks = ({ reviews = [] }) => {
  return (
    <div>
      <div
        className="flex flex-col sm:flex-row
    sm:justify-between
    gap-2
    mb-4"
      >
        <h2 className="text-lg md:text-xl font-['Newsreader']">The Top 4</h2>
        <span className="text-xs md:text-sm text-gray-400">VIEW ALL</span>
      </div>

      {reviews.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {reviews.map((review) => (
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

import ProfileAlbumCard from "./ProfileAlbumCard";

const ProfileTopPicks = ({ reviews = [], onViewAll }) => {
  const visibleReviews = reviews.slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
            Reviews
          </p>
          <h2 className="font-['Newsreader'] text-2xl text-gray-950">
            The Top 4
          </h2>
        </div>

        {reviews.length > 0 ? (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-full px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-950"
          >
            View All
          </button>
        ) : null}
      </div>

      {visibleReviews.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {visibleReviews.map((review) => (
            <ProfileAlbumCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-400">
          No reviews yet.
        </div>
      )}
    </section>
  );
};

export default ProfileTopPicks;

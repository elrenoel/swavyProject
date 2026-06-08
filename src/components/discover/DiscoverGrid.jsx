import DiscoverCard from "./DiscoverCard";

const DiscoverGrid = ({ tracks = [], loading, activeTab }) => {
  const skeletons = Array.from({ length: 6 });

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((_, index) => (
          <div
            key={`discover-skeleton-${index}`}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-gray-100" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm font-medium text-gray-600">No results found</p>
        <p className="mt-1 text-sm text-gray-400">
          Try another mood or category.
        </p>
      </div>
    );
  }

  let sorted = [...tracks];

  if (activeTab === "trending") {
    sorted.sort((a, b) => b.popularity - a.popularity);
  }

  if (activeTab === "fresh") {
    sorted.sort(
      (a, b) => new Date(b.album.release_date) - new Date(a.album.release_date),
    );
  }

  if (activeTab === "top") {
    sorted.sort((a, b) => b.popularity - a.popularity);
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((track, index) => (
        <DiscoverCard key={track.id} track={track} rank={index + 1} />
      ))}
    </div>
  );
};

export default DiscoverGrid;

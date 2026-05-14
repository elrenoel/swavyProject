import DiscoverCard from "./DiscoverCard";

const DiscoverGrid = ({ tracks = [], loading, activeTab }) => {
  const skeletons = Array.from({ length: 6 });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:w-150 md:w-200 lg:w-300">
        {skeletons.map((_, index) => (
          <div
            key={`discover-skeleton-${index}`}
            className="space-y-3 rounded-xl animate-pulse"
          >
            <div className="h-65 w-full rounded-xl bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!tracks.length) {
    return <p className="text-center text-gray-400">No results</p>;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {sorted.map((track, index) => (
        <DiscoverCard key={track.id} track={track} rank={index + 1} />
      ))}
    </div>
  );
};

export default DiscoverGrid;

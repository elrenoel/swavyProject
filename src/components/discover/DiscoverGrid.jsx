import DiscoverCard from "./DiscoverCard";

const DiscoverGrid = ({ tracks = [], loading, activeTab }) => {

  if (loading) {
    return <p className="p-20 text-center">Loading...</p>;
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
      (a, b) =>
        new Date(b.album.release_date) - new Date(a.album.release_date)
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
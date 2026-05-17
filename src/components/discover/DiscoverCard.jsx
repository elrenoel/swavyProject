const DiscoverCard = ({ track, rank }) => {
  return (
    <div
      className={`
        space-y-3 cursor-pointer group relative rounded-xl
        ${rank <= 3 ? "ring-2 ring-green-500" : ""}
        ${rank === 1 ? "bg-yellow-500/10" : ""}
        ${rank === 2 ? "bg-gray-400/10" : ""}
        ${rank === 3 ? "bg-orange-500/10" : ""}
      `}
    >
      {/* 🔥 RANK BADGE */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="
          bg-black/80 text-white text-xs px-2 py-1 rounded
          font-semibold
        "
        >
          #{rank}
        </span>
      </div>

      {/* IMAGE */}
      <div className="overflow-hidden rounded-xl">
        <img
          src={track.album.images[0]?.url}
          className="w-full h-65 object-cover group-hover:scale-105 transition"
        />
      </div>

      {/* INFO */}
      <div className="px-2 pb-2">
        <h3 className="text-lg font-medium line-clamp-1">{track.name}</h3>

        <p className="text-sm text-gray-500 line-clamp-1">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
    </div>
  );
};

export default DiscoverCard;

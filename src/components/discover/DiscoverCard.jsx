import { useNavigate } from "react-router-dom";

const DiscoverCard = ({ track, rank }) => {
  const navigate = useNavigate();
  const image = track.album.images[0]?.url;
  const artists = track.artists.map((artist) => artist.name).join(", ");

  return (
    <button
      type="button"
      onClick={() => navigate(`/track/${track.id}`)}
      className={`
        group relative overflow-hidden rounded-2xl border bg-white text-left transition
        ${rank <= 3 ? "border-green-500" : "border-gray-100 hover:border-gray-300"}
      `}
    >
      <div className="absolute left-3 top-3 z-10">
        <span className="rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
          #{rank}
        </span>
      </div>

      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={image}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          alt=""
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-950 md:text-lg">
          {track.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-gray-500">{artists}</p>
      </div>
    </button>
  );
};

export default DiscoverCard;

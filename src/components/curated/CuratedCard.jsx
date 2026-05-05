import { useNavigate } from "react-router-dom";

const CuratedCard = ({ list }) => {
  const navigate = useNavigate();
  // ambil max 3 gambar dari lagu di list
  const images = list.songs.slice(0, 3);

  return (
    <div
      onClick={() => navigate(`/list/${list.id}`)}
      className="space-y-3 md:space-y-4 cursor-pointer group">

      {/* IMAGE STACK */}
      <div className="relative w-full aspect-square max-w-[200px]">

        {images[2] && (
          <img
            src={images[2].image}
            className="absolute top-4 left-4 w-full h-full object-cover rounded-lg opacity-60 transition group-hover:top-6 group-hover:left-6"
          />
        )}

        {images[1] && (
          <img
            src={images[1].image}
            className="absolute top-2 left-2 w-full h-full object-cover rounded-lg opacity-80 transition"
          />
        )}

        {images[0] && (
          <img
            src={images[0].image}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-lg transition group-hover:scale-105"
          />
        )}

        {/* fallback kalau belum ada lagu */}
        {images.length === 0 && (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            No songs
          </div>
        )}
      </div>

      {/* TEXT */}
      <div>
        <p className="text-xs text-green-600 tracking-widest">
          CUSTOM LIST
        </p>

        <h3 className="text-base md:text-lg lg:text-xl font-['Newsreader'] mt-2 text-gray-900">
          {list.title}
        </h3>

        <p className="font-['Manrope'] text-xs md:text-sm text-[#3D4A3D]">
          {list.desc || "No description"} • {list.songs.length} songs
        </p>
      </div>

    </div>
  );
};

export default CuratedCard;
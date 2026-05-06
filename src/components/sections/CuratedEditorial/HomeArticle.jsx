import heroimg from "../../../assets/images/heroimg.png";
import album from "../../../assets/images/homebg.png";

const HomeArticle = () => {
  return (
    <div className="flex-1">
      <h2 className="text-2xl font-[Liberation_Serif] text-gray-900 mb-6">
        Curated Editorial
      </h2>

      {/* Kartu Utama (Besar) */}
      <div
        className="relative w-full
  h-55 sm:h-70 md:h-90
  rounded-2xl overflow-hidden
  group cursor-pointer mb-6 shadow-md"
      >
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <img className="w-full h-full object-cover" src={album} alt="" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
        <div
          className="absolute bottom-0 left-0
  p-4 md:p-8
  w-full md:w-4/5"
        >
          <p className="text-[#1DB954] text-xs font-bold tracking-widest uppercase mb-2">
            Deep Dive
          </p>
          <h3
            className="text-xl sm:text-2xl md:text-3xl
  font-serif text-white
  leading-tight mb-3"
          >
            The Analog Renaissance: Why Vinyl Still Matters in 2024
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            An exploration of tactile sound and the human need for physical
            media.
          </p>
        </div>
      </div>

      {/* 2 Kartu Kecil di Bawah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition cursor-pointer">
          <div className="text-[#1DB954] mb-4">✨</div>
          <h4 className="text-lg font-[Liberation_Serif] text-gray-900 mb-2 leading-snug">
            Underground Seoul: The New wave of K-Indie
          </h4>
          <p className="font-[Manrope] text-gray-500 text-xs mb-6">
            Discover the artists breaking away from the pop machine.
          </p>
          <span className="font-[Manrope] text-xs font-bold text-gray-500 tracking-widest uppercase hover:text-[#1DB954] transition">
            Read Article
          </span>
        </div>

        <div className="bg-[#0f7632] rounded-2xl p-6 text-white hover:bg-[#0c6129] transition shadow-md cursor-pointer">
          <div className="text-white/80 mb-4">≡</div>
          <h4 className="text-lg font-[Liberation_Serif] mb-2 leading-snug">
            The Essential Ambient 100
          </h4>
          <p className="font-[Manrope] text-white/80 text-xs mb-6">
            From Eno to Basinski, the definitive list for focus and reflection.
          </p>
          <span className="font-[Manrope] text-xs font-bold tracking-widest uppercase hover:text-white/80 transition">
            Explore List
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeArticle;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddToListModal from "../sections/AddToListModal";

const Navbar = ({ setCurrentTrack }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  // const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const openModal = (song) => {
    setSelectedSong(song);
  };

  const handleSearch = async (keyword) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/search?q=${keyword}`
      );

      const data = await res.json();

      const tracks = data.tracks;
      if (!tracks) return;

      const formatted = tracks.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        type: "SONG",
        image: track.album.images[0]?.url,
        albumId: track.album.id,
        preview: track.preview_url
      }));

      setResults(formatted);

    } catch (err) {
      console.error(err);
    }
  };
  const handlePlay = (item) => {
    // stop kalau lagi play
    if (currentAudio) {
      currentAudio.pause();
    }

    // kalau klik lagu yang sama → stop
    if (playingId === item.id) {
      setPlayingId(null);
      setCurrentAudio(null);
      return;
    }

    // kalau tidak ada preview
    if (!item.preview) {
      alert("No preview available");
      return;
    }

    const audio = new Audio(item.preview);
    audio.play();

    setCurrentAudio(audio);
    setPlayingId(item.id);

    audio.onended = () => {
      setPlayingId(null);
      setCurrentAudio(null);
    };
  };

  useEffect(() => {
  const handleClick = (e) => {
    if (!e.target.closest(".search-box")) {
      setIsSearchOpen(false);
    }
  };

  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);

  useEffect(() => {
  const delay = setTimeout(() => {
    if (query) {
      handleSearch(query);
      setIsSearchOpen(true);
    } else {
      setResults([]);
      setIsSearchOpen(false);
    }
  }, 300);

  return () => clearTimeout(delay);
}, [query]);

  return (
    <nav className="
      flex items-center justify-between
      px-4 md:px-10
      py-4
      bg-white border-b border-gray-100
      sticky top-0 z-50
    ">

      {/* LOGO */}
      <div className="text-xl md:text-2xl font-bold tracking-tighter">
        Swavy<span className="text-[#1DB954]">.</span>
      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
        <a href="/" className="hover:text-[#1DB954]">Home</a>
        <a href="/discover" className="hover:text-[#1DB954]">Discover</a>
        <a href="/list" className="hover:text-[#1DB954]">Lists</a>
        <a href="/community" className="hover:text-[#1DB954]">Community</a>
        <a href="/profile" className="hover:text-[#1DB954]">Profile</a>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* SEARCH (desktop only) */}
        <div className="relative search-box">

          {/* INPUT */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setIsSearchOpen(value.length > 0);
            }}
            placeholder="Search..."
            className="
              hidden md:block
              bg-gray-50 border border-gray-200
              text-sm rounded-full px-4 py-2 w-40
            "
          />

          {/* OVERLAY */}
          {isSearchOpen && (
            <div className="
                absolute top-full right-0 mt-2
                w-[90vw] max-w-[500px]
                bg-white rounded-xl shadow-lg
                p-4 z-50
              ">

              <p className="text-xs text-gray-400 mb-3">
                Search Results
              </p>

              <div className="space-y-3">
                {/* kalau ada hasil */}
                {results.length > 0 ? (
                  results.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/album/${item.albumId}`);
                        setIsSearchOpen(false);
                      }}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                    >

                      {/* LEFT */}
                      <div className="flex gap-3 items-center">
                        <img src={item.image} className="w-10 h-10 rounded-md" />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-400">
                            {item.artist}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(item); // nanti kita pakai ini
                        }}
                        className="text-blue-500 text-xs"
                      >
                        + Add
                      </button>

                      {/* RIGHT (PLAY BUTTON) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 🔥 penting biar ga navigate
                          setCurrentTrack(item.id);
                        }}
                        className="text-green-600 text-xs"
                      >
                        {playingId === item.id ? "⏸" : "▶"}
                      </button>

                    </div>
                  ))
                ) : (
                  /* fallback */
                  <p className="text-sm text-gray-400 line-clamp-2 break-words">
                    No results for "{query}"
                  </p>
                )}
              </div>

              <div className="text-center mt-4">
                <button className="text-xs text-green-600 tracking-widest">
                  SEE ALL RESULTS
                </button>
              </div>

            </div>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="
          absolute top-full left-0 w-full
          bg-white border-t
          flex flex-col items-center gap-4 py-6
          md:hidden
        ">
          <a href="/">Home</a>
          <a href="/discover">Discover</a>
          <a href="/list">Lists</a>
          <a href="/community">Community</a>
          <a href="/profile">Profile</a>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-gray-50 border px-4 py-2 rounded-full w-3/4"
          />
        </div>
      )}

      {selectedSong && (
        <AddToListModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </nav>
  );
};

export default Navbar;
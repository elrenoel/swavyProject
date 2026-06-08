import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AddToListModal from "../sections/AddToListModal";
import { useAuth } from "../../context/AuthContext";
import { IoPauseCircleOutline, IoPlayCircleOutline } from "react-icons/io5";
import { searchSpotify } from "../../services/spotify";

const Navbar = ({ setCurrentTrack }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ albums: [], tracks: [] });
  const navigate = useNavigate();
  const { user, profile, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const searchCache = useRef({});
  const profileHref = profile?.username
    ? `/profile/${profile.username}`
    : user?.user_metadata?.username
      ? `/profile/${user.user_metadata.username}`
      : "/profile";

  const playInEmbed = (trackId) => {
    setCurrentTrack(null);
    setTimeout(() => setCurrentTrack(trackId), 0);
  };

  const openModal = (song) => {
    setSelectedSong(song);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const handleSearch = async (keyword, signal) => {
    // Cek apakah hasil search untuk kata ini sudah ada di cache
    if (searchCache.current[keyword]) {
      console.log(`Using cache for: ${keyword}`);
      setResults(searchCache.current[keyword]);
      return;
    }

    try {
      const data = await searchSpotify(keyword, signal);

      const albums = Array.isArray(data.albums) ? data.albums : [];
      const tracks = Array.isArray(data.tracks) ? data.tracks : [];

      const formattedAlbums = albums.map((album) => ({
        id: album.id,
        title: album.name,
        artist: album.artists.map((a) => a.name).join(", "),
        type: "ALBUM",
        image: album.images[0]?.url,
        albumType: album.album_type,
      }));

      const formattedTracks = tracks.map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        type: "SONG",
        image: track.album.images[0]?.url,
        albumId: track.album.id,
        albumName: track.album.name,
        albumType: track.album.album_type,
        preview: track.preview_url,
      }));

      const finalResults = { albums: formattedAlbums, tracks: formattedTracks };

      // 2. Simpan hasil ke cache sebelum update state
      searchCache.current[keyword] = finalResults;
      setResults(finalResults);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Request dibatalkan karena user ngetik lagi");
      } else {
        console.error(err);
      }
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

  // Update useEffect Debounce
  useEffect(() => {
    const controller = new AbortController();

    const delay = setTimeout(() => {
      // Tambahkan syarat minimal karakter (misal: minimal 3 huruf)
      // agar tidak fetch untuk query yang terlalu umum/pendek
      if (query && query.length > 2) {
        handleSearch(query, controller.signal);
        setIsSearchOpen(true);
      } else {
        setResults({ albums: [], tracks: [] });
        setIsSearchOpen(false);
      }
    }, 600);

    return () => {
      delay && clearTimeout(delay);
      controller.abort(); // Batalkan request jika user ngetik lagi
    };
  }, [query]);

  return (
    <nav
      className="
      flex flex-col md:flex-row md:items-center
      justify-between
      px-4 md:px-10
      py-4
      bg-white
      sticky top-0 z-50
      gap-5
    "
    >
      <div className="flex items-center justify-between md:justify-start gap-5 md:gap-10 flex-1">
        {/* LOGO */}
        <div className="text-2xl md:text-3xl font-bold tracking-tighter">
          <a href="/">
            Swavy<span className="text-[#1DB954]">.</span>
          </a>
        </div>

        {/* SEARCH */}
        <div className="relative search-box flex-1 hidden md:block">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setIsSearchOpen(value.length > 0);
            }}
            placeholder="Search Track Song or Album"
            className=" bg-gray-100 text-sm rounded-full px-4 py-4 md:px-5 md:py-4 w-full outline-green-200"
          />

          {/* OVERLAY */}
          {isSearchOpen && (
            <div
              className="
                absolute top-full  mt-2
                w-full 
                bg-white rounded-xl shadow-lg
                p-4 z-50
              "
            >
              <p className="text-xs text-gray-400 mb-3">Search Results</p>

              <div className="space-y-3">
                {/* kalau ada hasil */}
                {results.albums.length + results.tracks.length > 0 ? (
                  <>
                    {results.albums.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/album/${item.id}`);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                      >
                        <div className="flex gap-3 items-center">
                          <img
                            src={item.image}
                            className="w-10 h-10 rounded-md"
                          />
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-gray-400">
                              {item.artist}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-400 flex-1 text-right">
                          ALBUM
                        </span>
                      </div>
                    ))}

                    {results.tracks.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/track/${item.id}`);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                      >
                        <div className="flex gap-3 items-center flex-2">
                          <img
                            src={item.image}
                            className="w-10 h-10 rounded-md"
                          />
                          <div className="flex flex-col flex-wrap">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-gray-400">
                              {item.artist}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(item);
                          }}
                          className="text-blue-500 text-xs py-2 px-4 rounded-full mr-4 hover:bg-gray-300"
                        >
                          + Add to list
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playInEmbed(item.id);
                          }}
                          className="text-black p-1 hover:bg-gray-300 rounded-full"
                        >
                          {playingId === item.id ? (
                            <IoPauseCircleOutline size={24} />
                          ) : (
                            <IoPlayCircleOutline size={24} />
                          )}
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  /* fallback */
                  <p className="text-sm text-gray-400 line-clamp-2 wrap-break-word">
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
          className="md:hidden text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className="relative search-box block md:hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setIsSearchOpen(value.length > 0);
          }}
          placeholder="Search Track Song or Album"
          className=" bg-gray-100 text-sm rounded-full px-4 py-4 md:px-5 md:py-4 w-full outline-green-200"
        />

        {/* OVERLAY */}
        {isSearchOpen && (
          <div
            className="
                absolute top-full  mt-2
                w-full 
                bg-white rounded-xl shadow-lg
                p-4 z-50
              "
          >
            <p className="text-xs text-gray-400 mb-3">Search Results</p>

            <div className="space-y-3">
              {/* kalau ada hasil */}
              {results.albums.length + results.tracks.length > 0 ? (
                <>
                  {results.albums.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/album/${item.id}`);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.image}
                          className="w-10 h-10 rounded-md"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.artist}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-400 flex-1 text-right">
                        ALBUM
                      </span>
                    </div>
                  ))}

                  {results.tracks.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/track/${item.id}`);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
                    >
                      <div className="flex gap-3 items-center flex-2">
                        <img
                          src={item.image}
                          className="w-10 h-10 rounded-md"
                        />
                        <div className="flex flex-col flex-wrap">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.artist}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(item);
                        }}
                        className="text-blue-500 text-xs py-2 px-4 rounded-full mr-4 hover:bg-gray-300"
                      >
                        + Add to list
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playInEmbed(item.id);
                        }}
                        className="text-black p-1 hover:bg-gray-300 rounded-full"
                      >
                        {playingId === item.id ? (
                          <IoPauseCircleOutline size={24} />
                        ) : (
                          <IoPlayCircleOutline size={24} />
                        )}
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                /* fallback */
                <p className="text-sm text-gray-400 line-clamp-2 wrap-break-word">
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

      {/* RIGHT SIDE (desktop) */}
      <div className="hidden md:flex items-center gap-5 md:flex-1">
        <div className="md:flex-1 md:justify-center md:flex gap-10 text-[14px] font-medium text-shadow-black">
          <a href="/discover" className="hover:text-gray-500">
            Discover
          </a>
          <a href="/list" className="hover:text-gray-500">
            Lists
          </a>
          <a href="/community" className="hover:text-gray-500">
            Community
          </a>
          <a href={profileHref} className="hover:text-gray-500">
            Profile
          </a>
        </div>

        {!isLoading && user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800"
          >
            Logout
          </button>
        ) : !isLoading ? (
          <a
            href="/auth/login"
            className="hidden md:inline-flex items-center whitespace-nowrap rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800"
          >
            Sign In
          </a>
        ) : null}
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div
          className="
          absolute top-full left-0 w-full
          bg-white
          flex flex-col items-center py-6
          md:hidden
        "
        >
          <a
            className="hover:bg-gray-200 w-full py-4 text-center"
            href="/discover"
          >
            Discover
          </a>
          <a className="hover:bg-gray-200 w-full py-4 text-center" href="/list">
            Lists
          </a>
          <a
            className="hover:bg-gray-200 w-full py-4 text-center"
            href="/community"
          >
            Community
          </a>
          <a
            className="hover:bg-gray-200 w-full py-4 text-center"
            href={profileHref}
          >
            Profile
          </a>

          {!isLoading && user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 mt-5"
            >
              Logout
            </button>
          ) : !isLoading ? (
            <a
              href="/auth/login"
              className="text-sm font-medium text-gray-600 mt-5"
            >
              Sign In
            </a>
          ) : null}
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

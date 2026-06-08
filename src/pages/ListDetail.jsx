import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IoClose, IoPlayCircleOutline } from "react-icons/io5";
import { useLists } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
import {
  removeSongFromList as removeSongApi,
  getListById as getListByIdApi,
} from "../services/list";

const ListDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const { getListById } = useLists();
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadList = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getListById(id);
        if (isMounted) {
          setList(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load list");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadList();

    return () => {
      isMounted = false;
    };
  }, [getListById, id]);

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-gray-400 md:p-10">Loading list...</p>
    );
  }

  if (error) {
    return <p className="p-6 text-sm text-red-600 md:p-10">{error}</p>;
  }

  if (!list) {
    return (
      <p className="p-6 text-sm text-gray-500 md:p-10">List not found</p>
    );
  }

  const songs = Array.isArray(list.songs) ? list.songs : [];
  const songCount = songs.length;
  const songLabel = songCount === 1 ? "song" : "songs";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-600">
          Playlist
        </p>
        <h1 className="text-3xl font-bold leading-tight text-gray-950 md:text-4xl">
          {list.title}
        </h1>
        {list.desc ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            {list.desc}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-gray-400">
          {songCount} {songLabel}
        </p>
      </div>

      {songCount ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`
                flex items-center gap-4 px-4 py-3 transition hover:bg-gray-50 sm:px-5
                ${index > 0 ? "border-t border-gray-100" : ""}
              `}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <img
                  src={song.image}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  alt=""
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-950 sm:text-base">
                    {song.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {song.artist}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTrack(song.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
                >
                  <IoPlayCircleOutline size={20} />
                  <span className="hidden sm:inline">Play</span>
                </button>

                {user?.id === list.user_id && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Remove this song?")) {
                        await removeSongApi(list.id, song.id);
                        const refreshed = await getListByIdApi(list.id);
                        setList(refreshed);
                      }
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                    aria-label={`Remove ${song.title}`}
                  >
                    <IoClose size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-400">
          No songs in this list yet.
        </div>
      )}
    </section>
  );
};

export default ListDetail;

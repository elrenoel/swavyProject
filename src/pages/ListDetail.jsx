import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLists } from "../context/ListContext";
import {
  removeSongFromList as removeSongApi,
  getListById as getListByIdApi,
} from "../services/list";

const ListDetail = ({ setCurrentTrack }) => {
  const { id } = useParams();
  const { getListById } = useLists();
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
    return <p className="p-10">Loading list...</p>;
  }

  if (error) {
    return <p className="p-10 text-red-600">{error}</p>;
  }

  if (!list) {
    return <p className="p-10">List not found</p>;
  }

  return (
    <section className="px-10 py-16">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">{list.title}</h1>
        <p className="text-gray-500">{list.desc}</p>
        <p className="text-sm text-gray-400 mt-2">{list.songs.length} songs</p>
      </div>

      {/* SONG LIST */}
      <div className="space-y-4">
        {list.songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <img src={song.image} className="w-12 h-12 rounded" />
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>

            {/* RIGHT */}
            <button
              onClick={() => setCurrentTrack(song.id)}
              className="text-green-600 text-sm"
            >
              ▶ Play
            </button>

            <button
              onClick={async () => {
                if (confirm("Remove this song?")) {
                  await removeSongApi(list.id, song.id);
                  const refreshed = await getListByIdApi(list.id);
                  setList(refreshed);
                }
              }}
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListDetail;

import { useParams } from "react-router-dom";
import { useLists } from "../context/ListContext";

const ListDetail = ({setCurrentTrack}) => {
  const { id } = useParams();
  const { lists, removeSongFromList } = useLists();

  const list = lists.find(l => l.id.toString() === id);

  if (!list) {
    return <p className="p-10">List not found</p>;
  }

  return (
    <section className="px-10 py-16">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">{list.title}</h1>
        <p className="text-gray-500">{list.desc}</p>
        <p className="text-sm text-gray-400 mt-2">
          {list.songs.length} songs
        </p>
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
              className="text-green-600 text-sm">
              ▶ Play
            </button>

            <button
              onClick={() => {
                if (confirm("Remove this song?")) {
                  removeSongFromList(list.id, song.id);
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
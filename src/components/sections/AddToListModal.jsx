import { useLists } from "../../context/ListContext";

const AddToListModal = ({ song, onClose }) => {
  const { lists, addSongToList } = useLists();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-75">
        <h2 className="mb-4 font-semibold">Add to List</h2>

        <div className="space-y-2">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={async () => {
                try {
                  await addSongToList(list.id, {
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    image: song.image,
                  });
                  onClose();
                } catch (error) {
                  alert(error?.message || "Failed to add song");
                }
              }}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              {list.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;

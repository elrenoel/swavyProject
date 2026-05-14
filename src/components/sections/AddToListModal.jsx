import { useLists } from "../../context/ListContext";
import { IoClose } from "react-icons/io5";
import { RiPlayList2Fill } from "react-icons/ri";

const AddToListModal = ({ song, onClose }) => {
  const { lists, addSongToList } = useLists();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center justify-center gap-4">
            <h2 className="font-semibold">Add to List</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <IoClose size={20} />
          </button>
        </div>

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
              className="flex items-center gap-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <RiPlayList2Fill />
              {list.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;

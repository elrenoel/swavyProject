import { useState } from "react";

const CreateListModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = () => {
    if (!title) return;

    onCreate({
      id: Date.now(),
      title,
      desc,
      songs: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[300px] space-y-4">

        <h2 className="text-lg font-semibold">Create New List</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateListModal;
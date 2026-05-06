import CuratedHeader from "../components/curated/CuratedHeader";
import CuratedGrid from "../components/curated/CuratedGrid";
import CreateListModal from "../components/sections/CreateListModal";
import { useState } from "react";
import { useLists } from "../context/ListContext";

const List = () => {
  const { lists, createList, isLoading, error } = useLists();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async ({ title, desc }) => {
    await createList({ title, desc });
  };

  return (
    <section className="px-10 py-16">
      <CuratedHeader />

      <button
        onClick={() => setIsOpen(true)}
        className="mb-6 px-4 py-2 bg-green-500 text-white rounded-full"
      >
        + Create List
      </button>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="text-gray-400">Loading lists...</div>
      ) : (
        <CuratedGrid lists={lists} />
      )}

      {isOpen && (
        <CreateListModal
          onClose={() => setIsOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </section>
  );
};

export default List;

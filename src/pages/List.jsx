import CuratedHeader from "../components/curated/CuratedHeader";
import CuratedGrid from "../components/curated/CuratedGrid";
import CreateListModal from "../components/sections/CreateListModal";
import { useState } from "react";
import { useLists } from "../context/ListContext";

const List = () => {
  const { lists, setLists } = useLists();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (newList) => {
    setLists((prev) => [newList, ...prev]);
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

      <CuratedGrid lists={lists} />

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
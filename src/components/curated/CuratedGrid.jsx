import CuratedCard from "./CuratedCard";
import CuratedCTA from "./CuratedCTA";

const CuratedGrid = ({ lists = [] }) => {
  if (!lists.length) {
    return (
      <div className="text-center text-gray-400 py-10">
        No lists yet. Create your first one.
      </div>
    );
  }

  return (
    <div
      className="
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      gap-6
    "
    >
      {lists.map((list) => (
        <CuratedCard key={list.id} list={list} />
      ))}

      <CuratedCTA />
    </div>
  );
};

export default CuratedGrid;

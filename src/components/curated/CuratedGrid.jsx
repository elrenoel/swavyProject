import CuratedCard from "./CuratedCard";
import CuratedCTA from "./CuratedCTA";

const CuratedGrid = ({
  lists = [],
  showCta = true,
  emptyMessage = "No lists yet. Create your first one.",
  gridClassName = "",
}) => {
  if (!lists.length) {
    return (
      <div className="text-center text-gray-400 py-10">{emptyMessage}</div>
    );
  }

  return (
    <div
      className={`
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      gap-6
      ${gridClassName}
    `}
    >
      {lists.map((list) => (
        <CuratedCard key={list.id} list={list} />
      ))}
      {showCta ? <CuratedCTA /> : null}
    </div>
  );
};

export default CuratedGrid;

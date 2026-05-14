import { useMemo, useState } from "react";
import CuratedGrid from "../curated/CuratedGrid";

const ProfileCollection = ({ lists = [], total = 0 }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleLists = useMemo(
    () => (showAll ? lists : lists.slice(0, 4)),
    [lists, showAll],
  );
  const hasMore = total > 4 && !showAll;

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row
    sm:justify-between
    gap-3
    mb-4"
      >
        <h2 className="text-sm md:text-base font-semibold">
          RECENT COLLECTION
        </h2>
      </div>

      <CuratedGrid
        lists={visibleLists}
        showCta={false}
        emptyMessage="No collections yet."
        gridClassName="grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
      />

      {hasMore ? (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="px-4 md:px-6
  py-2
  border
  rounded-full
  text-xs md:text-sm"
          >
            LOAD ENTIRE COLLECTION
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileCollection;

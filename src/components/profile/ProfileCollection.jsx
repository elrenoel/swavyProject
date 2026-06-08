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
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
            Lists
          </p>
          <h2 className="text-lg font-semibold text-gray-950 md:text-xl">
            Recent Collection
          </h2>
        </div>
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
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
          >
            Load Entire Collection
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default ProfileCollection;

import React from "react";
import AlbumCard from "./AlbumCard";
import AlbumCardSkeleton from "./AlbumCardSkeleton";

const AlbumList = ({ releases, loading, listRef }) => {
  return (
    <div
      ref={listRef}
      className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide"
    >
      {/* Kondisi jika data sedang dimuat */}
      {loading
        ? Array(6)
            .fill(0)
            .map((_, i) => <AlbumCardSkeleton key={i} />)
        : /* Kondisi jika data sudah tersedia */
          releases.map((item) => (
            <AlbumCard
              key={item.id}
              image={item.images[0]?.url}
              title={item.name}
              artist={item.artists.map((a) => a.name).join(", ")}
            />
          ))}
    </div>
  );
};

export default AlbumList;

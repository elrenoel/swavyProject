import React, { useEffect, useMemo, useRef } from "react";
import AlbumCard from "./AlbumCard";
import AlbumCardSkeleton from "./AlbumCardSkeleton";

const AlbumList = ({ releases, loading, listRef }) => {
  const isPausedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(null);
  const loopedReleases = useMemo(
    () => (releases.length ? [...releases, ...releases] : []),
    [releases],
  );

  useEffect(() => {
    const container = listRef.current;
    if (!container || loading || releases.length === 0) return undefined;

    const speed = 36;

    const step = (time) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = time;
      }

      const delta = time - lastFrameTimeRef.current;
      lastFrameTimeRef.current = time;

      const loopPoint = container.scrollWidth / 2;

      if (!isPausedRef.current && loopPoint > 0) {
        container.scrollLeft += (speed * delta) / 1000;

        if (container.scrollLeft >= loopPoint) {
          container.scrollLeft -= loopPoint;
        }
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastFrameTimeRef.current = null;
    };
  }, [listRef, loading, releases.length]);

  return (
    <div
      ref={listRef}
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
      onFocus={() => {
        isPausedRef.current = true;
      }}
      onBlur={() => {
        isPausedRef.current = false;
      }}
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:gap-6"
    >
      {/* Kondisi jika data sedang dimuat */}
      {loading
        ? Array(6)
            .fill(0)
            .map((_, i) => <AlbumCardSkeleton key={i} />)
        : /* Kondisi jika data sudah tersedia */
          loopedReleases.map((item, index) => (
            <AlbumCard
              key={`${item.id}-${index}`}
              id={item.id}
              image={item.images[0]?.url}
              title={item.name}
              artist={item.artists.map((a) => a.name).join(", ")}
            />
          ))}
    </div>
  );
};

export default AlbumList;

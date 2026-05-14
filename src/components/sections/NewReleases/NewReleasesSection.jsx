import React, { useState, useEffect, useRef } from "react";
import SectionHeader from "./SectionHeader";
import AlbumList from "./AlbumList";
import { getNewReleases } from "../../../services/spotify";

const NewReleasesSection = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchReleases = async () => {
      setLoading(true);
      const data = await getNewReleases();
      setReleases(data);
      setLoading(false);
    };

    fetchReleases();
  }, []);

  const scrollList = (direction) => {
    const container = listRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-4 md:px-10 py-10 md:py-12">
      <SectionHeader
        onScrollLeft={() => scrollList("left")}
        onScrollRight={() => scrollList("right")}
      />
      <AlbumList releases={releases} loading={loading} listRef={listRef} />
    </section>
  );
};

export default NewReleasesSection;

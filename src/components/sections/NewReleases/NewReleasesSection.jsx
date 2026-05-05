import React, { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import AlbumList from "./AlbumList";
import { getNewReleases } from "../../../services/spotify";

const NewReleasesSection = () => {

  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      setLoading(true);
      const data = await getNewReleases();
      setReleases(data);
      setLoading(false);
    };

    fetchReleases();
  }, []);

  return (
    <section className="px-4 md:px-10 py-10 md:py-12">
      <SectionHeader />
      <AlbumList releases={releases} loading={loading} />
    </section>
  );
};

export default NewReleasesSection;
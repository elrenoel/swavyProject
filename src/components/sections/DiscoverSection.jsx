import { useState,useEffect } from "react";
import { getDiscover } from "../../services/spotify";
import DiscoverGrid from "../discover/DiscoverGrid";
import DiscoverHeader from "../discover/DiscoverHeader";
import DiscoverFilter from "../discover/DiscoverFilter";
import DiscoverLoadMore from "../discover/DiscoverLoadMore";
import DiscoverTabs from "../discover/DiscoverTabs";


const DiscoverSection = () => {
  const [tracks, setTracks] = useState([]);
  const [keyword, setKeyword] = useState("top hits 2025");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDiscover(keyword);
      setTracks(data);
      setLoading(false);
    };

    fetchData();
  }, [keyword]);

  return (
    <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20 max-w-7xl mx-auto">
      <DiscoverHeader />
      <DiscoverTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <DiscoverFilter setKeyword={setKeyword} />
      <DiscoverGrid tracks={tracks} loading={loading} activeTab={activeTab} />
      <DiscoverLoadMore />
    </section>
  );
};

export default DiscoverSection;

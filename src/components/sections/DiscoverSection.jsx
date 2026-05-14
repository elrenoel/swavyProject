import { useState, useEffect, useRef } from "react";
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
  const debounceRef = useRef(null);
  const lastKeywordRef = useRef("");

  useEffect(() => {
    if (lastKeywordRef.current === keyword) {
      return;
    }

    lastKeywordRef.current = keyword;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    let isMounted = true;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await getDiscover(keyword);
      if (!isMounted) return;
      setTracks(data);
      setLoading(false);
    }, 350);

    return () => {
      isMounted = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword]);

  return (
    <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20 max-w-7xl mx-auto flex flex-col w-full">
      <DiscoverHeader />
      <DiscoverTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <DiscoverFilter setKeyword={setKeyword} />
      <DiscoverGrid tracks={tracks} loading={loading} activeTab={activeTab} />
      <DiscoverLoadMore />
    </section>
  );
};

export default DiscoverSection;

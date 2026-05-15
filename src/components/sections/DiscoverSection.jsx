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
    // Skip if the keyword hasn't changed (dedup repeated triggers).
    // NOTE: We must NOT bail out if the cleanup previously cleared the
    // pending fetch (e.g. React Strict Mode double-mount), so we reset
    // lastKeywordRef in the cleanup below.
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
      try {
        const data = await getDiscover(keyword);
        if (!isMounted) return;
        setTracks(data);
      } catch (err) {
        // getDiscover currently swallows errors and returns [].
        // This catch is a safety net for when that changes.
        console.error("DiscoverSection fetch failed:", err);
        if (!isMounted) return;
        setTracks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // Reset so the next mount with the same keyword will still fetch.
      // Without this, React Strict Mode double-mount causes the effect to
      // bail out on re-mount (keyword === lastKeywordRef) and loading
      // stays true forever — the skeleton never disappears.
      lastKeywordRef.current = "";
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

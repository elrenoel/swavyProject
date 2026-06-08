import { useState, useEffect, useRef } from "react";
import { getDiscover } from "../../services/spotify";
import DiscoverGrid from "../discover/DiscoverGrid";
import DiscoverHeader from "../discover/DiscoverHeader";
import DiscoverFilter from "../discover/DiscoverFilter";
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
    <section className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <DiscoverHeader />
      <div className="mb-8 flex flex-col gap-4 border-y border-gray-100 py-4 lg:flex-row lg:items-center lg:justify-between">
        <DiscoverTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <DiscoverFilter keyword={keyword} setKeyword={setKeyword} />
      </div>
      <DiscoverGrid tracks={tracks} loading={loading} activeTab={activeTab} />
    </section>
  );
};

export default DiscoverSection;

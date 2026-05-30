const DiscoverFilter = ({ setKeyword }) => {
  return (
    <div className="flex gap-3 flex-wrap justify-end mb-10">

      <button onClick={() => setKeyword("top hits 2025")}>
        Top Hits
      </button>

      <button onClick={() => setKeyword("viral hits")}>Viral</button>

      <button onClick={() => setKeyword("indonesia hits")}>Indo</button>

      <button onClick={() => setKeyword("tiktok songs")}>TikTok</button>

    </div>
  );
};

export default DiscoverFilter;

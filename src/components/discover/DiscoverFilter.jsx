const filters = [
  { label: "Top Hits", value: "top hits 2025" },
  { label: "Viral", value: "viral hits" },
  { label: "Indo", value: "indonesia hits" },
  { label: "TikTok", value: "tiktok songs" },
];

const DiscoverFilter = ({ keyword, setKeyword }) => {
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {filters.map((filter) => {
        const isActive = keyword === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setKeyword(filter.value)}
            className={`
              rounded-full border px-3.5 py-2 text-sm font-medium transition
              ${
                isActive
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default DiscoverFilter;

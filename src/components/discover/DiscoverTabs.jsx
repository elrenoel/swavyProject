const tabs = [
  { key: "trending", label: "Trending" },
  { key: "fresh", label: "Fresh" },
  { key: "top", label: "Top" },
];

const DiscoverTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            rounded-full px-4 py-2 text-sm font-medium transition
            ${
              activeTab === tab.key
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DiscoverTabs;

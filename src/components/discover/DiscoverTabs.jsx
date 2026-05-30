const tabs = [
  { key: "trending", label: "Trending" },
  { key: "fresh", label: "Fresh" },
  { key: "top", label: "Top" },
];

const DiscoverTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            px-4 py-2 rounded-full text-sm
            ${activeTab === tab.key
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600"}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DiscoverTabs;

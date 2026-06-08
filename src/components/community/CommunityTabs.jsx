const tabs = [
  { key: "trending", label: "Trending" },
  { key: "fresh", label: "Fresh" },
  { key: "top", label: "Following" },
];

const CommunityTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div
      className="
        flex gap-2 overflow-x-auto pb-2
        lg:flex-col lg:overflow-visible lg:pb-0
      "
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            whitespace-nowrap rounded-full px-4 py-2
            text-xs font-semibold transition
            lg:w-full lg:justify-start lg:rounded-lg lg:text-left
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

export default CommunityTabs;

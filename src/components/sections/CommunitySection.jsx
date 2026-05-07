import { useState } from "react";
import CommunityHeader from "../community/CommunityHeader";
import CommunityTabs from "../community/CommunityTabs";
import CommunityFeed from "../community/CommunityFeed";
import CommunitySidebar from "../community/CommunitySidebar";

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState("fresh");

  return (
    <section
      className="px-4 md:px-8 lg:px-12
  py-10 md:py-12
  max-w-7xl mx-auto
  grid grid-cols-1 md:grid-cols-3
  gap-8 md:gap-10"
    >
      {/* LEFT */}
      <div className="md:col-span-2">
        <CommunityHeader />
        <CommunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <CommunityFeed activeTab={activeTab} />
      </div>

      {/* RIGHT */}
      <CommunitySidebar />
    </section>
  );
};

export default CommunitySection;

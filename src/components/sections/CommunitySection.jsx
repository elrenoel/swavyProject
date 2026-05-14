import { useState } from "react";
import CommunityHeader from "../community/CommunityHeader";
import CommunityTabs from "../community/CommunityTabs";
import CommunityFeed from "../community/CommunityFeed";
import CommunitySidebar from "../community/CommunitySidebar";

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState("fresh");

  return (
    <section
      className="px-4 md:px-10 
  py-10 md:py-12
  w-full mx-auto flex flex-col md:flex-row
  gap-8 md:gap-10"
    >
      {/* LEFT */}
      <div className="md:flex-1">
        <CommunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {/* CENTER */}
      <div className="md:flex-3">
        <CommunityHeader />
        <CommunityFeed activeTab={activeTab} />
      </div>
      {/* RIGHT */}
      <div className="flex-1">
        <CommunitySidebar />
      </div>
    </section>
  );
};

export default CommunitySection;

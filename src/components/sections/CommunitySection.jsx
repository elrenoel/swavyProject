import { useState } from "react";
import CommunityHeader from "../community/CommunityHeader";
import CommunityTabs from "../community/CommunityTabs";
import CommunityFeed from "../community/CommunityFeed";
import CommunitySidebar from "../community/CommunitySidebar";

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState("fresh");

  return (
    <section
      className="
        w-full max-w-7xl mx-auto
        px-4 sm:px-6 md:px-10
        py-8 md:py-12
        grid grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)_280px]
        gap-6 lg:gap-8
      "
    >
      {/* LEFT */}
      <aside className="lg:pt-24">
        <CommunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
      {/* CENTER */}
      <main className="min-w-0">
        <CommunityHeader />
        <CommunityFeed activeTab={activeTab} />
      </main>
      {/* RIGHT */}
      <aside className="min-w-0 lg:pt-24">
        <CommunitySidebar />
      </aside>
    </section>
  );
};

export default CommunitySection;

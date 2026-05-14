import ProfileStatCard from "./ProfileStatCard";

const ProfileStats = ({ stats }) => {
  const items = [
    { label: "REVIEWS WRITTEN", value: stats?.reviewsCount ?? 0 },
    { label: "FOLLOWERS", value: stats?.followersCount ?? 0 },
    { label: "LISTS CURATED", value: stats?.listsCount ?? 0 },
    { label: "SONGS IN LISTS", value: stats?.listSongsCount ?? 0 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item, i) => (
        <ProfileStatCard key={i} {...item} />
      ))}
    </div>
  );
};

export default ProfileStats;

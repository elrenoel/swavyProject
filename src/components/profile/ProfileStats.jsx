import ProfileStatCard from "./ProfileStatCard";

const ProfileStats = ({ stats, lists = [] }) => {
  const totalSongs = lists.reduce(
    (acc, list) => acc + (list.songs?.length || 0),
    0,
  );

  const items = [
    { label: "REVIEWS WRITTEN", value: stats?.reviewsCount ?? 0 },
    { label: "FOLLOWERS", value: stats?.followersCount ?? 0 },
    { label: "LISTS CURATED", value: stats?.listsCount ?? lists.length },
    { label: "SONGS IN LISTS", value: stats?.listSongsCount ?? totalSongs },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {items.map((item, i) => (
        <ProfileStatCard key={i} {...item} />
      ))}
    </div>
  );
};

export default ProfileStats;

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLists } from "../../context/ListContext";
import ProfileHeader from "../profile/ProfileHeader";
import ProfileStats from "../profile/ProfileStats";
import ProfileTopPicks from "../profile/ProfileTopPicks";
import ProfileCollection from "../profile/ProfileCollection";
import ProfileEditModal from "../profile/ProfileEditModal";
import ProfileAllReviews from "../profile/ProfileAllReviews";
import {
  followProfile,
  getProfileByUsername,
  getProfileStats,
  getProfileTopPicks,
  getProfileLists,
  unfollowProfile,
  updateProfile,
  uploadProfileAvatar,
} from "../../services/profile";

const ProfileSkeleton = () => (
  <section
    className="px-4 md:px-8 lg:px-12
  py-10 md:py-16
  space-y-12 md:space-y-20
  max-w-7xl mx-auto"
  >
    <div className="text-center space-y-4 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
      <div className="space-y-2">
        <div className="h-6 w-40 bg-gray-200 mx-auto rounded" />
        <div className="h-4 w-24 bg-gray-200 mx-auto rounded" />
      </div>
      <div className="h-9 w-32 bg-gray-200 mx-auto rounded-full" />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`stat-skeleton-${index}`}
          className="border border-gray-200 rounded-xl p-5 bg-white"
        >
          <div className="h-6 w-16 bg-gray-200 mx-auto rounded" />
          <div className="h-3 w-20 bg-gray-200 mx-auto mt-3 rounded" />
        </div>
      ))}
    </div>

    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`top-pick-skeleton-${index}`} className="space-y-2">
            <div className="w-full h-32 bg-gray-200 rounded-lg" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`collection-skeleton-${index}`} className="space-y-2">
            <div className="w-full aspect-square bg-gray-200 rounded-lg" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProfileSection = ({ username }) => {
  const { user, refreshUser } = useAuth();
  const { lists } = useLists();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [topPicks, setTopPicks] = useState([]);
  const [profileLists, setProfileLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeView, setActiveView] = useState("overview");

  const isOwnProfile = profile?.id && user?.id === profile.id;

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!username) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const profileData = await getProfileByUsername(username);
        if (!isMounted) return;

        setProfile(profileData.profile);
        setIsFollowing(!!profileData.isFollowing);

        const [nextStats, nextTopPicks, nextLists] = await Promise.all([
          getProfileStats(username),
          getProfileTopPicks(username, 100),
          getProfileLists(username, { limit: 10 }),
        ]);

        if (!isMounted) return;

        setStats(nextStats);
        setTopPicks(nextTopPicks);
        setProfileLists(nextLists?.lists || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load profile");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile?.username) return;
    try {
      if (isFollowing) {
        await unfollowProfile(profile.username);
        setIsFollowing(false);
        setStats((prev) =>
          prev
            ? { ...prev, followersCount: Math.max(prev.followersCount - 1, 0) }
            : prev,
        );
      } else {
        await followProfile(profile.username);
        setIsFollowing(true);
        setStats((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev,
        );
      }
    } catch (err) {
      setError(err?.message || "Failed to update follow status");
    }
  };

  const handleSaveProfile = async ({ username, full_name, avatarDataUrl }) => {
    let nextProfile = profile;

    if (avatarDataUrl) {
      nextProfile = await uploadProfileAvatar(avatarDataUrl);
    }

    if (username || full_name) {
      nextProfile = await updateProfile({ username, full_name });
    }

    setProfile(nextProfile);
    await refreshUser();
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section
      className="px-4 md:px-8 lg:px-12
  py-10 md:py-16
  space-y-12 md:space-y-20
  max-w-7xl mx-auto"
    >
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onEdit={() => setIsEditing(true)}
        onFollow={handleFollowToggle}
      />

      {activeView === "overview" ? (
        <>
          <ProfileStats
            stats={stats}
            lists={isOwnProfile ? lists : profileLists}
          />
          <ProfileTopPicks
            reviews={topPicks}
            isOwnProfile={isOwnProfile}
            onViewAll={() => setActiveView("reviews")}
          />
          <ProfileCollection
            lists={isOwnProfile ? lists : profileLists}
            total={(isOwnProfile ? lists : profileLists).length}
          />
        </>
      ) : activeView === "reviews" ? (
        <ProfileAllReviews
          reviews={topPicks}
          isOwnProfile={isOwnProfile}
          onBack={() => setActiveView("overview")}
        />
      ) : null}

      {isEditing ? (
        <ProfileEditModal
          profile={profile}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      ) : null}
    </section>
  );
};

export default ProfileSection;

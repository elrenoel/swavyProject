import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const profileShellClassName =
  "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:min-w-[900px] md:px-10 md:py-12 lg:min-w-[1120px]";

const ProfileSkeleton = () => (
  <section className={`${profileShellClassName} space-y-10`}>
    <div className="text-center space-y-4 animate-pulse">
      <div className="mx-auto h-20 w-20 rounded-full bg-gray-200 md:h-24 md:w-24" />
      <div className="space-y-2">
        <div className="mx-auto h-8 w-48 rounded bg-gray-200" />
        <div className="mx-auto h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="mx-auto h-12 w-36 rounded-full bg-gray-200" />
    </div>

    <div className="grid grid-cols-2 gap-3 animate-pulse md:grid-cols-4 md:gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`stat-skeleton-${index}`}
          className="rounded-xl border border-gray-200 bg-white p-3 md:p-5"
        >
          <div className="mx-auto h-7 w-16 rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-3 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>

    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`top-pick-skeleton-${index}`} className="space-y-2">
            <div className="h-30 w-full rounded-lg bg-gray-200 sm:h-35 md:h-40" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
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
  const navigate = useNavigate();
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
  const followSyncTimerRef = useRef(null);
  const followRequestIdRef = useRef(0);
  const serverFollowingRef = useRef(false);
  const desiredFollowingRef = useRef(false);
  const followUsernameRef = useRef("");

  const isOwnProfile = profile?.id && user?.id === profile.id;

  const applyFollowerDelta = (nextFollowing, previousFollowing) => {
    if (nextFollowing === previousFollowing) return;

    setStats((prev) => {
      if (!prev) return prev;

      const delta = nextFollowing ? 1 : -1;
      return {
        ...prev,
        followersCount: Math.max((prev.followersCount || 0) + delta, 0),
      };
    });
  };

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
        const nextFollowing = !!profileData.isFollowing;
        setIsFollowing(nextFollowing);
        serverFollowingRef.current = nextFollowing;
        desiredFollowingRef.current = nextFollowing;
        followUsernameRef.current = profileData.profile?.username || username;

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
      window.clearTimeout(followSyncTimerRef.current);
    };
  }, [username]);

  const syncFollowState = async () => {
    const usernameToSync = followUsernameRef.current;
    if (!usernameToSync) return;

    const targetFollowing = desiredFollowingRef.current;
    if (targetFollowing === serverFollowingRef.current) return;

    const requestId = followRequestIdRef.current + 1;
    followRequestIdRef.current = requestId;

    try {
      const result = targetFollowing
        ? await followProfile(usernameToSync)
        : await unfollowProfile(usernameToSync);
      if (requestId !== followRequestIdRef.current) return;

      const confirmedFollowing =
        typeof result?.following === "boolean"
          ? result.following
          : targetFollowing;
      serverFollowingRef.current = confirmedFollowing;

      if (desiredFollowingRef.current !== confirmedFollowing) {
        followSyncTimerRef.current = window.setTimeout(syncFollowState, 1000);
      }
    } catch (err) {
      if (requestId !== followRequestIdRef.current) return;

      const confirmedFollowing = serverFollowingRef.current;
      const optimisticFollowing = desiredFollowingRef.current;
      desiredFollowingRef.current = confirmedFollowing;
      setIsFollowing(confirmedFollowing);
      applyFollowerDelta(confirmedFollowing, optimisticFollowing);
      setError(err?.message || "Failed to update follow status");
    }
  };

  const handleFollowToggle = async () => {
    if (!profile?.username) return;

    const previousFollowing = desiredFollowingRef.current;
    const nextFollowing = !previousFollowing;

    setError(null);
    desiredFollowingRef.current = nextFollowing;
    followUsernameRef.current = profile.username;
    setIsFollowing(nextFollowing);
    applyFollowerDelta(nextFollowing, previousFollowing);

    window.clearTimeout(followSyncTimerRef.current);
    followSyncTimerRef.current = window.setTimeout(syncFollowState, 1000);
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

    if (username && username !== profile.username) {
      navigate(`/profile/${username}`, { replace: true });
    }
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
    <section className={`${profileShellClassName} space-y-10`}>
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

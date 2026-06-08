const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  onEdit,
  onFollow,
}) => {
  const defaultAvatarUrl = "/placeholder.jpg";
  const displayName = profile?.full_name || profile?.username || "User";
  const username = profile?.username || "username";
  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url}${
        profile.updated_at ? `?t=${new Date(profile.updated_at).getTime()}` : ""
      }`
    : defaultAvatarUrl;

  return (
    <div className="text-center space-y-3 md:space-y-4">
      <img
        src={avatarUrl}
        alt={`${displayName} avatar`}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto"
      />

      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-['Newsreader']">
          {displayName}
        </h1>

        <p className="text-xs md:text-sm text-gray-400">@{username}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3 mt-4">
        {isOwnProfile ? (
          <button
            onClick={onEdit}
            className="px-4 md:px-5 py-2 border rounded-full text-sm"
          >
            EDIT PROFILE
          </button>
        ) : (
          <button
            onClick={onFollow}
            className="px-4 md:px-5 py-2 bg-black text-white rounded-full text-sm"
          >
            {isFollowing ? "FOLLOWING" : "FOLLOW"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

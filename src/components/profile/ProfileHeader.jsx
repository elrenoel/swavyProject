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
    <div className="mx-auto flex max-w-2xl flex-col items-center border-b border-gray-100 pb-8 text-center md:pb-10">
      <img
        src={avatarUrl}
        alt={`${displayName} avatar`}
        className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
      />

      <div className="mt-4">
        <h1 className="font-['Newsreader'] text-3xl leading-tight text-gray-950 md:text-4xl">
          {displayName}
        </h1>

        <p className="mt-1 text-sm text-gray-400">@{username}</p>
      </div>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row md:gap-3">
        {isOwnProfile ? (
          <button
            onClick={onEdit}
            className="rounded-full border border-gray-900 px-5 py-2 text-sm font-medium text-gray-950 transition hover:bg-gray-950 hover:text-white"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={onFollow}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              isFollowing
                ? "border border-gray-200 bg-white text-gray-950 hover:border-gray-300"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

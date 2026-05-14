const mapSongRow = (row) => ({
  id: row.song_id,
  title: row.title,
  artist: row.artist,
  image: row.image,
  created_at: row.created_at,
});

const mapListRow = (row) => ({
  id: row.id,
  title: row.title,
  desc: row.description,
  created_at: row.created_at,
  songs: Array.isArray(row.list_songs) ? row.list_songs.map(mapSongRow) : [],
});

const mapReviewRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  username: row.username,
  track_id: row.track_id,
  album_id: row.album_id,
  album_name: row.album_name,
  album_type: row.album_type,
  title: row.title,
  artist: row.artist,
  image_url: row.image_url,
  rating: row.rating,
  content: row.content,
  likes_count: row.likes_count,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const getProfileByUsername = async (supabaseClient, username) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, full_name, avatar_url, updated_at")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

export const updateProfile = async (supabaseClient, userId, updates) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id, username, full_name, avatar_url, updated_at")
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

export const getProfileStats = async (supabaseClient, userId) => {
  const { count: reviewCount, error: reviewError } = await supabaseClient
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (reviewError) throw reviewError;

  const { count: listCount, error: listError } = await supabaseClient
    .from("lists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (listError) throw listError;

  const { data: listIds, error: listIdsError } = await supabaseClient
    .from("lists")
    .select("id")
    .eq("user_id", userId);

  if (listIdsError) throw listIdsError;

  const ids = (listIds || []).map((row) => row.id);
  let listSongsCount = 0;

  if (ids.length) {
    const { count: songCount, error: songError } = await supabaseClient
      .from("list_songs")
      .select("id", { count: "exact", head: true })
      .in("list_id", ids);

    if (songError) throw songError;

    listSongsCount = songCount || 0;
  }

  const { count: followerCount, error: followerError } = await supabaseClient
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", userId);

  if (followerError) throw followerError;

  return {
    reviewsCount: reviewCount || 0,
    followersCount: followerCount || 0,
    listsCount: listCount || 0,
    listSongsCount,
  };
};

export const getTopPicks = async (supabaseClient, userId, limit) => {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select(
      "id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("likes_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(mapReviewRow);
};

export const getListsByUser = async (
  supabaseClient,
  userId,
  { limit, offset },
) => {
  const { data, error, count } = await supabaseClient
    .from("lists")
    .select(
      "id, title, description, created_at, list_songs (song_id, title, artist, image, created_at)",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    lists: (data || []).map(mapListRow),
    total: count || 0,
  };
};

export const getFollowStatus = async (
  supabaseClient,
  followerId,
  followingId,
) => {
  const { data, error } = await supabaseClient
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
};

export const followUser = async (supabaseClient, followerId, followingId) => {
  const { data, error } = await supabaseClient
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId })
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

export const unfollowUser = async (supabaseClient, followerId, followingId) => {
  const { data, error } = await supabaseClient
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

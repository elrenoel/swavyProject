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

export const createReview = async (supabaseClient, payload) => {
  const { data, error } = await supabaseClient
    .from("reviews")
    .insert(payload)
    .select(
      "id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at",
    )
    .single();

  if (error) throw error;

  return mapReviewRow(data);
};

export const getRecentReviews = async (
  supabaseClient,
  { limit, offset, viewerUserId, viewerClient },
) => {
  const { data, error, count } = await supabaseClient
    .from("reviews")
    .select(
      "id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  let likedSet = new Set();
  if (viewerUserId && viewerClient && Array.isArray(data) && data.length) {
    const reviewIds = data.map((row) => row.id);
    const { data: likesData, error: likesError } = await viewerClient
      .from("review_likes")
      .select("review_id")
      .eq("user_id", viewerUserId)
      .in("review_id", reviewIds);

    if (likesError) throw likesError;

    likedSet = new Set((likesData || []).map((row) => row.review_id));
  }

  return {
    reviews: (data || []).map((row) => ({
      ...mapReviewRow(row),
      liked_by_me: likedSet.has(row.id),
    })),
    total: count || 0,
  };
};

export const getTrackReviews = async (
  supabaseClient,
  { trackId, viewerUserId, viewerClient },
) => {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select(
      "id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at",
    )
    .eq("track_id", trackId)
    .order("likes_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  let likedSet = new Set();
  if (viewerUserId && viewerClient && Array.isArray(data) && data.length) {
    const reviewIds = data.map((row) => row.id);
    const { data: likesData, error: likesError } = await viewerClient
      .from("review_likes")
      .select("review_id")
      .eq("user_id", viewerUserId)
      .in("review_id", reviewIds);

    if (likesError) throw likesError;

    likedSet = new Set((likesData || []).map((row) => row.review_id));
  }

  return {
    reviews: (data || []).map((row) => ({
      ...mapReviewRow(row),
      liked_by_me: likedSet.has(row.id),
    })),
  };
};

export const getPopularReviews = async (supabaseClient, { limit, since }) => {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select(
      "id, user_id, username, track_id, album_id, album_name, album_type, title, artist, image_url, rating, content, likes_count, created_at, updated_at",
    )
    .gte("created_at", since)
    .order("likes_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return { reviews: (data || []).map(mapReviewRow) };
};

export const toggleReviewLike = async (supabaseClient, reviewId, userId) => {
  const { data: review, error: reviewError } = await supabaseClient
    .from("reviews")
    .select("id, likes_count")
    .eq("id", reviewId)
    .maybeSingle();

  if (reviewError) throw reviewError;
  if (!review) return null;

  const { data: existingLike, error: likeError } = await supabaseClient
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (likeError) throw likeError;

  let liked = false;
  let nextLikes = review.likes_count || 0;

  if (existingLike) {
    const { error: deleteError } = await supabaseClient
      .from("review_likes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    nextLikes = Math.max(nextLikes - 1, 0);
  } else {
    const { error: insertError } = await supabaseClient
      .from("review_likes")
      .insert({ review_id: reviewId, user_id: userId });

    if (insertError) throw insertError;

    nextLikes = nextLikes + 1;
    liked = true;
  }

  const { data: updated, error: updateError } = await supabaseClient
    .from("reviews")
    .update({ likes_count: nextLikes })
    .eq("id", reviewId)
    .select("likes_count")
    .maybeSingle();

  if (updateError) throw updateError;

  return {
    liked,
    likes_count: updated?.likes_count ?? nextLikes,
  };
};

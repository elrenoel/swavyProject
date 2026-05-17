const mapSongRow = (row) => ({
  id: row.song_id,
  title: row.title,
  artist: row.artist,
  image: row.image,
  created_at: row.created_at,
});

const mapListRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  desc: row.description,
  created_at: row.created_at,
  songs: Array.isArray(row.list_songs) ? row.list_songs.map(mapSongRow) : [],
});

export const getLists = async (supabaseClient, userId) => {
  const { data, error } = await supabaseClient
    .from("lists")
    .select(
      "id, title, description, created_at, list_songs (song_id, title, artist, image, created_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapListRow);
};

export const getListById = async (supabaseClient, listId) => {
  const { data, error } = await supabaseClient
    .from("lists")
    .select(
      "id, user_id, title, description, created_at, list_songs (song_id, title, artist, image, created_at)",
    )
    .eq("id", listId)
    .maybeSingle();

  if (error) throw error;

  return data ? mapListRow(data) : null;
};

export const createList = async (supabaseClient, payload) => {
  const { data, error } = await supabaseClient
    .from("lists")
    .insert(payload)
    .select("id, title, description, created_at")
    .single();

  if (error) throw error;

  return {
    ...mapListRow({ ...data, list_songs: [] }),
  };
};

export const updateList = async (supabaseClient, listId, userId, updates) => {
  const { data, error } = await supabaseClient
    .from("lists")
    .update(updates)
    .eq("id", listId)
    .eq("user_id", userId)
    .select("id, title, description, created_at")
    .maybeSingle();

  if (error) throw error;

  return data ? { ...mapListRow({ ...data, list_songs: [] }) } : null;
};

export const deleteList = async (supabaseClient, listId, userId) => {
  const { data, error } = await supabaseClient
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

export const addSongToList = async (supabaseClient, payload) => {
  const { data, error } = await supabaseClient
    .from("list_songs")
    .insert(payload)
    .select("song_id, title, artist, image, created_at")
    .single();

  if (error) throw error;

  return mapSongRow(data);
};

export const removeSongFromList = async (supabaseClient, listId, songId) => {
  const { data, error } = await supabaseClient
    .from("list_songs")
    .delete()
    .eq("list_id", listId)
    .eq("song_id", songId)
    .select("song_id")
    .maybeSingle();

  if (error) throw error;

  return data || null;
};

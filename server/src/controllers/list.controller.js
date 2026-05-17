import * as listService from "../services/list.service.js";

const extractSongId = (body) => body.song_id || body.songId || body.id;

export const getLists = async (req, res) => {
  try {
    const lists = await listService.getLists(req.supabase, req.user.id);
    return res.status(200).json({ lists });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await listService.getListById(req.supabase, id);

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createList = async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const payload = {
      user_id: req.user.id,
      title,
      description: desc || null,
    };

    const list = await listService.createList(req.supabase, payload);
    return res.status(201).json({ list });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, desc } = req.body;

    if (!title && !desc) {
      return res.status(400).json({ error: "Provide title or desc to update" });
    }

    const updates = {
      ...(title ? { title } : {}),
      ...(typeof desc !== "undefined" ? { description: desc } : {}),
    };

    const list = await listService.updateList(
      req.supabase,
      id,
      req.user.id,
      updates,
    );

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await listService.deleteList(req.supabase, id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: "List not found" });
    }

    return res.status(200).json({ message: "List deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addSongToList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, image } = req.body;
    const songId = extractSongId(req.body);

    if (!songId || !title) {
      return res
        .status(400)
        .json({ error: "song_id (or id) and title are required" });
    }

    const payload = {
      list_id: id,
      song_id: songId,
      title,
      artist: artist || null,
      image: image || null,
    };

    const song = await listService.addSongToList(req.supabase, payload);
    return res.status(201).json({ song });
  } catch (error) {
    if (error.message?.includes("duplicate")) {
      return res.status(409).json({ error: "Song already in list" });
    }

    return res.status(500).json({ error: error.message });
  }
};

export const removeSongFromList = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const removed = await listService.removeSongFromList(
      req.supabase,
      id,
      songId,
    );

    if (!removed) {
      return res.status(404).json({ error: "Song not found" });
    }

    return res.status(200).json({ message: "Song removed" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

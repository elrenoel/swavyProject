import { supabase, createUserClient } from "../config/supabase.js";
import * as profileService from "../services/profile.service.js";
const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const getClient = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    return createUserClient(token);
  }
  return supabase;
};

const extractAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.cookies?.access_token || null;
};

const resolveViewer = async (req) => {
  const accessToken = extractAccessToken(req);
  if (!accessToken) return { viewerUserId: null, viewerClient: null };

  const { data } = await supabase.auth.getUser(accessToken);
  if (!data?.user) return { viewerUserId: null, viewerClient: null };

  return {
    viewerUserId: data.user.id,
    viewerClient: createUserClient(accessToken),
  };
};

const parseAvatarDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;

  const [, contentType, base64] = match;
  return { contentType, base64 };
};

const getFileExtension = (contentType) => {
  if (!contentType) return "png";
  const parts = contentType.split("/");
  return parts[1] || "png";
};

export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const client = getClient(req);
    const profile = await profileService.getProfileByUsername(
      client,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const { viewerUserId } = await resolveViewer(req);
    const isMe = viewerUserId === profile.id;

    let isFollowing = false;
    if (viewerUserId && !isMe) {
      isFollowing = await profileService.getFollowStatus(
        client,
        viewerUserId,
        profile.id,
      );
    }

    return res.status(200).json({
      profile,
      isFollowing,
      isMe,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProfileStats = async (req, res) => {
  try {
    const { username } = req.params;
    const client = getClient(req);
    const profile = await profileService.getProfileByUsername(
      client,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const stats = await profileService.getProfileStats(client, profile.id);
    return res.status(200).json({ stats });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProfileTopPicks = async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parsePositiveInt(req.query.limit, 4);
    const client = getClient(req);
    const profile = await profileService.getProfileByUsername(
      client,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const reviews = await profileService.getTopPicks(
      client,
      profile.id,
      limit,
    );

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProfileLists = async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parsePositiveInt(req.query.limit, 4);
    const offset = parseNonNegativeInt(req.query.offset, 0);
    const client = getClient(req);
    
    const profile = await profileService.getProfileByUsername(
      client,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const result = await profileService.getListsByUser(client, profile.id, {
      limit,
      offset,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, full_name } = req.body;

    if (!username && !full_name) {
      return res.status(400).json({ error: "Provide username or full_name" });
    }

    const updates = {
      ...(username ? { username } : {}),
      ...(typeof full_name !== "undefined"
        ? { full_name: full_name || username || null }
        : {}),
      updated_at: new Date().toISOString(),
    };

    const profile = await profileService.updateProfile(
      req.supabase,
      req.user.id,
      updates,
    );

    if (username) {
      // Also update the auth user's metadata so the frontend session gets the new username
      await req.supabase.auth.updateUser({
        data: { username },
      });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { avatarDataUrl } = req.body;
    const parsed = parseAvatarDataUrl(avatarDataUrl);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid avatar data" });
    }

    const { contentType, base64 } = parsed;
    const buffer = Buffer.from(base64, "base64");
    const extension = getFileExtension(contentType);
    const filePath = `avatars/${req.user.id}.${extension}`;

    const { error: uploadError } = await req.supabase.storage
      .from("profile-avatars")
      .upload(filePath, buffer, { contentType, upsert: true });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data } = req.supabase.storage
      .from("profile-avatars")
      .getPublicUrl(filePath);

    const updates = {
      avatar_url: data?.publicUrl || null,
      updated_at: new Date().toISOString(),
    };

    const profile = await profileService.updateProfile(
      req.supabase,
      req.user.id,
      updates,
    );

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const followProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await profileService.getProfileByUsername(
      supabase,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (profile.id === req.user.id) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    await profileService.followUser(req.supabase, req.user.id, profile.id);
    return res.status(200).json({ following: true });
  } catch (error) {
    if (error.message?.includes("duplicate")) {
      return res.status(200).json({ following: true });
    }

    return res.status(500).json({ error: error.message });
  }
};

export const unfollowProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await profileService.getProfileByUsername(
      supabase,
      username,
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await profileService.unfollowUser(req.supabase, req.user.id, profile.id);
    return res.status(200).json({ following: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

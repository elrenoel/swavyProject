import { supabase, createUserClient } from "../config/supabase.js";

const extractAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return req.cookies?.access_token || null;
};

const authenticate = async (req, res, next) => {
  try {
    const accessToken = extractAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = data.user;
    req.accessToken = accessToken;
    req.supabase = createUserClient(accessToken);

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default authenticate;

import { supabase, supabaseAdmin } from "../config/supabase.js";
/**
 * Logika Sign Up: Mendaftarkan user ke Supabase Auth
 * dan memasukkan data tambahan ke tabel 'profiles'
 */

/**
 * Step 1: Sign Up
 * Hanya mendaftarkan email & password ke Supabase Auth.
 */
export async function ensureUserProfile(user) {
  if (!user?.id) return null;

  const { data: existingProfile, error: existingError } = await supabaseAdmin
    .from("profiles")
    .select("id, username, full_name, avatar_url, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingProfile) return existingProfile;

  const username =
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    `User_${user.id.substring(0, 5)}`;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: user.id,
      username,
      full_name: username,
      updated_at: new Date().toISOString(),
    })
    .select("id, username, full_name, avatar_url, updated_at")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Simpan username + email di metadata untuk kebutuhan verifikasi
      data: { username, email },
    },
  });

  if (error) throw error;
  await ensureUserProfile(data?.user);

  return data;
};

/**
 * Step 2: Verify OTP & Create Profile
 * Berjalan setelah user memasukkan kode dari email.
 */
export const verifyOTP = async (email, token) => {
  try {
    const normalizedEmail = String(email || "").trim();
    const normalizedToken = String(token || "").trim();

    // 1. Verifikasi OTP ke Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedToken,
      type: "signup",
    });

    if (error) throw error;

    // 2. Jika verifikasi sukses, sinkronisasi ke tabel profiles
    await ensureUserProfile(data?.user);

    return data;
  } catch (error) {
    // Log error secara internal untuk debugging
    console.error("Error in verifyOTP service:", error.message);
    // Lempar kembali agar ditangkap oleh catch di controller
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error in resendOTP service:", error.message);
    throw error;
  }
};

/**
 * Logika Sign In: Autentikasi user menggunakan email & password
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  await ensureUserProfile(data?.user);

  return data;
};

export const getUserFromToken = async (accessToken) => {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) throw error;

  return data.user;
};

export const refreshSession = async (refreshToken) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) throw error;

  return data;
};

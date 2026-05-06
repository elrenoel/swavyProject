import { supabase } from "../config/supabase.js";
/**
 * Logika Sign Up: Mendaftarkan user ke Supabase Auth
 * dan memasukkan data tambahan ke tabel 'profiles'
 */

/**
 * Step 1: Sign Up
 * Hanya mendaftarkan email & password ke Supabase Auth.
 */
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Kita simpan username di metadata agar tidak hilang saat proses verifikasi
      data: { username },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Step 2: Verify OTP & Create Profile
 * Berjalan setelah user memasukkan kode dari email.
 */
export const verifyOTP = async (email, token) => {
  try {
    // 1. Verifikasi OTP ke Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) throw error;

    // 2. Jika verifikasi sukses, sinkronisasi ke tabel profiles
    if (data?.user) {
      const { id, user_metadata } = data.user;
      const username = user_metadata?.username || `User_${id.substring(0, 5)}`;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: id,
        username: username,
        full_name: username,
        updated_at: new Date().toISOString(), // Gunakan ISO string untuk DB
      });

      if (profileError) throw profileError;
    }

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

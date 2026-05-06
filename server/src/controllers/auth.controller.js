import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 1. Validasi Password Strict
    // Min 8 char, 1 Kapital, 1 Karakter Spesial
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include one uppercase letter, and one special character.",
      });
    }

    // 2. Kirim ke Service
    const data = await authService.signUp(email, password, username);

    res.status(201).json({
      message:
        "OTP has been sent to your email. Please verify to complete registration.",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signIn(email, password);

    res.status(200).json({
      message: "Login successful",
      session: result.session,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    // Ambil data dari body request
    const { email, token } = req.body;

    // Validasi input dasar sebelum ke service
    if (!email || !token) {
      return res.status(400).json({
        status: "error",
        message: "Email dan kode OTP wajib diisi",
      });
    }

    // Panggil service
    const result = await authService.verifyOTP(email, token);

    return res.status(200).json({
      status: "success",
      message: "Verifikasi berhasil",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    // PENTING: Ambil email-nya saja (string), bukan seluruh req
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email wajib diisi untuk kirim ulang OTP",
      });
    }

    // Kirim string email ke service
    const result = await authService.resendOTP(email);

    return res.status(200).json({
      status: "success",
      message: "OTP baru telah dikirim ke email",
      data: result,
    });
  } catch (error) {
    // Tangani error khusus rate limit (3 email/jam) dari Supabase
    const message = error.message.includes("rate limit")
      ? "Terlalu banyak permintaan. Silakan coba lagi dalam 1 jam."
      : error.message;

    return res.status(error.status || 429).json({
      status: "error",
      message: message,
    });
  }
};

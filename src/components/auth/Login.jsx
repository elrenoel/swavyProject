import React, { useState } from "react";
import { HiOutlineMail, HiOutlineLockOpen } from "react-icons/hi";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      console.log("Login success:", data);
      await refreshUser();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Terjadi kesalahan, coba lagi.");
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Selamat Datang
        </h2>
        <p className="mb-8 text-center text-gray-500">
          Silakan masuk ke akun Anda
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiOutlineMail size={20} />
              </div>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                placeholder="nama@email.com"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <div className="flex justify-between">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-xs text-[#1DB954] hover:underline">
                Lupa Password?
              </a>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiOutlineLockOpen size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                placeholder="••••••••"
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#1DB954]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <RiEyeLine size={20} />
                ) : (
                  <RiEyeCloseLine size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#1DB954] focus:ring-[#1DB954]"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700"
            >
              Ingat saya
            </label>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1DB954] py-3 font-semibold text-white transition duration-200 hover:bg-[#1DB345] active:scale-95 shadow-md shadow-indigo-200"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a
            onClick={() => navigate("../register")}
            className="font-medium text-[#1DB954] hover:underline"
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

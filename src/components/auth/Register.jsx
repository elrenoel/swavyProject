import { useState } from "react";
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      console.log("Register success:", data);
      sessionStorage.setItem("pendingOtpEmail", formData.email);
      navigate("../verify-otp");
    } catch (error) {
      console.error("Register error:", error);
      setErrorMessage(error?.message || "Terjadi kesalahan, coba lagi.");
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Daftar Akun
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiOutlineUser size={20} />
              </div>
              <input
                type="text"
                name="username"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                placeholder="Masukkan username"
                onChange={handleChange}
              />
            </div>
          </div>

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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-10 focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
                placeholder="••••••••"
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
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

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1DB954] py-3 font-semibold text-white transition duration-200 hover:bg-[#1DB345] active:scale-95"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a
            onClick={() => navigate("../login")}
            className="text-[#1DB954] font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

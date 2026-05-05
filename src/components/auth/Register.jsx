import { useState } from "react";
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data Registrasi:", formData);
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
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
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 active:scale-95"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a
            onClick={() => navigate("../login")}
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

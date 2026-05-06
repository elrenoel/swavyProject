import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

const OtpVerify = () => {
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("pendingOtpEmail");
    if (!savedEmail) {
      navigate("../register");
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
      sessionStorage.removeItem("pendingOtpEmail");
      navigate("../login");
    } catch (error) {
      setErrorMessage(error?.message || "Verifikasi gagal, coba lagi.");
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Verifikasi OTP
        </h2>
        <p className="mb-6 text-center text-gray-500">
          Masukkan kode 6 digit yang dikirim ke {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kode OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setToken(value);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              required
              className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-center tracking-[0.3em] focus:border-[#1DB954] focus:outline-none focus:ring-1 focus:ring-[#1DB954]"
              placeholder="123456"
            />
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
            Verifikasi
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerify;

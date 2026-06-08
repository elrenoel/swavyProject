import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import LoadingSpinner from "./LoadingSpinner";

const OtpVerify = () => {
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("pendingOtpEmail");
    if (!savedEmail) {
      navigate("../register");
      return;
    }
    setEmail(savedEmail);
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    let verificationSucceeded = false;

    try {
      await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
      sessionStorage.removeItem("pendingOtpEmail");
      verificationSucceeded = true;
      setIsRedirecting(true);
      setSuccessMessage("Verifikasi berhasil. Mengarahkan ke halaman login...");
      window.setTimeout(() => {
        navigate("../login");
      }, 1200);
    } catch (error) {
      setErrorMessage(error?.message || "Verifikasi gagal, coba lagi.");
    } finally {
      if (!verificationSucceeded) {
        setIsSubmitting(false);
      }
    }
  };

  const handleResend = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      await apiFetch("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccessMessage("Kode baru sudah dikirim. Cek inbox atau folder spam.");
      setResendCooldown(60);
    } catch (error) {
      setErrorMessage(
        error?.status === 429
          ? "Terlalu banyak permintaan email. Silakan coba lagi nanti."
          : error?.message || "Gagal mengirim ulang kode.",
      );
    } finally {
      setIsResending(false);
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

        {successMessage ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

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
              disabled={isSubmitting || isRedirecting}
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
            disabled={isSubmitting || isRedirecting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1DB954] py-3 font-semibold text-white transition duration-200 hover:bg-[#1DB345] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRedirecting || isSubmitting ? <LoadingSpinner /> : "Verifikasi"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isRedirecting || isResending || resendCooldown > 0}
          className="mt-4 w-full text-sm font-semibold text-[#1DB954] hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          {isResending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner className="h-4 w-4 border-[#1DB954]" />
            </span>
          ) : resendCooldown > 0 ? (
            `Kirim ulang kode dalam ${resendCooldown}s`
          ) : (
            "Kirim ulang kode"
          )}
        </button>
      </div>
    </div>
  );
};

export default OtpVerify;

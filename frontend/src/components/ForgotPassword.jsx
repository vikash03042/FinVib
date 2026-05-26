import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.forgotPassword(email);
      setSuccess(res.message);
      setStep(2);
      setCountdown(60); // 60 seconds cooldown for resend
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await api.resetPassword({ email, otp, newPassword });
      setSuccess(res.message);
      setStep(3); // success step
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-100 relative">
        <Link to="/login" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-slate-800 mt-2">
          Forgot Password
        </h1>
        <p className="text-center text-slate-500 text-sm mt-1">
          {step === 1 ? "Enter your email to receive a reset code" : step === 2 ? "Enter OTP and new password" : "Password Reset Successful"}
        </p>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mt-4 text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mt-4 text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP & New Password Input */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-3 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="6-digit OTP"
              required
              maxLength={6}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-lg font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <input
              type="password"
              placeholder="New Password (min 8 chars)"
              required
              minLength={8}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            
            <button
              type="submit"
              disabled={loading || otp.length < 6 || newPassword.length < 8}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || loading}
                className="text-sm text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="mt-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

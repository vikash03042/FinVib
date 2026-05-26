import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.sendOtp(email);
      setOtpSent(true);
      setSuccess("Verification code sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      setError("Please verify your email first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.register({ name, email, password, otp });

      setSuccess("Account created successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await api.googleLogin(credentialResponse.credential);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      navigate("/");
    } catch (err) {
      setError("Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">
          
          <h1 className="text-3xl font-bold text-center text-slate-800">Create Account</h1>
          <p className="text-center text-slate-500 text-sm mt-1">
            Sign up to start tracking expenses
          </p>

          {error && (
              <div className="bg-red-100 text-red-600 p-2 rounded mt-4 text-sm text-center">
                {error}
              </div>
          )}

          {success && (
              <div className="bg-green-100 text-green-600 p-2 rounded mt-4 text-sm text-center">
                {success}
              </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={otpSent}
                required
            />

            <div className="flex space-x-2">
              <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  required
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-900 transition whitespace-nowrap text-sm font-semibold disabled:opacity-50"
                >
                  Verify
                </button>
              )}
            </div>

            {otpSent && (
              <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 font-mono tracking-widest text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
              />
            )}

            <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!otpSent}
                required
            />

            <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t"></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed")}
            />
          </div>

          <p className="text-sm text-center mt-5 text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>

        </div>
      </div>
  );
}
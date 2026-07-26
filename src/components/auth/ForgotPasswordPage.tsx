import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { forgotPassword, resetPassword } from "../../api/auth";
import { showApiError } from "../../api/client";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

type Step = "identifier" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSendReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("ইমেইল বা ফোন নম্বর দিন");
      return;
    }
    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      await forgotPassword(
        isEmail ? { email: identifier.trim() } : { phone: identifier.trim() },
      );
      setStep("otp");
    } catch (err) {
      showApiError(err);
      setError("কোড পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("৬ ডিজিটের কোড দিন");
      return;
    }
    setStep("reset");
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে");
      return;
    }
    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }
    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      await resetPassword({
        ...(isEmail ? { email: identifier.trim() } : { phone: identifier.trim() }),
        code: otp,
        password,
      });
      window.location.href = "/login";
    } catch (err) {
      showApiError(err);
      setError("পাসওয়ার্ড রিসেট করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-bg-base flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        {step === "identifier" && (
          <>
            <Link to="/login" className="self-start mb-4 text-white/60">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold font-display text-text-primary">
                পাসওয়ার্ড ভুলে গেছেন?
              </h1>
              <p className="text-sm text-white/50 mt-1">
                ইমেইল বা ফোন নম্বর দিন
              </p>
            </div>
            <form onSubmit={handleSendReset} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  ইমেইল বা ফোন নম্বর
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                কোড পাঠান
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <button onClick={() => setStep("identifier")} className="self-start mb-4 text-white/60">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold font-display text-text-primary">
                কোড নিশ্চিত করুন
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {identifier}-এ কোড পাঠানো হয়েছে
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="৬ ডিজিটের কোড"
                  className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all text-center tracking-[8px]"
                />
              </div>
              <button
                type="submit"
                disabled={otp.length !== 6}
                className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold active:opacity-90 transition-all disabled:opacity-50"
              >
                নিশ্চিত করুন
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <button onClick={() => setStep("otp")} className="self-start mb-4 text-white/60">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold font-display text-text-primary">
                নতুন পাসওয়ার্ড
              </h1>
              <p className="text-sm text-white/50 mt-1">
                নতুন পাসওয়ার্ড দিন
              </p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  নতুন পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার পাসওয়ার্ড দিন"
                  className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                পাসওয়ার্ড রিসেট করুন
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

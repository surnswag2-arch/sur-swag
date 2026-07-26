import { useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { handleAuthError } from "../../api/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("ইমেইল বা ইউজারনেম দিন");
      return;
    }
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      await login(
        isEmail
          ? { email: identifier.trim(), password }
          : { username: identifier.trim(), password },
      );
      navigate("/", { replace: true });
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-bg-base flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-text-primary">
            Sur & Swag
          </h1>
          <p className="text-sm text-white/50 mt-1">সুর ও স্বাগ-এ স্বাগতম</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              ইমেইল বা ইউজারনেম
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="example@email.com"
              className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-10 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
                autoComplete="current-password"
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs text-accent-primary font-medium"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link to="/signup" className="text-accent-primary font-semibold">
            সাইন আপ
          </Link>
        </p>
      </div>
    </div>
  );
}

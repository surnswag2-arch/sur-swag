import { useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { handleAuthError } from "../../api/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = (): string | null => {
    if (!username.trim() || username.length < 3) return "ইউজারনেম কমপক্ষে ৩ অক্ষর হতে হবে";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "ইউজারনেমে শুধু অক্ষর, সংখ্যা ও আন্ডারস্কোর থাকতে পারে";
    if (!displayName.trim()) return "নাম দিন";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "সঠিক ইমেইল ঠিকানা দিন";
    if (password.length < 8) return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে";
    if (password !== confirmPassword) return "পাসওয়ার্ড মিলছে না";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signup({
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        password,
        locale: "bn",
      });
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-display text-text-primary">
            সাইন আপ
          </h1>
          <p className="text-sm text-white/50 mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">
              ইউজারনেম <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">
              নাম <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">
              ইমেইল
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">
              পাসওয়ার্ড <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষর"
                className="w-full h-11 px-4 pr-10 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
                autoComplete="new-password"
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
            <label className="block text-xs font-medium text-white/50 mb-1">
              পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="আবার পাসওয়ার্ড দিন"
              className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "সাইন আপ"}
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-6">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="text-accent-primary font-semibold">
            সাইন ইন
          </Link>
        </p>
      </div>
    </div>
  );
}

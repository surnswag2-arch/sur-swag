import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { sendOtp, verifyOtp } from "../../api/auth";
import { showApiError } from "../../api/client";
import { Loader2, ArrowLeft } from "lucide-react";

export default function OtpVerifyPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("ফোন নম্বর দিন");
      return;
    }

    setLoading(true);
    try {
      await sendOtp({ phone: phone.trim() });
      setStep("otp");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      showApiError(err);
      setError("OTP পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("৬ ডিজিটের OTP দিন");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ phone: phone.trim(), code });
      navigate("/", { replace: true });
    } catch (err) {
      showApiError(err);
      setError("ভুল OTP। আবার চেষ্টা করুন");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (step === "phone") {
    return (
      <div className="min-h-dvh w-full bg-bg-base flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
          <button onClick={() => navigate("/signup")} className="self-start mb-4 text-white/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-display text-text-primary">
              ফোন নিশ্চিতকরণ
            </h1>
            <p className="text-sm text-white/50 mt-1">OTP পাঠানোর জন্য ফোন নম্বর দিন</p>
          </div>
          <form onSubmit={handleSendOtp} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 text-center">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">ফোন নম্বর</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                className="w-full h-11 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              OTP পাঠান
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-bg-base flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display text-text-primary">
            OTP ভেরিফিকেশন
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {phone}-এ ৬ ডিজিটের কোড পাঠানো হয়েছে
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-12 text-center rounded-xl bg-white/10 text-text-primary text-lg font-bold border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full h-11 rounded-xl bg-accent-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            নিশ্চিত করুন
          </button>
        </form>
        <div className="text-center mt-4">
          {cooldown > 0 ? (
            <span className="text-xs text-white/40">{cooldown} সেকেন্ড পরে পুনরায় পাঠান</span>
          ) : (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="text-xs text-accent-primary font-medium"
            >
              পুনরায় OTP পাঠান
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

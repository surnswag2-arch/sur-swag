import { memo } from "react";
import { Home, Compass, PlusSquare, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems: { icon: React.ElementType; label: string; path: string; isAction?: boolean }[] = [
  { icon: Home, label: "হোম", path: "/" },
  { icon: Compass, label: "আবিষ্কার", path: "/discover" },
  { icon: PlusSquare, label: "", path: "/upload", isAction: true },
  { icon: MessageCircle, label: "ইনবক্স", path: "/inbox" },
  { icon: User, label: "প্রোফাইল", path: "/profile" },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-around px-4 pb-1 pt-2 bg-bg-base border-t border-white/[0.06] safe-area-bottom">
      {navItems.map(({ icon: Icon, label, path, isAction }) => {
        if (isAction) {
          return (
            <button key={path} onClick={() => navigate(path)} className="relative flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-10 bg-accent-primary rounded-2xl shadow-lg shadow-accent-primary/30 active:scale-90 transition-transform">
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </button>
          );
        }

        const isActive = location.pathname === path;

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="relative flex flex-col items-center gap-0.5 py-0.5 min-w-0 active:scale-90 transition-transform"
          >
            <Icon
              className={`w-[26px] h-[26px] transition-all ${
                isActive ? "text-text-primary" : "text-white/40"
              }`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-[9px] leading-none tracking-tight ${
                isActive ? "text-text-primary font-semibold" : "text-white/40"
              }`}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-text-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default memo(BottomNav);

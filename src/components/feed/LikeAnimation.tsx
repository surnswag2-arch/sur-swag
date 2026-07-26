import { Heart } from "lucide-react";

export default function LikeAnimation() {
  const particles = [
    { tx: -60, ty: -80, delay: 0 },
    { tx: 60, ty: -80, delay: 0.05 },
    { tx: -40, ty: -100, delay: 0.1 },
    { tx: 40, ty: -100, delay: 0.15 },
    { tx: 0, ty: -120, delay: 0.2 },
    { tx: -80, ty: -60, delay: 0.08 },
    { tx: 80, ty: -60, delay: 0.12 },
  ];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      {/* Main heart burst */}
      <div className="animate-heart-burst">
        <Heart
          className="w-28 h-28 text-accent-primary fill-accent-primary drop-shadow-[0_0_20px_rgba(255,59,124,0.6)]"
          strokeWidth={1.5}
        />
      </div>

      {/* Flying particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-heart-fly"
          style={{
            animationDelay: `${p.delay}s`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        >
          <Heart
            className="w-4 h-4 text-accent-primary fill-accent-primary"
            strokeWidth={2}
          />
        </div>
      ))}
    </div>
  );
}

import type { Video } from "../../types";

interface MusicDiscProps {
  video: Video;
  isPlaying: boolean;
}

export default function MusicDisc({ video, isPlaying }: MusicDiscProps) {
  return (
    <div className="absolute right-3 bottom-[124px] z-10">
      <div className="relative">
        {/* Glow ring */}
        <div
          className={`absolute -inset-1 rounded-full disc-glow transition-opacity duration-300 ${
            isPlaying ? "opacity-100" : "opacity-30"
          }`}
        />
        {/* Vinyl disc */}
        <div
          className={`relative w-[46px] h-[46px] rounded-full overflow-hidden ${
            isPlaying ? "animate-spin-slow" : "animate-spin-paused"
          } vinyl-grooves`}
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Center label area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={video.sound.coverUrl}
              alt={video.sound.title}
              className="w-[22px] h-[22px] rounded-full object-cover z-10 ring-1 ring-white/20"
            />
          </div>
          {/* Spindle hole */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-[4px] h-[4px] rounded-full bg-black/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

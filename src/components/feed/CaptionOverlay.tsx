import { memo, useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import type { Video } from "../../types";
import { followUser, unfollowUser } from "../../api/upload";
import { showApiError } from "../../api/client";

interface CaptionOverlayProps {
  video: Video;
}

function CaptionOverlay({ video }: CaptionOverlayProps) {
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (followLoading) return;
    setFollowLoading(true);

    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);

    try {
      if (newFollowing) {
        await followUser(video.creator.id);
      } else {
        await unfollowUser(video.creator.id);
      }
    } catch (err) {
      setIsFollowing(!newFollowing);
      showApiError(err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="absolute left-4 right-24 bottom-28 z-10">
      {/* Username row with follow button */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[15px] font-bold text-white drop-shadow-lg">
          @{video.creator.username}
        </span>
        {video.creator.isVerified && (
          <div className="verified-badge rounded-full w-[18px] h-[18px] flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-[9px] text-white font-bold leading-none">✓</span>
          </div>
        )}
        <button
          onClick={handleFollow}
          className={`ml-1 w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all ${
            isFollowing
              ? "border-accent-primary/50 bg-accent-primary/10"
              : "border-white/40"
          }`}
        >
          {isFollowing ? (
            <UserMinus className="w-3.5 h-3.5 text-accent-primary" strokeWidth={2.5} />
          ) : (
            <UserPlus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Caption */}
      <p className="text-[14px] text-white/90 leading-snug mb-2 drop-shadow-lg line-clamp-2">
        {video.caption}
      </p>

      {/* Hashtags */}
      {video.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {video.hashtags.map((tag) => (
            <span key={tag} className="text-[13px] font-medium text-white/80 drop-shadow-lg">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Sound bar */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        <div className="flex items-end gap-[2px] h-4">
          {[0.5, 0.6, 0.45, 0.55].map((dur, i) => (
            <div
              key={i}
              className="w-[3px] bg-white/60 rounded-full music-bar"
              style={{ animationDuration: `${dur}s`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className="text-[12px] font-medium truncate drop-shadow-lg">
          {video.sound.title} — {video.sound.artist}
        </span>
      </div>
    </div>
  );
}

export default memo(CaptionOverlay);

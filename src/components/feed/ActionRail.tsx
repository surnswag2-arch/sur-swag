import { memo, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import type { Video } from "../../types";
import { bookmarkVideo, unbookmarkVideo, shareVideo } from "../../api/videos";
import { showApiError } from "../../api/client";
import CommentSheet from "./CommentSheet";

interface ActionRailProps {
  video: Video;
  externalLiked?: boolean;
  externalLikeCount?: number;
  onLike?: () => void;
}

function ActionRail({ video, externalLiked, externalLikeCount, onLike }: ActionRailProps) {
  const [bookmarked, setBookmarked] = useState(video.isBookmarked);
  const [showComments, setShowComments] = useState(false);

  const handleBookmark = async () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    try {
      if (newBookmarked) {
        await bookmarkVideo(video.id);
      } else {
        await unbookmarkVideo(video.id);
      }
    } catch (err) {
      setBookmarked(!newBookmarked);
      showApiError(err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${video.creator.displayName} on Sur & Swag`,
          text: video.caption,
          url: `${window.location.origin}/video/${video.id}`,
        });
      }
      await shareVideo(video.id).catch(() => {});
    } catch {
      // User cancelled share
    }
  };

  const liked = externalLiked !== undefined ? externalLiked : video.isLiked;
  const likeCount = externalLikeCount !== undefined ? externalLikeCount : video.likes;

  const handleLike = () => {
    if (onLike) {
      onLike();
    }
  };

  return (
    <>
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
        {/* Creator avatar */}
        <div className="relative group">
          <div className="w-12 h-12 rounded-full border-[2.5px] border-white overflow-hidden shadow-lg">
            <img
              src={video.creator.avatarUrl}
              alt={video.creator.username}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {video.creator.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] verified-badge rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[9px] text-white font-bold leading-none">✓</span>
            </div>
          )}
          <div className="absolute -inset-1.5 rounded-full border-2 border-accent-primary opacity-50" />
        </div>

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
        >
          <div>
            <Heart
              className={`w-[30px] h-[30px] transition-all ${
                liked
                  ? "text-accent-primary fill-accent-primary drop-shadow-[0_0_6px_rgba(255,59,124,0.5)]"
                  : "text-white drop-shadow-lg group-hover:scale-110 transition-transform"
              }`}
              strokeWidth={2}
            />
          </div>
          <span className="text-[10px] text-white font-semibold drop-shadow-lg">
            {formatCount(likeCount)}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <MessageCircle className="w-[30px] h-[30px] text-white drop-shadow-lg" strokeWidth={2} />
          <span className="text-[10px] text-white font-semibold drop-shadow-lg">
            {formatCount(video.comments)}
          </span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className="active:scale-90 transition-transform"
        >
          <Bookmark
            className={`w-[30px] h-[30px] drop-shadow-lg ${
              bookmarked
                ? "text-accent-secondary fill-accent-secondary"
                : "text-white"
            }`}
            strokeWidth={2}
          />
        </button>

        {/* Share */}
        <button onClick={handleShare} className="active:scale-90 transition-transform">
          <Share2 className="w-[30px] h-[30px] text-white drop-shadow-lg" strokeWidth={2} />
        </button>

        <span className="text-[8px] text-white/50 font-medium -mt-1">
          {formatCount(video.shares)}
        </span>
      </div>

      {showComments && <CommentSheet video={video} onClose={() => setShowComments(false)} />}
    </>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default memo(ActionRail);

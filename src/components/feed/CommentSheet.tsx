import { useState, useCallback, useEffect } from "react";
import { Heart, ChevronDown, Send, Loader2 } from "lucide-react";
import type { Video, CommentData } from "../../types";
import { getComments, postComment, likeComment, unlikeComment } from "../../api/videos";
import { showApiError } from "../../api/client";
import { CommentSkeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { MessageCircle } from "lucide-react";

interface CommentSheetProps {
  video: Video;
  onClose: () => void;
}

function CommentItem({ comment, isReply }: { comment: CommentData; isReply?: boolean }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    try {
      if (newLiked) {
        await likeComment(comment.id);
      } else {
        await unlikeComment(comment.id);
      }
    } catch (err) {
      setLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
      showApiError(err);
    }
  };

  return (
    <div className={`${isReply ? "ml-10 pl-3 border-l border-white/10" : ""}`}>
      <div className="flex gap-2.5 py-2.5">
        <img
          src={comment.user.avatarUrl}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-white">
              @{comment.user.username}
            </span>
            {comment.user.isVerified && (
              <div className="verified-badge rounded-full w-3 h-3 flex items-center justify-center">
                <span className="text-[5px] text-white font-bold">✓</span>
              </div>
            )}
            <span className="text-[10px] text-white/40 ml-1">{formatTimestamp(comment.timestamp)}</span>
          </div>
          <p className="text-[13px] text-white/80 leading-snug mt-0.5">{comment.text}</p>
          <div className="flex items-center gap-4 mt-1.5">
            <button onClick={handleLike} className="active:scale-90 transition-transform">
              <Heart
                className={`w-3.5 h-3.5 ${
                  liked ? "text-accent-primary fill-accent-primary" : "text-white/40"
                }`}
                strokeWidth={2}
              />
            </button>
            <span className="text-[10px] text-white/40 font-medium">{formatCount(likeCount)}</span>
            <button className="text-[11px] font-semibold text-white/40 active:text-white/70">উত্তর</button>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && !isReply && (
        <>
          {showReplies ? (
            comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} isReply />)
          ) : (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-10 mb-1 text-[12px] font-semibold text-white/40 active:text-white/70"
            >
              {comment.replies.length}টি উত্তর দেখুন
            </button>
          )}
          {showReplies && (
            <button
              onClick={() => setShowReplies(false)}
              className="ml-10 mb-1 text-[11px] font-semibold text-white/30"
            >
              উত্তর লুকান
            </button>
          )}
        </>
      )}
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "এখন";
    if (mins < 60) return `${mins} মি`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘ`;
    const days = Math.floor(hours / 24);
    return `${days} দ`;
  } catch {
    return ts;
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function CommentSheet({ video, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"top" | "newest">("top");
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getComments(video.id);
      setComments(response.comments);
    } catch (err) {
      showApiError(err);
      setError("মন্তব্য লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }, [video.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!commentText.trim() || sending) return;

    const text = commentText.trim();
    setCommentText("");
    setSending(true);

    // Optimistic add
    const optimisticComment: CommentData = {
      id: "temp-" + Date.now(),
      text,
      user: {
        id: "",
        username: "you",
        displayName: "You",
        avatarUrl: "",
        isVerified: false,
        isFollowing: false,
      },
      likes: 0,
      isLiked: false,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);

    try {
      const newComment = await postComment(video.id, text);
      setComments((prev) => prev.map((c) => (c.id === optimisticComment.id ? newComment : c)));
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      showApiError(err);
    } finally {
      setSending(false);
    }
  };

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative z-10 bg-bg-base rounded-t-2xl flex flex-col max-h-[80vh] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {formatCount(comments.length || video.comments)} মন্তব্য
            </span>
            <div className="flex bg-white/[0.06] rounded-lg p-0.5">
              <button
                onClick={() => setSortBy("top")}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  sortBy === "top" ? "bg-white/15 text-text-primary" : "text-white/40"
                }`}
              >
                সেরা
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  sortBy === "newest" ? "bg-white/15 text-text-primary" : "text-white/40"
                }`}
              >
                নতুন
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
            <ChevronDown className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-1">
          {isLoading ? (
            <CommentSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchComments} />
          ) : comments.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="কোনো মন্তব্য নেই"
              description="প্রথম মন্তব্য করুন"
            />
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Comment input */}
        <div className="px-4 py-3 border-t border-white/[0.06] bg-bg-elevated">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-white/40">You</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white/[0.06] rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="মন্তব্য লিখুন..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-white/30 outline-none border-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!commentText.trim() || sending}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                  commentText.trim()
                    ? "bg-accent-primary text-white"
                    : "bg-white/10 text-white/30"
                }`}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

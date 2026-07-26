import { useRef, useState, useCallback, useEffect, memo } from "react";
import { Pause, Volume2, VolumeX, RefreshCw } from "lucide-react";
import type { Video } from "../../types";
import { likeVideo, unlikeVideo } from "../../api/videos";
import { showApiError } from "../../api/client";
import ActionRail from "./ActionRail";
import CaptionOverlay from "./CaptionOverlay";
import MusicDisc from "./MusicDisc";
import LikeAnimation from "./LikeAnimation";

interface VideoCardProps {
  video: Video;
  isActive: boolean;
}

type VideoStatus = "loading" | "ready" | "error";

function VideoCard({ video, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [status, setStatus] = useState<VideoStatus>("loading");
  const [liked, setLiked] = useState(video.isLiked);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [shouldLoad, setShouldLoad] = useState(isActive);
  // Use a ref to allow the observed child to use it
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const pauseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const volumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastTap = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Lazy load video via IntersectionObserver
  useEffect(() => {
    const el = videoContainerRef.current;
    if (!el || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Reset for new video
  useEffect(() => {
    setProgress(0);
    setShowLikeAnimation(false);
    setStatus("loading");
    setShowVolumeSlider(false);
    setLiked(video.isLiked);
    setLikeCount(video.likes);
    setShouldLoad(isActive);
    if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
  }, [video.id, video.isLiked, video.likes, isActive]);

  // Play/pause based on active state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive && status === "ready") {
      el.currentTime = 0;
      const p = el.play();
      if (p !== undefined) p.then(() => setIsPlaying(true)).catch(() => {});
    } else if (!isActive) {
      el.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, status]);

  // Listen for global mute toggle
  useEffect(() => {
    const handler = () => toggleMute();
    window.addEventListener("sur-swag:toggle-mute", handler);
    return () => window.removeEventListener("sur-swag:toggle-mute", handler);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    setProgress(0);
    setStatus("ready");
    if (isActive) {
      const el = videoRef.current;
      if (el) {
        const p = el.play();
        if (p !== undefined) p.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, [isActive]);

  const handleError = useCallback(() => {
    setStatus("error");
    setIsPlaying(false);
  }, []);

  const handleRetry = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setStatus("loading");
    el.load();
  }, []);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      setShowPauseIcon(true);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      pauseTimer.current = setTimeout(() => setShowPauseIcon(false), 400);
    } else {
      const p = el.play();
      if (p !== undefined) p.then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    const el = videoRef.current;
    if (!el) return;
    el.volume = v;
    el.muted = v === 0;
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const handleVolumeBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeSlider((prev) => !prev);
    if (volumeTimer.current) clearTimeout(volumeTimer.current);
    volumeTimer.current = setTimeout(() => setShowVolumeSlider(false), 2000);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const triggerLikeAnimation = useCallback(() => {
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 900);
  }, []);

  const doLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));

    try {
      if (newLiked) {
        await likeVideo(video.id);
      } else {
        await unlikeVideo(video.id);
      }
    } catch (err) {
      // Rollback
      setLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
      showApiError(err);
    }
  }, [liked, video.id]);

  // Unified tap handler
  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < 300) {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = undefined;
      }
      triggerLikeAnimation();
      doLike();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      singleTapTimer.current = setTimeout(() => {
        if (lastTap.current !== 0) {
          togglePlay();
        }
      }, 350);
    }
  }, [triggerLikeAnimation, doLike, togglePlay]);

  // Long press menu
  const [showMenu, setShowMenu] = useState(false);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (showMenu) { setShowMenu(false); return; }
      if (e.changedTouches.length === 1) handleTap();
    },
    [handleTap, showMenu],
  );

  return (
    <div
      ref={videoContainerRef}
      className="h-full w-full relative bg-black cursor-pointer select-none overflow-hidden"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchCancel={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); setShowMenu(false); }}
      onTouchMove={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
      onClick={handleTap}
    >
      {/* Video */}
      {shouldLoad && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onError={handleError}
          preload={isActive ? "auto" : "none"}
          crossOrigin="anonymous"
        />
      )}

      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 z-15 flex items-center justify-center bg-black">
          <div className="animate-spin-load w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 z-15 flex flex-col items-center justify-center bg-black gap-3">
          <span className="text-3xl">😕</span>
          <p className="text-sm text-white/50 font-medium">ভিডিও লোড হয়নি</p>
          <button
            onClick={(e) => { e.stopPropagation(); handleRetry(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs text-white/70 active:bg-white/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Gradient overlays */}
      {status !== "error" && (
        <>
          <div className="absolute inset-0 pointer-events-none feed-gradient-bottom" />
          <div className="absolute inset-0 pointer-events-none feed-gradient-top" />
        </>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/80 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            অনুসরণ
          </span>
        </div>
        <div className="relative">
          <button
            onClick={handleVolumeBtnClick}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm active:scale-90 transition-transform"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          {showVolumeSlider && (
            <div className="absolute top-12 right-0 z-40 flex flex-col items-center gap-2 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 animate-pause-in">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider w-24"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-1 text-[10px] text-white/50">
                <span>{isMuted ? "নীরব" : `${Math.round((isMuted ? 0 : volume) * 100)}%`}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-white/15">
        <div
          className="h-full bg-white video-progress"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pause overlay */}
      {showPauseIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-pause-in">
            <Pause className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Long-press menu */}
      {showMenu && (
        <div className="absolute inset-0 z-30 bg-overlay flex flex-col items-center justify-center gap-5 animate-pause-in">
          <button className="flex flex-col items-center gap-1 text-white/90">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">💾</span>
            </div>
            <span className="text-xs font-medium">সংরক্ষণ</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/90">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">🚩</span>
            </div>
            <span className="text-xs font-medium">রিপোর্ট</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/90">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xs font-medium">স্পীড</span>
          </button>
        </div>
      )}

      {/* Like animation */}
      {showLikeAnimation && <LikeAnimation />}

      {/* Right action rail */}
      <ActionRail
        video={video}
        externalLiked={liked}
        externalLikeCount={likeCount}
        onLike={doLike}
      />

      {/* Bottom caption */}
      <CaptionOverlay video={video} />

      {/* Music disc */}
      <MusicDisc video={video} isPlaying={isPlaying} />
    </div>
  );
}

export default memo(VideoCard);

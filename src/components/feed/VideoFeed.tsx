import { useRef, useState, useCallback, useEffect } from "react";
import { useFeed } from "../../hooks/useFeed";
import VideoCard from "./VideoCard";
import { FeedSkeleton } from "../ui/Skeleton";
import { ErrorState } from "../ui/ErrorState";
import { EmptyState } from "../ui/EmptyState";
import { Video } from "lucide-react";

/* ─── Swipe Physics Config ─── */
const VELOCITY_THRESHOLD = 0.4;
const SWIPE_THRESHOLD = 0.15;
const SNAP_DURATION = 350;
const EASING = "cubic-bezier(0.15, 0.75, 0.45, 1)";

interface VideoFeedProps {
  tab?: "foryou" | "following";
}

export default function VideoFeed({ tab = "foryou" }: VideoFeedProps) {
  const {
    videos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refetch,
    sentinelRef,
  } = useFeed({ tab });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastMoveY = useRef(0);
  const lastMoveTime = useRef(0);
  const velocityY = useRef(0);
  const isDragging = useRef(false);
  const offsetY = useRef(0);
  const animFrameId = useRef(0);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyTransform = useCallback((offset: number, animate: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    const y = -(currentIndex + offset) * 100;
    if (animate) {
      el.style.transition = `transform ${SNAP_DURATION}ms ${EASING}`;
    } else {
      el.style.transition = "none";
    }
    el.style.transform = `translate3d(0, ${y}vh, 0)`;
    setIsAnimating(animate);
  }, [currentIndex]);

  const snapTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, videos.length - 1));
    offsetY.current = 0;
    setCurrentIndex(clamped);
    requestAnimationFrame(() => {
      applyTransform(0, true);
    });
  }, [videos.length, applyTransform]);

  const goNext = useCallback(() => {
    if (currentIndex < videos.length - 1) snapTo(currentIndex + 1);
  }, [currentIndex, videos.length, snapTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) snapTo(currentIndex - 1);
  }, [currentIndex, snapTo]);

  useEffect(() => {
    requestAnimationFrame(() => applyTransform(0, false));
  }, [currentIndex, applyTransform]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastMoveY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    lastMoveTime.current = Date.now();
    velocityY.current = 0;
    isDragging.current = true;
    if (containerRef.current) {
      containerRef.current.style.transition = "none";
    }
    if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const y = e.touches[0].clientY;
    const now = Date.now();
    const dt = now - lastMoveTime.current;
    if (dt > 0) {
      velocityY.current = (y - lastMoveY.current) / dt;
    }
    lastMoveY.current = y;
    lastMoveTime.current = now;

    const deltaY = (y - touchStartY.current) / window.innerHeight;
    if (currentIndex === 0 && deltaY > 0) {
      offsetY.current = deltaY * 0.3;
    } else if (currentIndex === videos.length - 1 && deltaY < 0) {
      offsetY.current = deltaY * 0.3;
    } else {
      offsetY.current = deltaY;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(0, ${-(currentIndex + offsetY.current) * 100}vh, 0)`;
    }
  }, [currentIndex, videos.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const absOffset = Math.abs(offsetY.current);
    const absVelocity = Math.abs(velocityY.current);

    if ((absOffset > SWIPE_THRESHOLD || absVelocity > VELOCITY_THRESHOLD)) {
      if (offsetY.current < 0) goNext();
      else goPrev();
    } else {
      snapTo(currentIndex);
    }
    offsetY.current = 0;
    velocityY.current = 0;
  }, [offsetY, currentIndex, goNext, goPrev, snapTo]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (isAnimating) return;
    if (Math.abs(e.deltaY) < 20) return;
    if (e.deltaY > 0) goNext();
    else goPrev();
  }, [isAnimating, goNext, goPrev]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const refs = videoRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        }
        if (bestEntry && bestEntry.intersectionRatio > 0.5) {
          const idx = Number((bestEntry.target as HTMLElement).dataset.index);
          if (!isNaN(idx) && idx !== currentIndex) {
            setCurrentIndex(idx);
            offsetY.current = 0;
          }
        }
      },
      { threshold: [0.5, 0.8] },
    );

    refs.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [currentIndex, videos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          goPrev();
          break;
        case " ":
          e.preventDefault();
          videoRefs.current[currentIndex]?.click();
          break;
        case "m":
        case "M":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("sur-swag:toggle-mute"));
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, goNext, goPrev]);

  // Show loading skeleton on initial load
  if (isLoading) {
    return <FeedSkeleton />;
  }

  // Show error with retry
  if (error && videos.length === 0) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && videos.length === 0) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <EmptyState
          icon={Video}
          title="কোনো ভিডিও নেই"
          description={tab === "following" ? "আপনি যাদের ফলো করেন তাদের ভিডিও এখানে দেখাবে" : "এখনও কোনো ভিডিও যোগ করা হয়নি"}
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Side progress dots */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-[3px]">
        {videos.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i === currentIndex
                ? "w-[4px] h-5 bg-text-primary"
                : "w-[4px] h-[4px] bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Video container */}
      <div ref={containerRef} className="flex flex-col will-change-transform" style={{ transform: "translate3d(0, 0, 0)" }}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={(el) => { videoRefs.current[index] = el; }}
            data-index={index}
            className="h-dvh w-full flex-shrink-0 relative"
          >
            <VideoCard
              video={video}
              isActive={index === currentIndex}
            />
          </div>
        ))}
        {/* Infinite scroll sentinel + loading more indicator */}
        <div ref={sentinelRef} className="h-16 w-full flex items-center justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 py-2">
              <div className="animate-spin-load w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
              <span className="text-xs text-white/50">আরও লোড হচ্ছে...</span>
            </div>
          )}
          {!hasMore && videos.length > 0 && (
            <span className="text-xs text-white/30 py-4">সব ভিডিও দেখেছেন</span>
          )}
        </div>
      </div>
    </div>
  );
}

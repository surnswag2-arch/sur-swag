import { useState, useCallback, useRef, useEffect } from "react";
import type { Video, FeedResponse } from "../types";
import { getFeed } from "../api/feed";
import { showApiError } from "../api/client";

interface UseFeedOptions {
  tab?: "foryou" | "following";
  limit?: number;
}

interface UseFeedResult {
  videos: Video[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedResult {
  const { tab = "foryou", limit = 10 } = options;
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: FeedResponse = await getFeed(undefined, limit, tab);
      setVideos(response.videos);
      cursorRef.current = response.nextCursor;
      setHasMore(response.hasMore);
    } catch (err) {
      showApiError(err);
      setError("Failed to load feed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [tab, limit]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursorRef.current) return;
    setIsLoadingMore(true);
    try {
      const response: FeedResponse = await getFeed(cursorRef.current, limit, tab);
      setVideos((prev) => [...prev, ...response.videos]);
      cursorRef.current = response.nextCursor;
      setHasMore(response.hasMore);
    } catch (err) {
      showApiError(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, limit, tab]);

  // IntersectionObserver sentinel for infinite scroll
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { threshold: 0.1 },
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, loadMore],
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return {
    videos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch: fetchFeed,
    sentinelRef,
  };
}

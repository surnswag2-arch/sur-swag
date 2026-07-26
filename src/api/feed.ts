import apiClient, { withRetry } from "./client";
import type { FeedResponse } from "../types";
import type { RawFeedResponse } from "../types/api";
import { transformVideo } from "./transformers";

export async function getFeed(
  cursor?: string,
  limit: number = 10,
  tab: "foryou" | "following" = "foryou",
): Promise<FeedResponse> {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  if (tab === "following") params.following = "true";

  const response = await withRetry(() =>
    apiClient.get<RawFeedResponse>("/videos/feed", { params }),
  );

  const rawData = response.data;
  return {
    videos: (rawData.data || []).map(transformVideo),
    nextCursor: rawData.next_cursor,
    hasMore: rawData.has_more ?? false,
  };
}

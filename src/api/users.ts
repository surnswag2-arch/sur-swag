import apiClient, { withRetry } from "./client";
import type { AuthUser, Video } from "../types";
import type { RawUser, RawVideo } from "../types/api";
import { transformUser, transformVideo } from "./transformers";

export async function getUserProfile(userId: string): Promise<AuthUser> {
  const response = await withRetry(() =>
    apiClient.get<{ user: RawUser }>(`/users/${userId}`),
  );
  return transformUser(response.data.user);
}

export async function getUserVideos(
  userId: string,
  cursor?: string,
): Promise<{ videos: Video[]; nextCursor?: string; hasMore: boolean }> {
  const params: Record<string, string | number> = { limit: 30 };
  if (cursor) params.cursor = cursor;

  const response = await withRetry(() =>
    apiClient.get<{ data: RawVideo[]; next_cursor?: string; has_more: boolean }>(
      `/users/${userId}/videos`,
      { params },
    ),
  );

  return {
    videos: (response.data.data || []).map(transformVideo),
    nextCursor: response.data.next_cursor,
    hasMore: response.data.has_more ?? false,
  };
}

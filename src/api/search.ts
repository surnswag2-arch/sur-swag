import apiClient, { withRetry } from "./client";
import type { Video, AuthUser } from "../types";
import type { RawSearchResponse } from "../types/api";
import { transformVideo, transformUser } from "./transformers";

export interface SearchResults {
  videos: Video[];
  users: AuthUser[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function searchAll(
  query: string,
  cursor?: string,
): Promise<SearchResults> {
  const params: Record<string, string | number> = { q: query, limit: 20 };
  if (cursor) params.cursor = cursor;

  const response = await withRetry(() =>
    apiClient.get<RawSearchResponse>("/search", { params }),
  );

  return {
    videos: (response.data.videos || []).map(transformVideo),
    users: (response.data.users || []).map(transformUser),
    nextCursor: response.data.next_cursor,
    hasMore: response.data.has_more ?? false,
  };
}

export async function searchVideos(
  query: string,
  cursor?: string,
): Promise<{ videos: Video[]; nextCursor?: string; hasMore: boolean }> {
  const results = await searchAll(query, cursor);
  return {
    videos: results.videos,
    nextCursor: results.nextCursor,
    hasMore: results.hasMore,
  };
}

export async function searchUsers(
  query: string,
  cursor?: string,
): Promise<{ users: AuthUser[]; nextCursor?: string; hasMore: boolean }> {
  const params: Record<string, string | number> = { q: query, type: "user", limit: 20 };
  if (cursor) params.cursor = cursor;

  const response = await withRetry(() =>
    apiClient.get<RawSearchResponse>("/search", { params }),
  );

  return {
    users: (response.data.users || []).map(transformUser),
    nextCursor: response.data.next_cursor,
    hasMore: response.data.has_more ?? false,
  };
}

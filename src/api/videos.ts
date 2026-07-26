import apiClient, { withRetry } from "./client";
import type { CommentData } from "../types";
import type { RawComment } from "../types/api";
import { transformComment } from "./transformers";

export async function likeVideo(videoId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/${videoId}/like`));
}

export async function unlikeVideo(videoId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/${videoId}/unlike`));
}

export async function bookmarkVideo(videoId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/${videoId}/bookmark`));
}

export async function unbookmarkVideo(videoId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/${videoId}/unbookmark`));
}

export async function getComments(
  videoId: string,
  cursor?: string,
): Promise<{ comments: CommentData[]; nextCursor?: string; hasMore: boolean }> {
  const params: Record<string, string | number> = { limit: 20 };
  if (cursor) params.cursor = cursor;

  const response = await withRetry(() =>
    apiClient.get<{ data: RawComment[]; next_cursor?: string; has_more: boolean }>(
      `/videos/${videoId}/comments`,
      { params },
    ),
  );

  return {
    comments: (response.data.data || []).map(transformComment),
    nextCursor: response.data.next_cursor,
    hasMore: response.data.has_more ?? false,
  };
}

export async function postComment(
  videoId: string,
  text: string,
  parentId?: string,
): Promise<CommentData> {
  const response = await withRetry(() =>
    apiClient.post<{ comment: RawComment }>(`/videos/${videoId}/comments`, {
      text,
      parent_id: parentId,
    }),
  );
  return transformComment(response.data.comment);
}

export async function likeComment(commentId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/comments/${commentId}/like`));
}

export async function unlikeComment(commentId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/comments/${commentId}/unlike`));
}

export async function deleteComment(
  videoId: string,
  commentId: string,
): Promise<void> {
  await withRetry(() =>
    apiClient.delete(`/videos/${videoId}/comments/${commentId}`),
  );
}

export async function shareVideo(videoId: string): Promise<void> {
  await withRetry(() => apiClient.post(`/videos/${videoId}/share`));
}

import apiClient, { withRetry } from "./client";
import type { Notification } from "../types";
import type { RawNotification } from "../types/api";
import { transformNotification } from "./transformers";

export async function getNotifications(
  cursor?: string,
): Promise<{ notifications: Notification[]; nextCursor?: string; hasMore: boolean }> {
  const params: Record<string, string | number> = { limit: 20 };
  if (cursor) params.cursor = cursor;

  const response = await withRetry(() =>
    apiClient.get<{ data: RawNotification[]; next_cursor?: string; has_more: boolean }>(
      "/notifications",
      { params },
    ),
  );

  return {
    notifications: (response.data.data || []).map(transformNotification),
    nextCursor: response.data.next_cursor,
    hasMore: response.data.has_more ?? false,
  };
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await withRetry(() =>
    apiClient.patch("/notifications/read", ids ? { ids } : {}),
  );
}

export async function getUnreadCount(): Promise<number> {
  const response = await withRetry(() =>
    apiClient.get<{ unread_count: number }>("/notifications/unread-count"),
  );
  return response.data.unread_count;
}

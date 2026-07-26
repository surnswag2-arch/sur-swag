import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Bell } from "lucide-react";
import { getNotifications, markNotificationsRead, getUnreadCount } from "../api/notifications";
import type { Notification } from "../types";
import { showApiError } from "../api/client";
import { NotificationSkeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "এখন";
    if (mins < 60) return `${mins} মি আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘ আগে`;
    const days = Math.floor(hours / 24);
    return `${days} দ আগে`;
  } catch {
    return ts;
  }
}

function NotificationItem({ n }: { n: Notification }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 active:bg-white/[0.04] transition-all ${
        n.read ? "" : "bg-accent-primary/[0.04]"
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={n.user.avatarUrl}
          alt=""
          className="w-11 h-11 rounded-full object-cover"
          loading="lazy"
        />
        {!n.read && (
          <div className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-accent-primary rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">
              {n.type === "like" ? "♥" : n.type === "comment" ? "💬" : n.type === "follow" ? "+" : "★"}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 leading-snug">
          <span className="font-semibold">@{n.user.username}</span>{" "}
          {n.message}
        </p>
        <span className="text-[11px] text-white/40">{formatTimestamp(n.timestamp)}</span>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState<"messages" | "notifications">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotifications();
      setNotifications(response.notifications);
      const count = await getUnreadCount().catch(() => 0);
      setUnreadCount(count);
    } catch (err) {
      showApiError(err);
      setError("নোটিফিকেশন লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMarkRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markNotificationsRead(unreadIds);
    } catch (err) {
      showApiError(err);
      fetchNotifications();
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="h-full w-full bg-bg-base flex flex-col">
      {/* Header */}
      <div className="pt-12 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold font-display text-text-primary">
            ইনবক্স
          </h1>
          {tab === "notifications" && unreadCount > 0 && (
            <button
              onClick={handleMarkRead}
              className="text-xs text-accent-primary font-semibold"
            >
              সব পড়া হয়েছে
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
          <button
            onClick={() => setTab("notifications")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "notifications"
                ? "bg-bg-base text-text-primary shadow-sm"
                : "text-white/40"
            }`}
          >
            <Bell className="w-4 h-4" />
            নোটিফিকেশন
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-accent-primary" />
            )}
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "messages"
                ? "bg-bg-base text-text-primary shadow-sm"
                : "text-white/40"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            মেসেজ
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="py-1">
          {tab === "notifications" ? (
            isLoading ? (
              <NotificationSkeleton />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchNotifications} />
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="কোনো নোটিফিকেশন নেই"
                description="নতুন নোটিফিকেশন এখানে দেখাবে"
              />
            ) : (
              notifications.map((n) => <NotificationItem key={n.id} n={n} />)
            )
          ) : (
            <EmptyState
              icon={MessageCircle}
              title="শীঘ্রই আসছে"
              description="মেসেজিং ফিচার খুব শীঘ্রই চালু হবে"
            />
          )}
        </div>
      </div>
    </div>
  );
}

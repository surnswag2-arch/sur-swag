import type { Video, Creator, Sound, Notification, AuthUser, CommentData } from "../types";
import type {
  RawVideo,
  RawCreator,
  RawSound,
  RawNotification,
  RawUser,
  RawComment,
} from "../types/api";

export function transformCreator(raw: RawCreator): Creator {
  return {
    id: raw.id,
    username: raw.username,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    isVerified: raw.is_verified,
    isFollowing: raw.is_following,
  };
}

export function transformSound(raw: RawSound): Sound {
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    coverUrl: raw.cover_url,
    usageCount: raw.usage_count,
  };
}

export function transformVideo(raw: RawVideo): Video {
  return {
    id: raw.id,
    videoUrl: raw.stream_uid
      ? `https://videodelivery.net/${raw.stream_uid}/manifest/video.m3u8`
      : raw.r2_key
        ? `${import.meta.env.VITE_API_BASE_URL || ""}/videos/stream/${raw.r2_key}`
        : "",
    coverUrl: raw.thumbnail_url || "",
    caption: raw.caption || "",
    hashtags: raw.hashtags || [],
    creator: raw.creator ? transformCreator(raw.creator) : { id: raw.creator_id, username: "", displayName: "", avatarUrl: "", isVerified: false, isFollowing: false },
    sound: raw.sound ? transformSound(raw.sound) : { id: raw.sound_id || "", title: "Original Sound", artist: "", coverUrl: "", usageCount: 0 },
    likes: raw.likes_count,
    comments: raw.comments_count,
    shares: raw.shares_count,
    bookmarks: 0,
    isLiked: raw.is_liked ?? false,
    isBookmarked: raw.is_bookmarked ?? false,
    isFollowing: raw.is_following ?? false,
    duration: raw.duration,
    createdAt: raw.created_at,
  };
}

export function transformUser(raw: RawUser): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    phone: raw.phone,
    username: raw.username,
    displayName: raw.display_name,
    bio: raw.bio,
    avatarUrl: raw.avatar_url,
    locale: raw.locale,
    isVerified: raw.is_verified,
    followersCount: raw.followers_count,
    followingCount: raw.following_count,
    createdAt: raw.created_at,
  };
}

export function transformNotification(
  raw: RawNotification,
): Notification {
  return {
    id: raw.id,
    type: (raw.type as Notification["type"]) || "like",
    user: raw.actor
      ? transformCreator(raw.actor)
      : { id: raw.actor_id || "", username: "", displayName: "", avatarUrl: "", isVerified: false, isFollowing: false },
    message: raw.message,
    timestamp: raw.created_at,
    read: raw.read,
  };
}

export function transformComment(raw: RawComment): CommentData {
  return {
    id: raw.id,
    text: raw.text,
    user: raw.user
      ? transformCreator(raw.user)
      : { id: raw.user_id, username: "", displayName: "", avatarUrl: "", isVerified: false, isFollowing: false },
    likes: raw.likes_count,
    isLiked: raw.is_liked ?? false,
    timestamp: raw.created_at,
    replies: raw.replies?.map(transformComment),
  };
}

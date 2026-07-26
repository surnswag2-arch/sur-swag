export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  isFollowing: boolean;
}

export interface Sound {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  usageCount: number;
}

export interface Video {
  id: string;
  videoUrl: string;
  coverUrl: string;
  caption: string;
  hashtags: string[];
  creator: Creator;
  sound: Sound;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  duration: number;
  createdAt: string;
}

export type Page = "feed" | "discover" | "upload" | "inbox" | "profile";

export interface Message {
  id: string;
  user: Creator;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "milestone";
  user: Creator;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SearchCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  locale: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  displayName: string;
  password: string;
  email?: string;
  phone?: string;
  locale?: string;
}

export interface OtpRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  phone?: string;
  code: string;
  password: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface FeedResponse {
  videos: Video[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface CommentData {
  id: string;
  text: string;
  user: Creator;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replies?: CommentData[];
}

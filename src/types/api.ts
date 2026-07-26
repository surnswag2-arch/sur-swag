// Raw backend response types (snake_case) for the transformer layer

export interface RawUser {
  id: string;
  email?: string;
  phone?: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  locale: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  coin_balance: number;
  created_at: string;
  updated_at: string;
}

export interface RawVideo {
  id: string;
  creator_id: string;
  caption: string;
  hashtags: string[];
  sound_id?: string;
  status: string;
  r2_key: string;
  stream_uid?: string;
  thumbnail_url: string;
  duration: number;
  width: number;
  height: number;
  privacy: string;
  allow_comments: boolean;
  allow_duet: boolean;
  allow_stitch: boolean;
  allow_download: boolean;
  locale: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields from API
  creator?: RawCreator;
  sound?: RawSound;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_following?: boolean;
}

export interface RawCreator {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_verified: boolean;
  is_following: boolean;
}

export interface RawSound {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  usage_count: number;
}

export interface RawComment {
  id: string;
  video_id: string;
  parent_id?: string;
  user_id: string;
  text: string;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user?: RawCreator;
  is_liked?: boolean;
  replies?: RawComment[];
}

export interface RawNotification {
  id: string;
  user_id: string;
  type: string;
  actor_id?: string;
  video_id?: string;
  comment_id?: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  locale: string;
  created_at: string;
  actor?: RawCreator;
}

export interface RawFeedResponse {
  data: RawVideo[];
  next_cursor?: string;
  has_more: boolean;
}

export interface RawAuthResponse {
  user: RawUser;
  token: string;
  refresh_token?: string;
}

export interface RawSearchResponse {
  videos?: RawVideo[];
  users?: RawUser[];
  next_cursor?: string;
  has_more: boolean;
}

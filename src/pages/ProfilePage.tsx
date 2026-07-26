import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Bookmark, Lock, Settings, LogOut, User } from "lucide-react";
import type { AuthUser, Video } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, getUserVideos } from "../api/users";
import { followUser, unfollowUser } from "../api/upload";
import { showApiError } from "../api/client";
import { ProfileSkeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

type ProfileTab = "videos" | "liked" | "reposts";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("videos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
  const profileId = isOwnProfile ? currentUser?.id : userId;
  const profileData = isOwnProfile ? currentUser : profile;

  const fetchProfile = useCallback(async () => {
    if (isOwnProfile) {
      setProfile(currentUser);
      setIsLoading(false);
      return;
    }
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      showApiError(err);
      setError("প্রোফাইল লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOwnProfile, currentUser]);

  const fetchVideos = useCallback(async () => {
    if (!profileId) return;
    try {
      const response = await getUserVideos(profileId);
      setVideos(response.videos);
    } catch {
      // Silently fail for videos
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
    fetchVideos();
  }, [fetchProfile, fetchVideos]);

  const handleFollow = async () => {
    if (!userId || followLoading) return;
    setFollowLoading(true);
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    try {
      if (newFollowing) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
    } catch (err) {
      setIsFollowing(!newFollowing);
      showApiError(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-bg-base">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-bg-base flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchProfile} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="h-full w-full bg-bg-base flex items-center justify-center">
        <EmptyState icon={User} title="প্রোফাইল পাওয়া যায়নি" />
      </div>
    );
  }

  const tabs: { key: ProfileTab; icon: React.ElementType; label: string }[] = [
    { key: "videos", icon: Grid, label: "ভিডিও" },
    { key: "liked", icon: Bookmark, label: "পছন্দ" },
    { key: "reposts", icon: Lock, label: "রিপোস্ট" },
  ];

  return (
    <div className="h-full w-full bg-bg-base flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-1">
        <button className="w-8 h-8 flex items-center justify-center" onClick={() => navigate("/settings")}>
          <Settings className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold font-display">
          {profileData.username}
        </h1>
        {isOwnProfile ? (
          <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-white/60" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Profile section */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-[3px] border-white/20 overflow-hidden shadow-xl">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.displayName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {profileData.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] verified-badge rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-[10px] text-white font-bold">✓</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex items-start justify-around pt-1">
              <div className="flex flex-col items-center gap-0">
                <span className="text-lg font-bold text-text-primary">{formatCount(profileData.followingCount)}</span>
                <span className="text-[11px] text-white/50 font-medium">অনুসরণ</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                <span className="text-lg font-bold text-text-primary">{formatCount(profileData.followersCount)}</span>
                <span className="text-[11px] text-white/50 font-medium">অনুসারী</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                <span className="text-lg font-bold text-text-primary">{formatCount(videos.reduce((sum, v) => sum + v.likes, 0))}</span>
                <span className="text-[11px] text-white/50 font-medium">লাইক</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[15px] font-bold text-text-primary">{profileData.displayName}</span>
              {profileData.isVerified && (
                <div className="verified-badge rounded-full w-[18px] h-[18px] flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-white/70 leading-snug">{profileData.bio}</p>
          </div>

          {/* Buttons */}
          <div className="mt-3 flex gap-2">
            {isOwnProfile ? (
              <button className="flex-1 py-2 rounded-lg border border-white/20 text-sm font-semibold text-text-primary active:bg-white/10 transition-all">
                সম্পাদনা
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isFollowing
                    ? "border border-white/20 text-text-primary active:bg-white/10"
                    : "bg-accent-primary text-white active:opacity-90"
                }`}
              >
                {isFollowing ? "ফলোইং" : "ফলো"}
              </button>
            )}
            <button className="flex-1 py-2 rounded-lg border border-white/20 text-sm font-semibold text-text-primary active:bg-white/10 transition-all">
              শেয়ার
            </button>
          </div>
        </div>

        {/* Content tabs */}
        <div className="border-t border-white/[0.06]">
          <div className="flex">
            {tabs.map(({ key, icon: Icon, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all relative ${
                    isActive ? "text-text-primary" : "text-white/40"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? "text-text-primary" : "text-white/40"}`} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-text-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video grid */}
        {activeTab === "videos" && (
          videos.length > 0 ? (
            <div className="profile-grid px-0.5 pb-20">
              {videos.map((video) => (
                <div key={video.id} className="relative aspect-[9/16] rounded-sm overflow-hidden bg-white/[0.04] group cursor-pointer active:opacity-80 transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-white/[0.04] to-white/[0.08] flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-white drop-shadow-lg">
                      ▶ {formatCount(video.likes)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <Grid className="w-12 h-12 mb-3" strokeWidth={1.5} />
              <p className="text-sm">কোনো ভিডিও নেই</p>
            </div>
          )
        )}

        {activeTab === "liked" && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Bookmark className="w-12 h-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">পছন্দ করা ভিডিও নেই</p>
          </div>
        )}

        {activeTab === "reposts" && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Lock className="w-12 h-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">রিপোস্ট করা ভিডিও নেই</p>
          </div>
        )}
      </div>
    </div>
  );
}

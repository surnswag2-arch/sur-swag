import { useState, useCallback, useRef } from "react";
import { Search, Clock, X } from "lucide-react";
import { searchVideos, searchUsers } from "../api/search";
import type { Video, AuthUser, SearchCategory } from "../types";
import { showApiError } from "../api/client";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

const searchCategories: SearchCategory[] = [
  { id: "sc1", name: "নাচ", emoji: "💃", color: "#FF3B7C" },
  { id: "sc2", name: "কমেডি", emoji: "😂", color: "#F5C042" },
  { id: "sc3", name: "গান", emoji: "🎵", color: "#7C3AED" },
  { id: "sc4", name: "খেলা", emoji: "🏏", color: "#10B981" },
  { id: "sc5", name: "রান্না", emoji: "🍛", color: "#F97316" },
  { id: "sc6", name: "ফ্যাশন", emoji: "👗", color: "#EC4899" },
  { id: "sc7", name: "ভ্রমণ", emoji: "✈️", color: "#3B82F6" },
  { id: "sc8", name: "শিক্ষা", emoji: "📚", color: "#8B5CF6" },
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [searchUsersResults, setSearchUsersResults] = useState<AuthUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch {
      return [];
    }
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showResults, setShowResults] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setShowResults(false);
      setSearchResults([]);
      setSearchUsersResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const [videoResults, userResults] = await Promise.all([
        searchVideos(q),
        searchUsers(q).catch(() => ({ users: [] })),
      ]);
      setSearchResults(videoResults.videos);
      setSearchUsersResults(userResults.users);
      setShowResults(true);

      // Save to recent
      setRecentSearches((prev) => {
        const updated = [q, ...prev.filter((s) => s !== q)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      showApiError(err);
      setSearchError("অনুসন্ধান করা যায়নি");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(value), 300);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
    setSearchResults([]);
    setSearchUsersResults([]);
  };

  return (
    <div className="h-full w-full bg-bg-base flex flex-col">
      {/* Header */}
      <div className="pt-12 px-4 pb-2">
        <h1 className="text-2xl font-bold font-display text-text-primary mb-3">
          আবিষ্কার
        </h1>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="অনুসন্ধান করুন..."
            className="w-full h-11 pl-12 pr-10 rounded-2xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border-none outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* Search Results */}
        {showResults ? (
          <div>
            {isSearching ? (
              <div className="space-y-3 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton variant="rectangular" className="w-16 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-40 h-4" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchError ? (
              <ErrorState message={searchError} onRetry={() => doSearch(query)} />
            ) : searchResults.length === 0 && searchUsersResults.length === 0 ? (
              <EmptyState
                icon={Search}
                title="কিছু পাওয়া যায়নি"
                description={`"${query}"-এর জন্য কোনো ফলাফল নেই`}
              />
            ) : (
              <div className="mt-4 space-y-3">
                {/* User results */}
                {searchUsersResults.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">ইউজার</h3>
                    {searchUsersResults.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 py-2">
                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                        <div>
                          <p className="text-sm font-semibold text-white">{user.displayName}</p>
                          <p className="text-xs text-white/40">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Video results */}
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">ভিডিও</h3>
                    <div className="grid grid-cols-3 gap-1">
                      {searchResults.map((video) => (
                        <div key={video.id} className="relative aspect-[9/16] rounded-sm overflow-hidden bg-white/[0.04]">
                          <div className="w-full h-full bg-gradient-to-br from-white/[0.04] to-white/[0.08] flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                          </div>
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="text-[10px] font-semibold text-white drop-shadow-lg">
                              ▶ {formatCount(video.likes)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Categories */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                ক্যাটাগরি
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {searchCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleInputChange(cat.name)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/[0.04] active:bg-white/[0.08] transition-all active:scale-95"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.emoji}
                    </div>
                    <span className="text-[10px] font-medium text-white/70">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-white/40" />
                  <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                    সাম্প্রতিক
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); doSearch(q); }}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs text-white/60 active:bg-white/20 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

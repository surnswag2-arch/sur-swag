interface FeedTabProps {
  activeTab: "foryou" | "following";
  onTabChange: (tab: "foryou" | "following") => void;
}

const tabs = [
  { key: "foryou" as const, label: "তোমার জন্য" },
  { key: "following" as const, label: "অনুসরণ" },
];

export default function FeedTab({ activeTab, onTabChange }: FeedTabProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-8 pt-12 pb-4 feed-gradient-top">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative text-sm font-bold tracking-wide transition-all px-0.5 ${
              isActive ? "text-text-primary" : "text-white/50"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-text-primary rounded-full animate-tab-underline" />
            )}
          </button>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import FeedTab from "../components/feed/FeedTab";
import VideoFeed from "../components/feed/VideoFeed";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");

  return (
    <div className="h-full w-full bg-bg-base relative">
      <FeedTab activeTab={activeTab} onTabChange={setActiveTab} />
      <VideoFeed tab={activeTab} />
    </div>
  );
}

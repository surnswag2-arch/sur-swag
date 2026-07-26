import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "লোড হচ্ছে...",
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      <p className="text-sm text-white/50 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base">
        {content}
      </div>
    );
  }

  return content;
}

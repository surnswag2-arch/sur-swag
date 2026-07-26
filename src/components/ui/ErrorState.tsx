import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  message = "কিছু সমস্যা হয়েছে",
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-sm text-white/60 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs text-white/70 active:bg-white/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          আবার চেষ্টা করুন
        </button>
      )}
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

import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "text", ...props }: SkeletonProps) {
  const baseClass = "animate-shimmer rounded-md";
  const variantClass =
    variant === "circular" ? "rounded-full" : variant === "text" ? "rounded-md h-4" : "rounded-lg";

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    />
  );
}

export function FeedSkeleton() {
  return (
    <div className="h-full w-full bg-black flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-dvh w-full flex-shrink-0 relative flex items-center justify-center"
        >
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton variant="rectangular" className="w-full h-full !rounded-none" />
          </div>
          {/* Action rail skeleton */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
            <Skeleton variant="circular" className="w-12 h-12" />
            <Skeleton variant="circular" className="w-[30px] h-[30px]" />
            <Skeleton variant="circular" className="w-[30px] h-[30px]" />
            <Skeleton variant="circular" className="w-[30px] h-[30px]" />
          </div>
          {/* Caption skeleton */}
          <div className="absolute left-4 right-24 bottom-28 space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-48 h-3" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" className="w-20 h-20" />
        <div className="flex-1 flex justify-around pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-10 h-5" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-64 h-3" />
        <Skeleton className="w-32 h-3" />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="aspect-[9/16]" />
        ))}
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="space-y-1 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <Skeleton variant="circular" className="w-11 h-11 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-48 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-2.5 py-2.5">
          <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-40 h-3" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

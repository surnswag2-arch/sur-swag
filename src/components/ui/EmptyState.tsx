import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "কিছুই নেই",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="w-14 h-14 text-white/20 mb-4" strokeWidth={1.5} />
      <p className="text-sm font-medium text-white/40">{title}</p>
      {description && (
        <p className="text-xs text-white/30 mt-1 text-center max-w-[200px]">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-lg bg-accent-primary text-white text-xs font-semibold active:opacity-80 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

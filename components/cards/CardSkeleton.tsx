import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="aspect-[3/4] w-full rounded-[0.375rem] bg-elevated" />
      <div className="mt-3 space-y-2 px-1">
        <div className="h-3.5 w-3/4 rounded bg-elevated" />
        <div className="h-3 w-1/2 rounded bg-elevated" />
      </div>
    </div>
  );
}

export function TrackSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5 animate-pulse", className)}>
      <div className="w-10 h-10 rounded flex-shrink-0 bg-elevated" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-1/2 rounded bg-elevated" />
        <div className="h-3 w-1/3 rounded bg-elevated" />
      </div>
      <div className="h-3 w-8 rounded bg-elevated" />
    </div>
  );
}

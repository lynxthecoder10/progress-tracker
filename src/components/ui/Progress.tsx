import { cn } from "../../lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-zinc-900", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-violet-400"
        style={{ width: `${bounded}%` }}
      />
    </div>
  );
}

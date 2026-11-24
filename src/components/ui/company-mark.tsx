import { cn } from "@/lib/cn";

export function CompanyMark({
  monogram,
  size = "md",
  className,
}: {
  monogram: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-line bg-surface-2 font-mono font-medium tracking-[-0.03em] text-ink",
        size === "xs" && "h-5 w-5 rounded-xs text-[8px]",
        size === "sm" && "h-7 w-7 rounded-sm text-[9.5px]",
        size === "md" && "h-9 w-9 rounded text-[11px]",
        size === "lg" && "h-12 w-12 rounded-md text-sm",
        className,
      )}
    >
      {monogram}
    </span>
  );
}

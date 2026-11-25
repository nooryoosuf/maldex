import { COMPANY_LOGOS } from "@/components/icons/company-logos";
import { cn } from "@/lib/cn";

export function CompanyMark({
  code,
  monogram,
  size = "md",
  className,
}: {
  code?: string;
  monogram?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const normalizedCode = (code || monogram || "").trim().toUpperCase();
  const LogoComponent = COMPANY_LOGOS[normalizedCode];

  if (LogoComponent) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded", className)}
      >
        <LogoComponent size={size} />
      </span>
    );
  }

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
      {monogram || code?.slice(0, 2) || "MV"}
    </span>
  );
}

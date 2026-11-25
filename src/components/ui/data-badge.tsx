import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const META: Record<VerificationStatus, { label: string; variant: "accent" | "warning" | "positive" | "default"; hint: string }> = {
  "official-reported": {
    label: "Official",
    variant: "accent",
    hint: "Published by an official regulatory source (MSE, MMA, CMDA, or World Bank).",
  },
  derived: {
    label: "Derived",
    variant: "accent",
    hint: "Derived by Maldex from published official inputs; calculation basis is documented.",
  },
  calculated: {
    label: "Calculated",
    variant: "accent",
    hint: "Calculated by Maldex. Inputs and method are shown with the metric.",
  },
  unavailable: {
    label: "Unavailable",
    variant: "default",
    hint: "A verified source has not yet been connected.",
  },
};

export function DataBadge({
  status,
  label,
  className,
  title,
}: {
  status: VerificationStatus;
  label?: string;
  className?: string;
  title?: string;
}) {
  const meta = META[status] ?? META["official-reported"];
  return (
    <Badge variant={meta.variant} className={cn("normal-case tracking-[0.04em]", className)} title={title ?? meta.hint}>
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          status === "unavailable" ? "bg-faint" : "bg-accent",
        )}
      />
      {label ?? meta.label}
    </Badge>
  );
}

export function VerificationNote({ status }: { status: VerificationStatus }) {
  const meta = META[status] ?? META["official-reported"];
  return <p className="mt-2 font-mono text-[10px] leading-4 text-faint">{meta.hint}</p>;
}

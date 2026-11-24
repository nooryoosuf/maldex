import { ExternalLink } from "lucide-react";
import { InfoTip } from "@/components/ui/tooltip";
import { getSource } from "@/lib/data/sources";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function SourceLabel({
  sourceId,
  className,
  showDate = true,
  compact = false,
}: {
  sourceId: string;
  className?: string;
  showDate?: boolean;
  compact?: boolean;
}) {
  const source = getSource(sourceId);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-1 font-mono text-[10px] text-muted transition-colors hover:text-ink"
      >
        <span className="truncate">{compact ? source.organisation : source.name}</span>
        <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
      </a>
      {showDate ? (
        <span className="font-mono text-[10px] text-faint">
          {compact ? "·" : "retrieved"} {formatDate(source.retrievedAt)}
        </span>
      ) : null}
      <InfoTip label="Source & verification" side="top">
        <span className="block space-y-1.5">
          <span className="block font-medium text-ink">{source.organisation}</span>
          <span className="block">{source.description}</span>
          <span className="block font-mono text-[10px] text-faint">
            Retrieved {formatDate(source.retrievedAt, "long")} · {source.updateCadence}
          </span>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            Open original source <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </span>
      </InfoTip>
    </span>
  );
}

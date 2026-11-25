"use client";

import { useRouter } from "next/navigation";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { formatMvr, formatPercent } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

export interface TreemapItem {
  code: string;
  name: string;
  sector: string;
  slug?: string;
  marketCap: number;
  price: number | null;
  changePct: number | null;
}

interface CustomTileProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  code?: string;
  name?: string;
  marketCap?: number;
  changePct?: number | null;
  slug?: string;
  total?: number;
  onSelect?: (slug?: string) => void;
}

function CustomTreemapTile({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  code,
  name,
  marketCap = 0,
  changePct,
  slug,
  total = 1,
  onSelect,
}: CustomTileProps) {
  if (width < 16 || height < 16 || !code) return null;

  const isUp = (changePct ?? 0) > 0;
  const isDown = (changePct ?? 0) < 0;
  const share = total > 0 ? (marketCap / total) * 100 : 0;

  const fill = isUp
    ? "rgb(var(--positive) / 0.16)"
    : isDown
      ? "rgb(var(--negative) / 0.16)"
      : "rgb(var(--accent) / 0.11)";

  const stroke = isUp
    ? "rgb(var(--positive) / 0.35)"
    : isDown
      ? "rgb(var(--negative) / 0.35)"
      : "rgb(var(--border-strong))";

  const showName = width > 110 && height > 66;
  const showCap = width > 74 && height > 46;
  const showChange = width > 64 && height > 84 && changePct !== null && changePct !== undefined;

  return (
    <g
      onClick={() => onSelect?.(slug)}
      className={cn(slug && "cursor-pointer")}
      role={slug ? "link" : undefined}
    >
      <rect
        x={x + 2}
        y={y + 2}
        width={Math.max(0, width - 4)}
        height={Math.max(0, height - 4)}
        rx={5}
        ry={5}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        className="transition-opacity duration-150 hover:opacity-85"
      />
      {width > 40 && height > 26 ? (
        <text
          x={x + 10}
          y={y + 19}
          fill="rgb(var(--text))"
          fontSize={width > 95 ? 12 : 10}
          fontWeight={600}
          fontFamily="JetBrains Mono Variable, monospace"
        >
          {code}
          {width > 125 ? ` · ${share.toFixed(0)}%` : ""}
        </text>
      ) : null}
      {showName ? (
        <text
          x={x + 10}
          y={y + 35}
          fill="rgb(var(--muted))"
          fontSize={10.5}
          fontFamily="Inter Variable, sans-serif"
        >
          {String(name ?? "").length > Math.floor(width / 7.2)
            ? `${String(name).slice(0, Math.max(6, Math.floor(width / 7.2) - 1))}…`
            : name}
        </text>
      ) : null}
      {showCap ? (
        <text
          x={x + 10}
          y={y + (showName ? 52 : 35)}
          fill="rgb(var(--text))"
          fontSize={10.5}
          fontWeight={500}
          fontFamily="JetBrains Mono Variable, monospace"
        >
          {formatMvr(marketCap, { compact: true })}
        </text>
      ) : null}
      {showChange ? (
        <text
          x={x + 10}
          y={y + (showName ? 68 : 50)}
          fill={isUp ? "rgb(var(--positive))" : isDown ? "rgb(var(--negative))" : "rgb(var(--muted))"}
          fontSize={10}
          fontWeight={600}
          fontFamily="JetBrains Mono Variable, monospace"
        >
          {formatPercent(changePct ?? 0, 2, true)}
        </text>
      ) : null}
    </g>
  );
}

export function CompositionTreemap({
  items,
  height = 270,
  className,
}: {
  items: TreemapItem[];
  height?: number;
  className?: string;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const valid = items
    .filter((item) => Number.isFinite(item.marketCap) && item.marketCap > 0)
    .sort((a, b) => b.marketCap - a.marketCap);

  const total = valid.reduce((sum, item) => sum + item.marketCap, 0);

  if (!valid.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-line text-xs text-muted">
        No market capitalisation data available.
      </div>
    );
  }

  const treemapData = valid.map((item) => ({
    ...item,
    size: item.marketCap,
    total,
  }));

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          nameKey="code"
          aspectRatio={4 / 3}
          isAnimationActive={!reduced}
          animationDuration={380}
          content={
            <CustomTreemapTile
              total={total}
              onSelect={(slug) => {
                if (slug) router.push(`/companies/${slug}`);
              }}
            />
          }
        >
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const node = payload[0].payload as TreemapItem & { total: number };
              const share = node.total > 0 ? (node.marketCap / node.total) * 100 : 0;
              return (
                <div className="min-w-[185px] rounded-lg border border-line bg-surface/95 px-3 py-2.5 shadow-pop backdrop-blur-md dark:shadow-pop-dark">
                  <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-1.5">
                    <span className="text-xs font-semibold text-ink">{node.name}</span>
                    <span className="font-mono text-[10px] text-accent">{node.code}</span>
                  </div>
                  <div className="mt-1.5 space-y-1 text-[11px]">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Market cap</span>
                      <span className="num font-mono font-medium text-ink">{formatMvr(node.marketCap, { compact: true })}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Exchange share</span>
                      <span className="num font-mono text-ink">{formatPercent(share, 1)}</span>
                    </div>
                    {node.price !== null ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Last price</span>
                        <span className="num font-mono text-ink">{formatMvr(node.price, { digits: 2 })}</span>
                      </div>
                    ) : null}
                    {node.changePct !== null ? (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted">Session move</span>
                        <span
                          className={cn(
                            "num font-mono font-medium",
                            node.changePct > 0 ? "text-positive" : node.changePct < 0 ? "text-negative" : "text-muted",
                          )}
                        >
                          {formatPercent(node.changePct, 2, true)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

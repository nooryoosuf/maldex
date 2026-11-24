import { cn } from "@/lib/cn";

export function Sparkline({
  data,
  width = 96,
  height = 28,
  className,
  positive,
  strokeWidth = 1.5,
  fill = true,
}: {
  data: (number | null)[];
  width?: number;
  height?: number;
  className?: string;
  positive?: boolean;
  strokeWidth?: number;
  fill?: boolean;
}) {
  const clean = data.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (clean.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("text-faint", className)} aria-hidden="true">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      </svg>
    );
  }
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const pad = 2;
  const step = (width - pad * 2) / (clean.length - 1);
  const points = clean.map((value, index) => {
    const x = pad + index * step;
    const y = pad + (1 - (value - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${points.at(-1)![0].toFixed(2)},${height} L${points[0][0].toFixed(2)},${height} Z`;
  const isUp = positive ?? clean.at(-1)! >= clean[0];
  const color = isUp ? "rgb(var(--positive))" : "rgb(var(--negative))";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      {fill ? <path d={area} fill={color} opacity="0.07" /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points.at(-1)![0]} cy={points.at(-1)![1]} r="1.7" fill={color} />
    </svg>
  );
}

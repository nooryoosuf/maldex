import { Stat, StatGrid } from "@/components/ui/stat";
import { SourceLabel } from "@/components/ui/source-label";
import { Badge } from "@/components/ui/badge";
import {
  DAILY_TURNOVER,
  getIndexSparkline,
  getMarketCapSparkline,
  getMarketSnapshot,
  getMostActiveEquity,
} from "@/lib/data/market";
import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";

export function MarketSnapshot() {
  const market = getMarketSnapshot();
  const active = getMostActiveEquity();
  const turnoverSpark = DAILY_TURNOVER.slice(-24).map((point) => point.value);

  return (
    <section aria-labelledby="market-snapshot-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="mono-label mb-1">Market snapshot</p>
          <h2 id="market-snapshot-heading" className="text-lg font-semibold tracking-[-0.015em] text-ink">
            The exchange at a glance
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Snapshot · not live</Badge>
          <span className="font-mono text-[10px] text-faint">{formatDate(market.indexDate, "long")}</span>
        </div>
      </div>

      <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="MASIX"
          value={formatNumber(market.index, 2)}
          trend={market.indexChangePct}
          sub={`${formatDate(market.indexDate)} close`}
          trendLabel="1 day"
          sparkline={getIndexSparkline(30)}
          href="/market"
        />
        <Stat
          label="Market cap"
          value={formatMvr(market.marketCap, { compact: true })}
          trend={market.marketCapChangePct}
          sub="All listed equities"
          trendLabel="1 day"
          sparkline={getMarketCapSparkline(30)}
          href="/market"
        />
        <Stat
          label="1-month move"
          value={formatPercent(market.indexChange30dPct, 1, true)}
          sub="MASIX, 30 days"
          trendLabel="Price movement, not a forecast"
          valueClassName={(market.indexChange30dPct ?? 0) < 0 ? "text-negative" : "text-positive"}
          href="/market"
        />
        <Stat
          label="Latest session"
          value={formatMvr(market.sessionValue, { compact: true })}
          sub={`${formatNumber(market.sessionTrades)} trades · ${formatNumber(market.sessionVolume)} units`}
          sparkline={turnoverSpark}
          href="/market#recent-trades"
        />
        <Stat
          label="Most active"
          value={active?.code ?? "—"}
          trend={active?.changePct ?? null}
          sub={active ? `${formatMvr(active.value, { compact: true })} traded` : "No trades in dataset"}
          trendLabel="Latest session"
          href={active ? `/companies/${active.slug}` : "/market"}
        />
        <Stat
          label="Listed equities"
          value={formatNumber(market.listedEquities)}
          sub="Tracked issuers with trade data"
          badge={<Badge variant="outline">MSE</Badge>}
          href="/companies"
        />
      </StatGrid>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <SourceLabel sourceId="mse-market" />
        <span className="text-[10px] leading-4 text-faint">
          Exchange snapshot; prices may have moved since retrieval. Market capitalisation is published by MSE.
        </span>
      </div>
    </section>
  );
}

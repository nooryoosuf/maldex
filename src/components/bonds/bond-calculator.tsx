"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { BONDS, estimateCashflows, getBondById, paymentsPerYear } from "@/lib/data/bonds";
import { SegmentedControl } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { DataTable } from "@/components/ui/data-table";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatDate, formatMvr, formatNumber } from "@/lib/format";

export function BondCalculator() {
  const [bondId, setBondId] = useState(BONDS.find((bond) => bond.returnRate)?.id ?? BONDS[0].id);
  const [mode, setMode] = useState<"units" | "investment">("units");
  const [unitsInput, setUnitsInput] = useState("100");
  const [investmentInput, setInvestmentInput] = useState("");
  const [settlement, setSettlement] = useState("2026-11-24");
  const [scheduleView, setScheduleView] = useState<"chart" | "table">("chart");

  const bond = getBondById(bondId)!;
  const estimate = useMemo(
    () =>
      estimateCashflows(bond, {
        units: mode === "units" ? Number(unitsInput) : undefined,
        investment: mode === "investment" ? Number(investmentInput) : undefined,
        settlementDate: settlement,
      }),
    [bond, mode, unitsInput, investmentInput, settlement],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
      <section className="surface-panel p-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Contractual Cash-Flow Calculator</h3>
          <DataBadge status="calculated" />
        </div>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          Estimate coupon payments and principal redemption from official MSE published terms. Calculated strictly on face value without secondary-market pricing or tax assumptions.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mono-label mb-1 block">Instrument</span>
            <select
              value={bondId}
              onChange={(event) => setBondId(event.target.value)}
              className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
            >
              {BONDS.filter((item) => item.returnRate).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.issuerShort} · {item.returnRate}% {item.returnFrequency.toLowerCase()}
                </option>
              ))}
            </select>
          </label>

          <SegmentedControl
            options={[
              { value: "units", label: "By units" },
              { value: "investment", label: "By MVR amount" },
            ]}
            value={mode}
            onChange={(value) => setMode(value as "units" | "investment")}
            ariaLabel="Input mode"
            size="sm"
            fullWidth
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {mode === "units" ? (
              <label className="block">
                <span className="mono-label mb-1 block">Units ({formatMvr(bond.faceValue)}/unit)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={unitsInput}
                  onChange={(event) => setUnitsInput(event.target.value)}
                  className="h-9 w-full rounded-md border border-line bg-surface px-2.5 font-mono text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
                />
              </label>
            ) : (
              <label className="block">
                <span className="mono-label mb-1 block">Investment (MVR)</span>
                <input
                  type="number"
                  min={bond.faceValue}
                  step={bond.faceValue}
                  value={investmentInput}
                  onChange={(event) => setInvestmentInput(event.target.value)}
                  placeholder={`Min ${formatMvr(bond.faceValue)}`}
                  className="h-9 w-full rounded-md border border-line bg-surface px-2.5 font-mono text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
                />
              </label>
            )}

            <label className="block">
              <span className="mono-label mb-1 block">Settlement date</span>
              <input
                type="date"
                value={settlement}
                onChange={(event) => setSettlement(event.target.value)}
                className="h-9 w-full rounded-md border border-line bg-surface px-2.5 font-mono text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-line bg-surface-2/45 p-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="mono-label">Face value / unit</p>
              <p className="mt-0.5 num font-mono font-medium text-ink">{formatMvr(bond.faceValue)}</p>
            </div>
            <div>
              <p className="mono-label">Published coupon</p>
              <p className="mt-0.5 num font-mono font-medium text-ink">
                {bond.returnRate}% · {bond.returnFrequency.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="mono-label">Payments / year</p>
              <p className="mt-0.5 num font-mono text-ink">{paymentsPerYear(bond)}</p>
            </div>
            <div>
              <p className="mono-label">Maturity date</p>
              <p className="mt-0.5 num font-mono text-ink">{formatDate(bond.maturityDate)}</p>
            </div>
          </div>
        </div>

        {!estimate.valid ? (
          <div className="mt-4 rounded-md border border-warning/25 bg-warning/[0.06] px-3 py-2.5 text-xs leading-5 text-muted">
            {estimate.error}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-line bg-surface p-3 text-xs">
            <div>
              <p className="mono-label">Allocated units</p>
              <p className="mt-0.5 num font-mono font-medium text-ink">{formatNumber(estimate.units)}</p>
            </div>
            <div>
              <p className="mono-label">Nominal invested</p>
              <AnimatedNumber value={estimate.invested} format={(v) => formatMvr(v)} className="mt-0.5 block font-medium text-ink" />
            </div>
            <div>
              <p className="mono-label">Coupon / payment</p>
              <AnimatedNumber value={estimate.couponPerPayment} format={(v) => formatMvr(v)} className="mt-0.5 block font-medium text-ink" />
            </div>
            <div>
              <p className="mono-label">Total return (coupons + par)</p>
              <AnimatedNumber value={estimate.totalReturn} format={(v) => formatMvr(v)} className="mt-0.5 block font-semibold text-positive" />
            </div>
          </div>
        )}
      </section>

      <section className="surface-panel flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5">
            <div>
              <p className="mono-label mb-0.5">Payment Stream</p>
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Estimated Cash-Flow Schedule</h3>
            </div>
            <div className="flex items-center gap-2">
              {estimate.valid ? <Badge variant="outline">{estimate.payments.length} dates</Badge> : null}
              <SegmentedControl
                options={[
                  { value: "chart", label: "Visual" },
                  { value: "table", label: "Schedule" },
                ]}
                value={scheduleView}
                onChange={(v) => setScheduleView(v as "chart" | "table")}
                ariaLabel="Cashflow schedule view"
                size="sm"
              />
            </div>
          </div>

          {estimate.valid && estimate.payments.length ? (
            scheduleView === "chart" ? (
              <div className="p-4">
                <TimeSeriesChart
                  data={estimate.payments as unknown as Record<string, unknown>[]}
                  xKey="date"
                  series={[
                    { key: "coupon", label: "Coupon payment (MVR)", color: "rgb(var(--chart-2))" },
                    { key: "principal", label: "Principal redemption (MVR)", color: "rgb(var(--chart-1))" },
                  ]}
                  kind="stacked-bar"
                  format="compactCurrency"
                  range="ALL"
                  height={285}
                  yWidth={56}
                />
              </div>
            ) : (
              <DataTable
                data={estimate.payments as unknown as Record<string, unknown>[]}
                idKey="date"
                initialSort={{ key: "date", direction: "asc" }}
                columns={[
                  { key: "date", header: "Payment date", type: "date" },
                  { key: "coupon", header: "Coupon", type: "currency", align: "right", digits: 2 },
                  { key: "principal", header: "Principal", type: "currency", align: "right", digits: 2 },
                ]}
                pageSize={9}
                hideSearch
                csvFilename={`maldex-${bond.code}-cashflows.csv`}
                footerNote="Contractual estimate from published MSE terms"
              />
            )
          ) : (
            <div className="px-4 py-12 text-center text-xs text-muted">
              Choose an instrument with a published rate and enter a valid amount to generate the cash-flow schedule.
            </div>
          )}
        </div>

        {estimate.valid ? (
          <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Total Coupons</p>
              <p className="mt-0.5 num font-mono text-xs font-medium text-ink">{formatMvr(estimate.totalCoupons)}</p>
            </div>
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Principal</p>
              <p className="mt-0.5 num font-mono text-xs font-medium text-ink">{formatMvr(estimate.totalPrincipal)}</p>
            </div>
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Gross Cashflow</p>
              <p className="mt-0.5 num font-mono text-xs font-semibold text-positive">{formatMvr(estimate.totalReturn)}</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

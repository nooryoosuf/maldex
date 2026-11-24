"use client";

import { useMemo, useState } from "react";
import { Calculator, CalendarDays } from "lucide-react";
import { BONDS, estimateCashflows, getBondById, paymentsPerYear } from "@/lib/data/bonds";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { DataTable } from "@/components/ui/data-table";
import { formatMvr, formatDate, formatNumber } from "@/lib/format";

export function BondCalculator() {
  const [bondId, setBondId] = useState(BONDS.find((bond) => bond.returnRate)?.id ?? BONDS[0].id);
  const [mode, setMode] = useState<"units" | "investment">("units");
  const [unitsInput, setUnitsInput] = useState("100");
  const [investmentInput, setInvestmentInput] = useState("");
  const [settlement, setSettlement] = useState("2026-11-24");

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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="rounded-md border border-line bg-surface p-5">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Cash-flow calculator</h3>
          <DataBadge status="calculated" />
        </div>
        <p className="mt-1 text-[10.5px] leading-5 text-muted">
          Estimate coupons and principal from published terms. Coupons are calculated on the face value at the published
          rate and frequency; no market price, accrued interest or tax is included.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mono-label mb-1 block">Instrument</span>
            <select
              value={bondId}
              onChange={(event) => setBondId(event.target.value)}
              className="h-9 w-full rounded border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
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
              { value: "investment", label: "By amount" },
            ]}
            value={mode}
            onChange={(value) => setMode(value as "units" | "investment")}
            ariaLabel="Input mode"
            size="sm"
          />

          {mode === "units" ? (
            <label className="block">
              <span className="mono-label mb-1 block">Units (face value {formatMvr(bond.faceValue)})</span>
              <input
                type="number"
                min="1"
                step="1"
                value={unitsInput}
                onChange={(event) => setUnitsInput(event.target.value)}
                className="h-9 w-full rounded border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </label>
          ) : (
            <label className="block">
              <span className="mono-label mb-1 block">Investment amount (MVR)</span>
              <input
                type="number"
                min={bond.faceValue}
                step={bond.faceValue}
                value={investmentInput}
                onChange={(event) => setInvestmentInput(event.target.value)}
                placeholder={`Minimum ${formatMvr(bond.faceValue)}`}
                className="h-9 w-full rounded border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </label>
          )}

          <label className="block">
            <span className="mono-label mb-1 block">Settlement date</span>
            <input
              type="date"
              value={settlement}
              onChange={(event) => setSettlement(event.target.value)}
              className="h-9 w-full rounded border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </label>
        </div>

        <div className="mt-4 rounded-md border border-line bg-surface-2/50 p-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="mono-label">Face value per unit</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(bond.faceValue)}</p>
            </div>
            <div>
              <p className="mono-label">Published rate</p>
              <p className="mt-0.5 num font-mono text-ink">{bond.returnRate}% · {bond.returnFrequency.toLowerCase()}</p>
            </div>
            <div>
              <p className="mono-label">Payments per year</p>
              <p className="mt-0.5 num font-mono text-ink">{paymentsPerYear(bond)}</p>
            </div>
            <div>
              <p className="mono-label">Maturity</p>
              <p className="mt-0.5 num font-mono text-ink">{formatDate(bond.maturityDate)}</p>
            </div>
          </div>
        </div>

        {!estimate.valid ? (
          <div className="mt-4 rounded-md border border-warning/25 bg-warning/[0.06] px-3 py-2.5 text-[11px] leading-5 text-muted">
            {estimate.error}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-line bg-surface p-3 text-xs">
            <div>
              <p className="mono-label">Units</p>
              <p className="mt-0.5 num font-mono text-ink">{formatNumber(estimate.units)}</p>
            </div>
            <div>
              <p className="mono-label">Amount invested</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(estimate.invested)}</p>
            </div>
            <div>
              <p className="mono-label">Coupon per payment</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(estimate.couponPerPayment)}</p>
            </div>
            <div>
              <p className="mono-label">Annual income</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(estimate.annualIncome)}</p>
            </div>
            <div>
              <p className="mono-label">Total coupons</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(estimate.totalCoupons)}</p>
            </div>
            <div>
              <p className="mono-label">Total return</p>
              <p className="mt-0.5 num font-mono text-positive">{formatMvr(estimate.totalReturn)}</p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="mono-label mb-1">Payments</p>
            <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Estimated cash-flow schedule</h3>
          </div>
          {estimate.valid ? (
            <Badge variant="outline">{estimate.payments.length} payments</Badge>
          ) : null}
        </div>
        {estimate.valid && estimate.payments.length ? (
          <DataTable
            data={estimate.payments as unknown as Record<string, unknown>[]}
            idKey="date"
            initialSort={{ key: "date", direction: "asc" }}
            columns={[
              { key: "date", header: "Payment date", type: "date" },
              { key: "coupon", header: "Coupon", type: "currency", align: "right", digits: 2 },
              { key: "principal", header: "Principal", type: "currency", align: "right", digits: 2 },
            ]}
            pageSize={12}
            hideSearch
            csvFilename={`maldex-${bond.code}-cashflows.csv`}
            footerNote="Estimate from published terms · not a guaranteed payment"
          />
        ) : (
          <div className="px-4 py-10 text-center text-xs text-muted">
            Choose an instrument with a published rate and enter a valid amount to see a schedule.
          </div>
        )}
        {estimate.valid ? (
          <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Coupons</p>
              <p className="mt-0.5 num font-mono text-[12px] text-ink">{formatMvr(estimate.totalCoupons)}</p>
            </div>
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Principal</p>
              <p className="mt-0.5 num font-mono text-ink">{formatMvr(estimate.totalPrincipal)}</p>
            </div>
            <div className="bg-surface-2/60 px-4 py-2.5">
              <p className="mono-label">Total return</p>
              <p className="mt-0.5 num font-mono text-positive">{formatMvr(estimate.totalReturn)}</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

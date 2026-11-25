import type { BondInstrument } from "@/lib/types";

/**
 * Published contractual terms from the MSE listed-securities directory,
 * retrieved 24 Nov 2026. Issue size is shown in units exactly as published;
 * nominal value is a Maldex calculation (units × face value).
 */
export const BONDS: BondInstrument[] = [
  { id: "HDFCS2", issuer: "Housing Development Finance Corporation Plc", issuerShort: "HDFC", name: "HDFCS2", code: "HDFCS2", isin: "MV0012SHDFC5", issueSizeUnits: 89036, faceValue: 1000, currency: "MVR", returnRate: null, returnFrequency: "Semi Annual", issueDate: "2017-10-25", maturityDate: "2027-10-25", instrumentType: "Bond", sector: "Housing finance" },
  { id: "HDFCB2", issuer: "Housing Development Finance Corporation Plc", issuerShort: "HDFC", name: "HDFCB2", code: "HDFCB2", isin: "MV0013BHDFC9", issueSizeUnits: 8139, faceValue: 10000, currency: "MVR", returnRate: 7, returnFrequency: "Semi Annual", issueDate: "2018-07-01", maturityDate: "2028-07-01", instrumentType: "Bond", sector: "Housing finance" },
  { id: "HDFCS3", issuer: "Housing Development Finance Corporation Plc", issuerShort: "HDFC", name: "HDFCS3", code: "HDFCS3", isin: "MV0016BHDFC2", issueSizeUnits: 126931, faceValue: 1000, currency: "MVR", returnRate: 7, returnFrequency: "Semi Annual", issueDate: "2019-12-05", maturityDate: "2029-12-05", instrumentType: "Bond", sector: "Housing finance" },
  { id: "HDFCB3", issuer: "Housing Development Finance Corporation Plc", issuerShort: "HDFC", name: "HDFCB3", code: "HDFCB3", isin: "MV0015BHDFC4", issueSizeUnits: 80000, faceValue: 1000, currency: "MVR", returnRate: null, returnFrequency: "Semi Annual", issueDate: "2019-12-05", maturityDate: "2029-12-05", instrumentType: "Bond", sector: "Housing finance" },
  { id: "HDFCS4", issuer: "Housing Development Finance Corporation Plc", issuerShort: "HDFC", name: "HDFCS4", code: "HDFCS4", isin: "MV0017BHDFC0", issueSizeUnits: 168403, faceValue: 1000, currency: "MVR", returnRate: null, returnFrequency: "Semi Annual", issueDate: "2021-12-02", maturityDate: "2031-12-02", instrumentType: "Bond", sector: "Housing finance" },
  { id: "GOVTB1", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB1", code: "GOVTB1", isin: "MV0022BGOM8", issueSizeUnits: 50000, faceValue: 1000, currency: "MVR", returnRate: 5.5, returnFrequency: "Semi Annual", issueDate: "2023-12-25", maturityDate: "2028-12-25", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB2", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB2", code: "GOVTB2", isin: "MV0028B0GOM2", issueSizeUnits: 250000, faceValue: 1000, currency: "MVR", returnRate: 5.5, returnFrequency: "Semi Annual", issueDate: "2019-11-25", maturityDate: "2029-11-25", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB3", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB3", code: "GOVTB3", isin: "MV0029B0GOM1", issueSizeUnits: 459000, faceValue: 1000, currency: "MVR", returnRate: 5.1, returnFrequency: "Semi Annual", issueDate: "2021-12-14", maturityDate: "2027-12-24", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB4", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB4", code: "GOVTB4", isin: "MV0030B0GOM8", issueSizeUnits: 550000, faceValue: 1000, currency: "MVR", returnRate: 5.5, returnFrequency: "Semi Annual", issueDate: "2022-10-17", maturityDate: "2032-10-17", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB5", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB5", code: "GOVTB5", isin: "MV0031B0GOM7", issueSizeUnits: 503000, faceValue: 1000, currency: "MVR", returnRate: 5.55, returnFrequency: "Semi Annual", issueDate: "2023-05-16", maturityDate: "2033-05-16", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB6", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB6", code: "GOVTB6", isin: "MV0032B0GOM6", issueSizeUnits: 309000, faceValue: 1000, currency: "MVR", returnRate: 5.8, returnFrequency: "Semi Annual", issueDate: "2023-08-14", maturityDate: "2033-08-14", instrumentType: "Bond", sector: "Government" },
  { id: "GOVTB7", issuer: "Government of the Republic of Maldives", issuerShort: "Government", name: "GOVTB7", code: "GOVTB7", isin: "MV0033B0GOM5", issueSizeUnits: 300000, faceValue: 1000, currency: "MVR", returnRate: 5.5, returnFrequency: "Semi Annual", issueDate: "2024-04-14", maturityDate: "2029-04-14", instrumentType: "Bond", sector: "Government" },
  { id: "EURMB1", issuer: "Euro Marketing Pvt Ltd", issuerShort: "Euro Marketing", name: "EURMB1", code: "EURMB1", isin: "MV0018BEURM3", issueSizeUnits: 25000, faceValue: 1000, currency: "MVR", returnRate: 7.5, returnFrequency: "Annual", issueDate: "2023-03-09", maturityDate: "2027-03-09", instrumentType: "Bond", sector: "Wholesale & retail" },
  { id: "MEDTS1", issuer: "Medtech Diagnostics Pvt Ltd", issuerShort: "Medtech", name: "MEDTS1", code: "MEDTS1", isin: "MV0019SMEDT7", issueSizeUnits: 20480, faceValue: 1000, currency: "MVR", returnRate: null, returnFrequency: "Semi Annual", issueDate: "2023-05-26", maturityDate: "2030-05-26", instrumentType: "Bond", sector: "Healthcare" },
  { id: "MPLB1", issuer: "Maldives Ports Limited", issuerShort: "Maldives Ports", name: "MPLB1", code: "MPLB1", isin: "MV00020BMPL9", issueSizeUnits: 50000, faceValue: 1000, currency: "MVR", returnRate: 7, returnFrequency: "Annual", issueDate: "2023-07-04", maturityDate: "2030-07-04", instrumentType: "Bond", sector: "Ports" },
  { id: "MFLCB1", issuer: "Maldives Finance and Leasing Company Pvt Ltd", issuerShort: "MFLC", name: "MFLCB1", code: "MFLCB1", isin: "MV0021BMFLC5", issueSizeUnits: 1125, faceValue: 100000, currency: "MVR", returnRate: 6.5, returnFrequency: "Semi Annual", issueDate: "2023-09-28", maturityDate: "2028-09-28", instrumentType: "Bond", sector: "Financial services" },
  { id: "EYECS1", issuer: "EyeCare Pvt Ltd", issuerShort: "EyeCare", name: "EYECS1", code: "EYECS1", isin: "MV0023SEYEC8", issueSizeUnits: 26070, faceValue: 1000, currency: "MVR", returnRate: 8, returnFrequency: "Semi Annual", issueDate: "2024-03-28", maturityDate: "2029-03-28", instrumentType: "Bond", sector: "Healthcare" },
  { id: "IUMHS1", issuer: "IUM Holdings Pvt Ltd", issuerShort: "IUM Holdings", name: "IUMHS1", code: "IUMHS1", isin: "MV0024SIUMH7", issueSizeUnits: 60, faceValue: 1000000, currency: "MVR", returnRate: 9, returnFrequency: "Semi Annual", issueDate: "2024-08-11", maturityDate: "2034-08-10", instrumentType: "Bond", sector: "Education" },
  { id: "MWSCB1", issuer: "Male' Water and Sewerage Company", issuerShort: "MWSC", name: "MWSCB1", code: "MWSCB1", isin: "MV0025BMWSC6", issueSizeUnits: 111155, faceValue: 1000, currency: "MVR", returnRate: 7.5, returnFrequency: "Annual", issueDate: "2025-01-29", maturityDate: "2030-01-29", instrumentType: "Bond", sector: "Water & sewerage" },
  { id: "ADKHB1", issuer: "ADK Hospitals Pvt Ltd", issuerShort: "ADK Hospitals", name: "ADKHB1", code: "ADKHB1", isin: "MV0026BADKH5", issueSizeUnits: 50000, faceValue: 1000, currency: "MVR", returnRate: 8, returnFrequency: "Annual", issueDate: "2025-05-13", maturityDate: "2030-05-15", instrumentType: "Bond", sector: "Healthcare" },
  { id: "FEDOB1", issuer: "Fedo Pvt Ltd", issuerShort: "Fedo", name: "FEDOB1", code: "FEDOB1", isin: "MV0027BFEDO1", issueSizeUnits: 48905, faceValue: 1000, currency: "MVR", returnRate: 8.5, returnFrequency: "Semi Annual", issueDate: "2025-09-28", maturityDate: "2030-09-28", instrumentType: "Bond", sector: "Construction" },
  { id: "REEFS1", issuer: "Reefside Sukuk Pvt Ltd", issuerShort: "Reefside", name: "REEFS1", code: "REEFS1", isin: "MV0034SREEF2", issueSizeUnits: 23320, faceValue: 1000, currency: "MVR", returnRate: 8.5, returnFrequency: "Semi Annual", issueDate: "2026-02-19", maturityDate: "2035-02-18", instrumentType: "Sukuk", sector: "Sukuk" },
  { id: "ADKHB2", issuer: "ADK Hospitals Pvt Ltd", issuerShort: "ADK Hospitals", name: "ADKHB2", code: "ADKHB2", isin: null, issueSizeUnits: 70000, faceValue: 1000, currency: "MVR", returnRate: 8, returnFrequency: "Annual", issueDate: "2026-05-19", maturityDate: "2031-05-20", instrumentType: "Bond", sector: "Healthcare" },
  { id: "MHAS1", issuer: "MHA Pvt Ltd", issuerShort: "MHA", name: "MHAS1", code: "MHAS1", isin: null, issueSizeUnits: 30000, faceValue: 1000, currency: "MVR", returnRate: 8, returnFrequency: "Semi Annual", issueDate: "2026-08-30", maturityDate: "2031-08-30", instrumentType: "Bond", sector: "Consumer goods" },
];

export const BOND_SOURCE_RETRIEVED = "2026-11-24T14:40:00.000Z";

export function getBondById(id: string): BondInstrument | undefined {
  return BONDS.find((bond) => bond.id.toLowerCase() === id.toLowerCase());
}

export function nominalIssueValue(bond: BondInstrument): number {
  return bond.issueSizeUnits * bond.faceValue;
}

export function paymentsPerYear(bond: BondInstrument): number {
  return bond.returnFrequency === "Semi Annual" ? 2 : bond.returnFrequency === "Quarterly" ? 4 : 1;
}

export interface MaturityYear {
  year: number;
  count: number;
  nominalValue: number;
  instruments: BondInstrument[];
}

export function getMaturityCalendar(): MaturityYear[] {
  const grouped = new Map<number, BondInstrument[]>();
  for (const bond of BONDS) {
    const year = Number(bond.maturityDate.slice(0, 4));
    grouped.set(year, [...(grouped.get(year) ?? []), bond]);
  }
  return [...grouped.entries()]
    .map(([year, instruments]) => ({
      year,
      count: instruments.length,
      nominalValue: instruments.reduce((sum, bond) => sum + nominalIssueValue(bond), 0),
      instruments: instruments.sort((a, b) => a.maturityDate.localeCompare(b.maturityDate)),
    }))
    .sort((a, b) => a.year - b.year);
}

export function getUpcomingMaturities(
  fromDate = new Date().toISOString().slice(0, 10),
  months = 30,
): BondInstrument[] {
  const end = new Date(`${fromDate}T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + months);
  return BONDS.filter(
    (bond) => bond.maturityDate >= fromDate && bond.maturityDate <= end.toISOString().slice(0, 10),
  ).sort((a, b) => a.maturityDate.localeCompare(b.maturityDate));
}

export function getReturnComparison(): BondInstrument[] {
  return BONDS.filter((bond) => bond.returnRate !== null).sort(
    (a, b) => (b.returnRate ?? 0) - (a.returnRate ?? 0),
  );
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, daysInMonth));
  return d;
}

export interface CashflowPayment {
  date: string;
  coupon: number;
  principal: number;
}

export interface CashflowEstimate {
  units: number;
  invested: number;
  couponPerPayment: number;
  payments: CashflowPayment[];
  totalCoupons: number;
  totalPrincipal: number;
  totalReturn: number;
  annualIncome: number;
  valid: boolean;
  error?: string;
}

export function estimateCashflows(
  bond: BondInstrument,
  input: { units?: number; investment?: number; settlementDate?: string },
): CashflowEstimate {
  const frequency = paymentsPerYear(bond);
  const todayIso = new Date().toISOString().slice(0, 10);
  const settlement = new Date(`${input.settlementDate ?? todayIso}T00:00:00Z`);
  const maturity = new Date(`${bond.maturityDate}T00:00:00Z`);

  const units =
    input.units && input.units > 0
      ? Math.floor(input.units)
      : input.investment && input.investment > 0
        ? Math.floor(input.investment / bond.faceValue)
        : 0;

  const empty: CashflowEstimate = {
    units,
    invested: units * bond.faceValue,
    couponPerPayment: 0,
    payments: [],
    totalCoupons: 0,
    totalPrincipal: 0,
    totalReturn: 0,
    annualIncome: 0,
    valid: false,
  };

  if (!bond.returnRate) {
    return { ...empty, error: "No coupon rate is published for this instrument." };
  }
  if (units <= 0) {
    return { ...empty, error: "Enter at least one unit or an amount at least equal to the face value." };
  }
  if (settlement >= maturity) {
    return { ...empty, error: "The settlement date must be before the maturity date." };
  }

  const couponPerPayment = (units * bond.faceValue * (bond.returnRate / 100)) / frequency;
  const payments: CashflowPayment[] = [];
  let cursor = new Date(`${bond.issueDate}T00:00:00Z`);
  let guard = 0;
  while (cursor < maturity && guard < 200) {
    cursor = addMonths(cursor, 12 / frequency);
    guard++;
    if (cursor > settlement) {
      const isMaturity = cursor.getTime() >= maturity.getTime();
      payments.push({
        date: (isMaturity ? maturity : cursor).toISOString().slice(0, 10),
        coupon: Math.round(couponPerPayment * 100) / 100,
        principal: isMaturity ? units * bond.faceValue : 0,
      });
    }
    if (cursor.getTime() >= maturity.getTime()) break;
  }

  const totalCoupons = payments.reduce((sum, p) => sum + p.coupon, 0);
  const totalPrincipal = payments.reduce((sum, p) => sum + p.principal, 0);

  return {
    units,
    invested: units * bond.faceValue,
    couponPerPayment: Math.round(couponPerPayment * 100) / 100,
    payments,
    totalCoupons: Math.round(totalCoupons * 100) / 100,
    totalPrincipal,
    totalReturn: Math.round((totalCoupons + totalPrincipal - units * bond.faceValue) * 100) / 100,
    annualIncome: Math.round(couponPerPayment * frequency * 100) / 100,
    valid: true,
  };
}

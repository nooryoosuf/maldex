import React from "react";

export interface CompanyLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 44,
  xl: 56,
};

/**
 * Bank of Maldives (BML)
 * Signature red sail / dynamic wave emblem
 */
export function BmlLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bank of Maldives"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#E11927" />
      {/* Dynamic Maldivian Dhoni sail curves */}
      <path
        d="M13 36C13 22 25 13 35 12C31 20 27 27 19 32C16.5 33.6 14.5 35 13 36Z"
        fill="white"
      />
      <path
        d="M20 36C22.5 30 28 24 35 22C32 28 28 33 22 36H20Z"
        fill="white"
        opacity="0.85"
      />
      <circle cx="33" cy="14" r="2.2" fill="#FFE5E7" />
    </svg>
  );
}

/**
 * Dhivehi Raajjeyge Gulhun (Dhiraagu - DHR)
 * Iconic vibrant orange telecom wave flame
 */
export function DhiraaguLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Dhiraagu"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#FF6600" />
      {/* Characteristic Dhiraagu flame / dynamic signal curve */}
      <path
        d="M24 10C24 10 28 17 25 22C23 25 19 25 18 28C16.5 32 20 37 25 37C31 37 35 32 35 25C35 17 28 12 24 10Z"
        fill="white"
      />
      <path
        d="M23 23C23.5 21 25.5 19 26 17C27.5 20 28 24 25.5 26C24 27.2 22 26.5 23 23Z"
        fill="#FF6600"
      />
      <circle cx="20.5" cy="16.5" r="2.5" fill="white" />
    </svg>
  );
}

/**
 * Ooredoo Maldives (OMPL)
 * Global red badge with iconic phonetic rings
 */
export function OoredooLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ooredoo Maldives"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#ED1C24" />
      {/* Ooredoo characteristic rounded loop circles */}
      <circle cx="17" cy="24" r="7.5" stroke="white" strokeWidth="3.2" />
      <circle cx="31" cy="24" r="7.5" stroke="white" strokeWidth="3.2" />
      <circle cx="17" cy="24" r="2.2" fill="white" />
      <circle cx="31" cy="24" r="2.2" fill="white" />
    </svg>
  );
}

/**
 * State Trading Organization (STO)
 * Deep blue hexagon emblem with trading chevron
 */
export function StoLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="State Trading Organization"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#004B87" />
      {/* STO geometric cube / chevron trading badge */}
      <path
        d="M24 11L36 18V30L24 37L12 30V18L24 11Z"
        stroke="white"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M24 11V37M12 18L36 30M12 30L36 18"
        stroke="white"
        strokeWidth="1.8"
        strokeOpacity="0.4"
      />
      <path
        d="M17 24L24 20L31 24L24 28L17 24Z"
        fill="#E0292B"
      />
    </svg>
  );
}

/**
 * Maldives Transport & Contracting Company (MTCC)
 * Emerald ocean wave and infrastructure propeller mark
 */
export function MtccLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MTCC"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#008080" />
      {/* MTCC Maritime Transport waves and Contracting gears */}
      <path
        d="M12 31C16 28 20 28 24 31C28 34 32 34 36 31"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 25C16 22 20 22 24 25C28 28 32 28 36 25"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Ship ferry / dredger bridge silhouette */}
      <path
        d="M20 19L24 13L28 19H20Z"
        fill="white"
      />
      <circle cx="24" cy="18" r="1.5" fill="#008080" />
    </svg>
  );
}

/**
 * Maldives Islamic Bank (MIB)
 * Islamic forest green geometric 8-point star (Rub el Hizb) with gold crescent
 */
export function MibLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Maldives Islamic Bank"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#005A36" />
      {/* Islamic geometric 8-point star */}
      <g transform="translate(24, 24)">
        <rect x="-10" y="-10" width="20" height="20" rx="1" fill="#C5A059" />
        <rect x="-10" y="-10" width="20" height="20" rx="1" fill="#C5A059" transform="rotate(45)" />
        <circle cx="0" cy="0" r="7.5" fill="#005A36" />
        {/* Crescent */}
        <path
          d="M1.5 -4C-1.8 -4 -4 -1.8 -4 1.5C-4 4.8 -1.8 7 1.5 7C0 6.5 -1.2 5 -1.2 3.2C-1.2 1.4 0.2 -0.2 1.5 -0.5V-4Z"
          fill="#C5A059"
          transform="translate(-0.5, -1)"
        />
      </g>
    </svg>
  );
}

/**
 * Amana Takaful Maldives (ATM)
 * Protective Islamic insurance green shield & floral leaf motif
 */
export function AmanaTakafulLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Amana Takaful Maldives"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#007A3D" />
      {/* Mutual protection takaful shield */}
      <path
        d="M24 11C24 11 32 13 34 20C36 27 30 33 24 37C18 33 12 27 14 20C16 13 24 11 24 11Z"
        fill="white"
      />
      {/* Palm leaf / seedling inside */}
      <path
        d="M24 15V32M24 20C21 18 18 19 18 22C20 23 23 22 24 22M24 25C27 23 30 24 30 27C28 28 25 27 24 27"
        stroke="#007A3D"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Maldives Tourism Development Corporation (MTDC)
 * Turquoise Maldivian ocean with golden sun and coconut palm
 */
export function MtdcLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Maldives Tourism Development Corporation"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#008891" />
      {/* Golden Maldivian Sun */}
      <circle cx="31" cy="19" r="6" fill="#F4B41A" />
      {/* Island / beach wave */}
      <path
        d="M10 33C15 30 20 31 25 33C30 35 35 34 38 31V37H10V33Z"
        fill="#005860"
      />
      {/* Maldivian Palm silhouette */}
      <path
        d="M17 34C18 27 20 23 22 17"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M22 17C18 15 14 16 13 18M22 17C20 13 17 12 15 13M22 17C25 14 28 14 30 16M22 17C24 18 26 20 27 22"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Centurion Plc (CPLC)
 * Maritime blue logistics shield & navigation compass
 */
export function CenturionLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Centurion Plc"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#1A365D" />
      {/* Centurion "C" shield emblem */}
      <circle cx="24" cy="24" r="13" stroke="white" strokeWidth="2.8" />
      <path
        d="M29 18C27 16 23 16 20 18C16.5 21.5 16.5 26.5 20 30C23 32 27 32 29 30"
        stroke="#E2B714"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Navigation compass cross */}
      <path d="M24 15V33M15 24H33" stroke="white" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

/**
 * Maldives Monetary Authority (MMA)
 * Central Bank of Maldives official gold & navy seal
 */
export function MmaLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Maldives Monetary Authority"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0A2240" />
      <circle cx="24" cy="24" r="14" stroke="#D4AF37" strokeWidth="1.8" />
      <circle cx="24" cy="24" r="11.5" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      {/* Central authority heraldic emblem: Maldivian sail & palm */}
      <path
        d="M24 16V29M20 28H28"
        stroke="#D4AF37"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24 18L19 25H24"
        fill="#D4AF37"
      />
      <circle cx="24" cy="15" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

/**
 * Capital Market Development Authority (CMDA)
 * Regulator emblem
 */
export function CmdaLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Capital Market Development Authority"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0F766E" />
      {/* CMDA growth pillar */}
      <path
        d="M15 32V25M21 32V20M27 32V16M33 32V12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 23L27 14L34 10"
        stroke="#FCD34D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Maldives Stock Exchange (MSE)
 * Exchange emblem
 */
export function MseLogo({ size = "md", className, ...props }: CompanyLogoProps) {
  const dim = SIZE_MAP[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Maldives Stock Exchange"
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#0369A1" />
      <path
        d="M13 31L20 22L27 27L35 15"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="15" r="2.8" fill="#38BDF8" />
    </svg>
  );
}

export const COMPANY_LOGOS: Record<string, React.FC<CompanyLogoProps>> = {
  BML: BmlLogo,
  DHR: DhiraaguLogo,
  OMPL: OoredooLogo,
  STO: StoLogo,
  MTCC: MtccLogo,
  MIB: MibLogo,
  ATM: AmanaTakafulLogo,
  MTDC: MtdcLogo,
  CPLC: CenturionLogo,
  MMA: MmaLogo,
  CMDA: CmdaLogo,
  MSE: MseLogo,
};

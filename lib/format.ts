import { formatUnits } from "viem";

const SAND_DECIMALS = 18;

/** 3000000000000000000000000000n → "3,000,000,000" (or "3B" when compact). */
export function formatSand(wei: bigint, { compact = false, maxDecimals = 2 } = {}) {
  const n = Number(formatUnits(wei, SAND_DECIMALS));
  return new Intl.NumberFormat(undefined, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : maxDecimals,
  }).format(n);
}

export function percent(part: bigint, whole: bigint) {
  if (whole === BigInt(0)) return "0%";
  const bp = Number((part * BigInt(10_000)) / whole) / 100;
  return `${bp.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** "2 minutes ago", "yesterday", … */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), "hour");
  return rtf.format(Math.round(seconds / 86_400), "day");
}

/** 0x1234…abcd */
export function shortAddress(address: string | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

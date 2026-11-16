"use client";

import { mainnet, polygon } from "wagmi/chains";
import { LAND_GRID_SIZE } from "@/lib/contracts";
import { formatSnapshotDate, useLandSnapshot } from "@/lib/land-snapshot";
import { useSandSnapshot } from "@/app/economy/use-sand";
import { formatSand, percent } from "@/lib/format";

const TOTAL_PARCELS = LAND_GRID_SIZE * LAND_GRID_SIZE;
const fmt = (n: number) => n.toLocaleString();

/**
 * Whole-map numbers can't be read live (166k parcels), so these come from the
 * saved snapshot and say so.
 */
export function useOverviewStats() {
  const land = useLandSnapshot();
  const sand = useSandSnapshot();
  const c = land.data?.counts;
  return {
    ready: !!land.data && !!sand.data,
    snapshotDate: land.data?.createdAt,
    polygon: c?.p ?? 0,
    ethereum: (c?.e ?? 0) + (c?.c ?? 0),
    unminted: c?.u ?? 0,
    minted: (c?.p ?? 0) + (c?.e ?? 0) + (c?.c ?? 0),
    sandTotal: sand.data ? BigInt(sand.data.totalSupply[mainnet.id]) : undefined,
    sandPolygon: sand.data ? BigInt(sand.data.totalSupply[polygon.id]) : undefined,
  };
}

/** Big number shown on a token card. */
export function TokenStat({ kind }: { kind: "land" | "sand" | "assets" }) {
  const s = useOverviewStats();
  if (kind === "assets") return <Stat value="ERC-1155" label="one design, many copies" />;
  if (!s.ready) return <span className="block h-12 w-40 animate-pulse bg-surface-3" />;
  if (kind === "land") return <Stat value={fmt(s.minted)} label={`of ${fmt(TOTAL_PARCELS)} parcels minted`} />;
  return <Stat value={formatSand(s.sandTotal!, { compact: true })} label="SAND, fixed total supply" />;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <p className="flex flex-col">
      <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </p>
  );
}

/** Stacked bar: where the 166,464 parcels live. */
export function ChainSplit() {
  const s = useOverviewStats();
  if (!s.ready) return <span className="block h-28 animate-pulse bg-surface-2" />;

  const segments = [
    { label: "On Polygon", value: s.polygon, className: "bg-land-polygon" },
    { label: "On Ethereum", value: s.ethereum, className: "bg-land-ethereum" },
    { label: "Not minted", value: s.unminted, className: "bg-surface-3" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={segments.map((g) => `${g.label}: ${fmt(g.value)} parcels`).join(", ")}
        className="flex h-6 w-full overflow-hidden border border-line"
      >
        {segments.map((g) => (
          <span key={g.label} className={g.className} style={{ width: `${(g.value / TOTAL_PARCELS) * 100}%` }} />
        ))}
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {segments.map((g) => (
          <div key={g.label} className="flex items-start gap-2">
            <span className={`mt-1.5 size-3 shrink-0 border border-line ${g.className}`} />
            <div>
              <dt className="text-sm text-muted">{g.label}</dt>
              <dd className="text-xl font-semibold tabular-nums">
                {fmt(g.value)}{" "}
                <span className="text-sm font-normal text-muted">({((g.value / TOTAL_PARCELS) * 100).toFixed(0)}%)</span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <p className="text-sm text-subtle">
        {s.sandPolygon !== undefined && s.sandTotal !== undefined && (
          <>
            For comparison, only {percent(s.sandPolygon, s.sandTotal)} of SAND has been bridged to Polygon.{" "}
          </>
        )}
        From the snapshot saved {s.snapshotDate ? formatSnapshotDate(s.snapshotDate) : ""}.
      </p>
    </div>
  );
}

"use client";

import { mainnet, polygon } from "wagmi/chains";
import { LAND_GRID_SIZE } from "@/lib/contracts";
import { formatSand, percent } from "@/lib/format";
import { useOverviewStats } from "@/app/overview-stats";
import { RetroWindow } from "./retro-window";

const TOTAL = LAND_GRID_SIZE * LAND_GRID_SIZE;
const fmt = (n: number) => n.toLocaleString();

/** "166,464 parcels. 2 chains. 0 servers." */
export function StatHeadline() {
  return (
    <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1] font-medium tracking-[-0.04em]">
      {fmt(TOTAL)} parcels.
      <br />
      <span className="text-muted">2 chains. 0 servers.</span>
    </h1>
  );
}

/** Polygon vs Ethereum, side by side. */
export function ChainCompare() {
  const s = useOverviewStats();
  const rows = (chain: "polygon" | "ethereum") => [
    ["Parcels", s.ready ? fmt(chain === "polygon" ? s.polygon : s.ethereum) : "—"],
    [
      "SAND",
      s.sandTotal !== undefined && s.sandPolygon !== undefined
        ? formatSand(chain === "polygon" ? s.sandPolygon : s.sandTotal - s.sandPolygon, { compact: true })
        : "—",
    ],
    ["Block time", chain === "polygon" ? "~2s" : "~12s"],
  ];

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
      {(["polygon", "ethereum"] as const).map((chain, i) => (
        <div key={chain} className="contents">
          {i === 1 && (
            <span aria-hidden="true" className="label-mono self-center justify-self-center text-subtle">
              vs
            </span>
          )}
          <RetroWindow title={chain === "polygon" ? "Polygon.chain" : "Ethereum.chain"} version={`id ${chain === "polygon" ? polygon.id : mainnet.id}`}>
            <dl className="divide-y divide-line">
              {rows(chain).map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="label-mono text-muted">{label}</dt>
                  <dd className="text-3xl font-medium tracking-[-0.03em] tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </RetroWindow>
        </div>
      ))}
    </div>
  );
}

/** Three big numbers. */
export function BigNumbers() {
  const s = useOverviewStats();
  const items = [
    { value: s.sandTotal !== undefined ? formatSand(s.sandTotal, { compact: true }) : "—", label: "SAND, ever" },
    {
      value: s.sandTotal !== undefined && s.sandPolygon !== undefined ? percent(s.sandPolygon, s.sandTotal) : "—",
      label: "of SAND on Polygon",
    },
    { value: s.ready ? `${Math.round((s.minted / TOTAL) * 100)}%` : "—", label: "of the map minted" },
  ];
  return (
    <>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-2 bg-background p-6 sm:p-10">
          <span className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em] tabular-nums">
            {it.value}
          </span>
          <span className="label-mono text-muted">{it.label}</span>
        </div>
      ))}
    </>
  );
}

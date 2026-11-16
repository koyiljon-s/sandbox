"use client";

import { useBlockNumber } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";

const CHAINS = [
  { id: polygon.id, name: "Polygon", dot: "bg-land-polygon", every: "~2s" },
  { id: mainnet.id, name: "Ethereum", dot: "bg-land-ethereum", every: "~12s" },
] as const;

/** Latest block on each chain, updating as new blocks arrive. */
export function BlockClock() {
  return (
    <dl className="flex flex-col divide-y divide-line">
      {CHAINS.map((c) => (
        <BlockRow key={c.id} {...c} />
      ))}
    </dl>
  );
}

function BlockRow({ id, name, dot, every }: (typeof CHAINS)[number]) {
  const { data, isError } = useBlockNumber({ chainId: id, watch: true });

  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <dt className="label-mono flex items-center gap-2 text-muted">
        <span className={`size-2 ${dot}`} />
        {name}
        <span className="ml-auto text-subtle">block {every}</span>
      </dt>
      <dd className="font-mono text-2xl tabular-nums tracking-[-0.02em]">
        {data !== undefined ? (
          // Re-keyed per block, so each new number flashes in.
          <span key={data.toString()} className="inline-block animate-[block-in_0.4s_ease-out] motion-reduce:animate-none">
            #{data.toLocaleString()}
          </span>
        ) : isError ? (
          <span className="text-subtle">offline</span>
        ) : (
          <span className="inline-block h-7 w-44 animate-pulse bg-surface-2 align-middle" />
        )}
      </dd>
    </div>
  );
}

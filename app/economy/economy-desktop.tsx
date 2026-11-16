"use client";

import { mainnet, polygon } from "wagmi/chains";
import { IconArrowRight, IconExternalLink, IconRefresh } from "@tabler/icons-react";
import { CellGrid, FramedSection } from "@/components/frame";
import { FallbackBanner } from "@/components/data-status";
import { RetroWindow } from "@/components/retro-window";
import { CONTRACTS, EXPLORERS } from "@/lib/contracts";
import { formatSand, percent, shortAddress, timeAgo } from "@/lib/format";
import { useRecentTransfers, useSandSupply } from "./use-sand";

const CHAIN_NAME = { [mainnet.id]: "Ethereum", [polygon.id]: "Polygon" } as const;
const CHAIN_DOT = { [mainnet.id]: "bg-land-ethereum", [polygon.id]: "bg-land-polygon" } as const;
const ZERO = "0x0000000000000000000000000000000000000000";

const USES = [
  { name: "Buy", body: "LAND, items, avatars" },
  { name: "Vote", body: "in the DAO" },
  { name: "Stake", body: "earn rewards" },
  { name: "Fees", body: "paid on sales" },
];

/**
 * The Economy page as a little desktop, matching LAND: the transfer feed,
 * supply, uses and contracts each in their own window.
 */
export function EconomyDesktop() {
  const supply = useSandSupply();
  const transfers = useRecentTransfers();
  const fellBack = supply.source === "fallback" || transfers.source === "fallback";

  const eth = supply.supply?.[mainnet.id];
  const poly = supply.supply?.[polygon.id];
  const largest = transfers.transfers?.length
    ? transfers.transfers.reduce((max, t) => (BigInt(t.value) > max ? BigInt(t.value) : max), BigInt(0))
    : undefined;

  const feedStatus =
    transfers.source === "fallback" ? "snapshot" : transfers.isFetching || !transfers.transfers ? "loading…" : "live · 30s";

  return (
    <>
      <FramedSection>
        {fellBack && (
          <div className="border-t border-line p-4 sm:px-10">
            <FallbackBanner
              snapshotDate={supply.snapshotDate ?? transfers.snapshotDate}
              onRetry={() => {
                supply.retryLive();
                transfers.retryLive();
              }}
            />
          </div>
        )}

        {/* The desktop */}
        <div className="tone-dark border-t border-line bg-background bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:14px_14px] p-4 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Transfer feed */}
            <RetroWindow title="Transfers.log" version={feedStatus} className="tone-grey self-start">
              {transfers.isError ? (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <p className="text-muted">Couldn&apos;t load transfers.</p>
                  <button
                    type="button"
                    onClick={() => transfers.retryLive()}
                    className="flex items-center gap-2 border border-foreground px-4 py-2 font-medium hover:bg-foreground hover:text-background"
                  >
                    <IconRefresh size={18} stroke={1.75} /> Try again
                  </button>
                </div>
              ) : (
                <>
                {/* sm+: a table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[560px] text-left">
                    <thead className="label-mono border-b border-line text-muted">
                      <tr>
                        <th className="px-4 py-2.5 font-normal">When</th>
                        <th className="px-4 py-2.5 font-normal">Chain</th>
                        <th className="px-4 py-2.5 font-normal">From → To</th>
                        <th className="px-4 py-2.5 text-right font-normal">SAND</th>
                        <th className="px-2 py-2.5">
                          <span className="sr-only">Transaction</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {!transfers.transfers ? (
                        Array.from({ length: 8 }, (_, i) => (
                          <tr key={i}>
                            <td colSpan={5} className="px-4 py-3">
                              <span className="block h-5 animate-pulse bg-surface-2" />
                            </td>
                          </tr>
                        ))
                      ) : transfers.transfers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center font-mono text-sm text-muted">
                            No recent transfers.
                          </td>
                        </tr>
                      ) : (
                        transfers.transfers.map((t) => (
                          <tr key={`${t.chainId}:${t.hash}:${t.logIndex}`} className="hover:bg-surface">
                            <td className="px-4 py-2.5 font-mono text-sm whitespace-nowrap text-muted" title={new Date(t.timestamp).toLocaleString()}>
                              {timeAgo(t.timestamp)}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="label-mono flex items-center gap-2">
                                <span className={`size-2 ${CHAIN_DOT[t.chainId]}`} />
                                {CHAIN_NAME[t.chainId]}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-sm whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <AddressLink address={t.from} chainId={t.chainId} />
                                <IconArrowRight size={13} stroke={2} className="shrink-0 text-muted" />
                                <AddressLink address={t.to} chainId={t.chainId} />
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-medium whitespace-nowrap tabular-nums">
                              {formatSand(BigInt(t.value))}
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <a
                                href={`${EXPLORERS[t.chainId]}/tx/${t.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View transaction on ${t.chainId === polygon.id ? "Polygonscan" : "Etherscan"}`}
                                className="inline-flex size-7 items-center justify-center text-muted hover:bg-foreground hover:text-background"
                              >
                                <IconExternalLink size={15} stroke={1.75} />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phones: one compact card per transfer, no sideways scrolling */}
                <ul className="divide-y divide-line sm:hidden">
                  {!transfers.transfers ? (
                    Array.from({ length: 6 }, (_, i) => (
                      <li key={i} className="px-4 py-3">
                        <span className="block h-10 animate-pulse bg-surface-2" />
                      </li>
                    ))
                  ) : transfers.transfers.length === 0 ? (
                    <li className="px-4 py-6 text-center font-mono text-sm text-muted">No recent transfers.</li>
                  ) : (
                    transfers.transfers.map((t) => (
                      <li key={`${t.chainId}:${t.hash}:${t.logIndex}`} className="flex flex-col gap-1.5 px-4 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-lg font-medium tabular-nums">
                            {formatSand(BigInt(t.value))} <span className="label-mono text-muted">SAND</span>
                          </span>
                          <span className="label-mono flex shrink-0 items-center gap-1.5 text-muted">
                            <span className={`size-2 ${CHAIN_DOT[t.chainId]}`} />
                            {CHAIN_NAME[t.chainId]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-1.5 font-mono text-sm">
                            <AddressLink address={t.from} chainId={t.chainId} />
                            <IconArrowRight size={13} stroke={2} className="shrink-0 text-muted" />
                            <AddressLink address={t.to} chainId={t.chainId} />
                          </span>
                          <a
                            href={`${EXPLORERS[t.chainId]}/tx/${t.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label-mono flex shrink-0 items-center gap-1 text-muted"
                          >
                            {timeAgo(t.timestamp)}
                            <IconExternalLink size={13} stroke={1.75} />
                          </a>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                </>
              )}
            </RetroWindow>

            <div className="flex flex-col gap-6">
              {/* Supply */}
              <RetroWindow title="Supply" version="ERC-20" className="tone-grey">
                <dl className="divide-y divide-line">
                  <SupplyRow label="Total, fixed" value={eth !== undefined ? formatSand(eth) : undefined} />
                  <SupplyRow label="On Polygon" value={poly !== undefined ? formatSand(poly, { compact: true }) : undefined} />
                </dl>
                {eth !== undefined && poly !== undefined && (
                  <div className="flex flex-col gap-2 border-t border-line px-4 py-3">
                    <div
                      role="img"
                      aria-label={`${percent(poly, eth)} of SAND is on Polygon, the rest on Ethereum`}
                      className="flex h-3 border border-foreground"
                    >
                      <span className="bg-land-polygon" style={{ width: `max(${Number((poly * BigInt(10_000)) / eth) / 100}%, 3px)` }} />
                      <span className="flex-1 bg-land-ethereum" />
                    </div>
                    <p className="label-mono flex justify-between text-muted">
                      <span>Polygon {percent(poly, eth)}</span>
                      <span>Ethereum</span>
                    </p>
                  </div>
                )}
              </RetroWindow>

              {/* Uses */}
              <RetroWindow title="Uses.txt" tone="pink">
                <ul className="divide-y divide-line">
                  {USES.map((u) => (
                    <li key={u.name} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                      <span className="font-medium">{u.name}</span>
                      <span className="label-mono text-muted">{u.body}</span>
                    </li>
                  ))}
                </ul>
              </RetroWindow>

              {/* Contracts */}
              <RetroWindow title="Contracts.cfg" className="tone-white">
                <ul className="divide-y divide-line">
                  {([mainnet.id, polygon.id] as const).map((id) => (
                    <li key={id}>
                      <a
                        href={`${EXPLORERS[id]}/token/${CONTRACTS[id].sand}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2"
                      >
                        <span className="label-mono flex items-center gap-2 text-muted">
                          <span className={`size-2 ${CHAIN_DOT[id]}`} />
                          {CHAIN_NAME[id]}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-sm">
                          {shortAddress(CONTRACTS[id].sand)}
                          <IconExternalLink size={14} stroke={1.75} className="text-muted" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </RetroWindow>
            </div>
          </div>
        </div>
      </FramedSection>

      {/* Big numbers */}
      <FramedSection label="In numbers" title="SAND at a glance" tone="pink">
        <CellGrid className="md:grid-cols-3">
          <BigNumber value={eth !== undefined ? formatSand(eth, { compact: true }) : undefined} label="SAND, ever" />
          <BigNumber value={eth !== undefined && poly !== undefined ? percent(poly, eth) : undefined} label="on Polygon" />
          <BigNumber
            value={largest !== undefined ? formatSand(largest, { compact: true }) : undefined}
            label="largest recent transfer"
          />
        </CellGrid>
      </FramedSection>
    </>
  );
}

function SupplyRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="label-mono text-muted">{label}</dt>
      <dd className="text-2xl font-medium tracking-[-0.03em] tabular-nums">
        {value ?? <span className="inline-block h-6 w-28 animate-pulse bg-surface-2 align-middle" />}
      </dd>
    </div>
  );
}

function AddressLink({ address, chainId }: { address: string; chainId: keyof typeof CHAIN_NAME }) {
  if (address.toLowerCase() === ZERO) {
    return (
      <span className="font-sans text-muted" title="The zero address: tokens created or destroyed, e.g. by a bridge">
        Mint / burn
      </span>
    );
  }
  return (
    <a
      href={`${EXPLORERS[chainId]}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className="hover:underline"
    >
      {shortAddress(address)}
    </a>
  );
}

function BigNumber({ value, label }: { value: string | undefined; label: string }) {
  return (
    <div className="flex flex-col gap-2 bg-background p-6 sm:p-10">
      <span className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em] tabular-nums">
        {value ?? "—"}
      </span>
      <span className="label-mono text-muted">{label}</span>
    </div>
  );
}

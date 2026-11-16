"use client";

import type { ReactNode } from "react";
import { mainnet, polygon } from "wagmi/chains";
import {
  IconArrowRight,
  IconBuildingStore,
  IconCoins,
  IconExternalLink,
  IconLock,
  IconReceipt,
  IconRefresh,
  IconUsersGroup,
} from "@tabler/icons-react";
import { DataSourceLabel, FallbackBanner } from "@/components/data-status";
import { shortAddress } from "@/lib/format";
import { CONTRACTS, EXPLORERS } from "@/lib/contracts";
import { formatSand, percent, timeAgo } from "@/lib/format";
import { useRecentTransfers, useSandSupply } from "./use-sand";

const CHAIN_NAME = { [mainnet.id]: "Ethereum", [polygon.id]: "Polygon" } as const;
const CHAIN_DOT = { [mainnet.id]: "bg-land-ethereum", [polygon.id]: "bg-land-polygon" } as const;
const ZERO = "0x0000000000000000000000000000000000000000";

export function EconomyDashboard() {
  const supply = useSandSupply();
  const transfers = useRecentTransfers();
  const fellBack = supply.source === "fallback" || transfers.source === "fallback";

  return (
    <div className="flex flex-col gap-10 p-6 sm:p-10">
      {fellBack && (
        <FallbackBanner
          snapshotDate={supply.snapshotDate ?? transfers.snapshotDate}
          onRetry={() => {
            supply.retryLive();
            transfers.retryLive();
          }}
        />
      )}

      <SupplyTiles {...supply} />
      <TransfersTable {...transfers} />
      <UsesSection />
    </div>
  );
}

/* ---------- Supply + balance ---------- */

function SupplyTiles({ supply, source, snapshotDate, isError }: Omit<ReturnType<typeof useSandSupply>, "retryLive">) {
  const eth = supply?.[mainnet.id];
  const poly = supply?.[polygon.id];

  return (
    <section aria-labelledby="supply-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="supply-heading" className="label-mono text-subtle">
          Supply
        </h2>
        <DataSourceLabel source={source} isFetching={!supply && !isError} snapshotDate={snapshotDate} hasData={!!supply} />
      </div>
      <div className="grid gap-px border border-line bg-line md:grid-cols-2">
        <Tile
          icon={<IconCoins size={20} stroke={1.75} />}
          label="Total supply"
          value={eth !== undefined ? formatSand(eth) : null}
          unit="SAND"
          note="Minted on Ethereum, where SAND was created. The supply is fixed."
          error={isError}
        />
        <Tile
          icon={<IconLock size={20} stroke={1.75} />}
          label="Bridged to Polygon"
          value={poly !== undefined ? formatSand(poly, { compact: true }) : null}
          unit="SAND"
          note={
            eth !== undefined && poly !== undefined
              ? `${percent(poly, eth)} of all SAND. Tokens are locked on Ethereum and re-issued on Polygon, where fees are lower.`
              : "Tokens locked on Ethereum and re-issued on Polygon."
          }
          error={isError}
        />
      </div>
    </section>
  );
}

function Tile({
  icon,
  label,
  value,
  unit,
  note,
  error,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
  unit?: string;
  note: ReactNode;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 bg-surface p-6">
      <span className="flex items-center gap-2 text-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      {value !== null ? (
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">{value}</span>
          {unit && <span className="font-semibold text-muted">{unit}</span>}
        </p>
      ) : error ? (
        <p className="text-lg font-semibold text-danger">Unavailable</p>
      ) : (
        <span className="h-9 w-40 animate-pulse bg-surface-3" aria-label="Loading" />
      )}
      <div className="text-sm text-muted">{note}</div>
    </div>
  );
}

/* ---------- Recent transfers ---------- */

function TransfersTable({ transfers, source, snapshotDate, isFetching, isError, retryLive }: ReturnType<typeof useRecentTransfers>) {
  return (
    <section aria-labelledby="transfers-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <h2 id="transfers-heading" className="label-mono text-subtle">
            Recent transfers
          </h2>
          <p className="text-sm text-muted">Every SAND movement is a public Transfer event. Refreshes every 30 seconds.</p>
        </div>
        <DataSourceLabel source={source} isFetching={isFetching} snapshotDate={snapshotDate} hasData={!!transfers} />
      </div>

      <div className="overflow-x-auto border border-line bg-surface">
        {isError ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-muted">Couldn&apos;t load transfers, and no saved snapshot was found.</p>
            <button
              type="button"
              onClick={() => retryLive()}
              className="flex items-center gap-2 border border-line-strong px-4 py-2 font-semibold hover:bg-surface-2"
            >
              <IconRefresh size={18} stroke={1.75} /> Try again
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">From → To</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Transaction</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!transfers
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <span className="block h-5 animate-pulse bg-surface-2" />
                      </td>
                    </tr>
                  ))
                : transfers.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted">
                        No transfers in the last few hours.
                      </td>
                    </tr>
                  )
                  : transfers.map((t) => (
                      <tr key={`${t.chainId}:${t.hash}:${t.logIndex}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-muted" title={new Date(t.timestamp).toLocaleString()}>
                          {timeAgo(t.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${CHAIN_DOT[t.chainId]}`} />
                            {CHAIN_NAME[t.chainId]}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <AddressLabel address={t.from} chainId={t.chainId} />
                            <IconArrowRight size={14} stroke={1.75} className="shrink-0 text-subtle" />
                            <AddressLabel address={t.to} chainId={t.chainId} />
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                          {formatSand(BigInt(t.value))} <span className="text-sm font-normal text-muted">SAND</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`${EXPLORERS[t.chainId]}/tx/${t.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View transaction on ${t.chainId === polygon.id ? "Polygonscan" : "Etherscan"}`}
                            className="inline-flex size-8 items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground"
                          >
                            <IconExternalLink size={16} stroke={1.75} />
                          </a>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function AddressLabel({ address, chainId }: { address: string; chainId: keyof typeof CHAIN_NAME }) {
  if (address.toLowerCase() === ZERO) return <span className="font-sans text-muted" title="The zero address: tokens created or destroyed, e.g. by a bridge">Mint / burn</span>;
  const label = shortAddress(address);
  return (
    <a
      href={`${EXPLORERS[chainId]}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title={address}
      className="hover:text-accent hover:underline"
    >
      {label}
    </a>
  );
}

/* ---------- What SAND is for ---------- */

const USES = [
  {
    icon: IconBuildingStore,
    title: "Buying LAND & ASSETS",
    body: "SAND is the currency of The Sandbox marketplace: parcels, items and avatars are priced and paid for in it.",
  },
  {
    icon: IconUsersGroup,
    title: "Governance",
    body: "SAND holders can vote on proposals for the platform through The Sandbox DAO.",
  },
  {
    icon: IconLock,
    title: "Staking",
    body: "Holders can lock up SAND to earn rewards, which also takes tokens out of circulation.",
  },
  {
    icon: IconReceipt,
    title: "Fees",
    body: "Platform transactions such as marketplace sales carry fees paid in SAND.",
  },
];

function UsesSection() {
  return (
    <section aria-labelledby="uses-heading" className="flex flex-col gap-3">
      <h2 id="uses-heading" className="label-mono text-subtle">
        What SAND is used for
      </h2>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {USES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2 bg-surface p-6">
            <Icon size={22} stroke={1.75} className="text-accent" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-muted">{body}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-subtle">
        Contracts: Ethereum{" "}
        <a className="font-mono hover:text-accent hover:underline" href={`${EXPLORERS[mainnet.id]}/token/${CONTRACTS[mainnet.id].sand}`} target="_blank" rel="noopener noreferrer">
          {shortAddress(CONTRACTS[mainnet.id].sand)}
        </a>{" "}
        · Polygon{" "}
        <a className="font-mono hover:text-accent hover:underline" href={`${EXPLORERS[polygon.id]}/token/${CONTRACTS[polygon.id].sand}`} target="_blank" rel="noopener noreferrer">
          {shortAddress(CONTRACTS[polygon.id].sand)}
        </a>
      </p>
    </section>
  );
}

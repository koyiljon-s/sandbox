"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useReadContracts } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import type { PublicClient } from "viem";
import { CONTRACTS, sandAbi } from "@/lib/contracts";
import type { DataSource } from "@/lib/data-source";

type ChainId = typeof polygon.id | typeof mainnet.id;
export const SAND_CHAINS: ChainId[] = [mainnet.id, polygon.id];

/** How far back to look for transfers. Polygon SAND is far quieter, so scan wider. */
const TRANSFER_LOOKBACK: Record<ChainId, bigint> = { [mainnet.id]: BigInt(300), [polygon.id]: BigInt(10_000) };
const TRANSFERS_PER_CHAIN = 8;

export type SandTransfer = {
  chainId: ChainId;
  hash: `0x${string}`;
  logIndex: number;
  blockNumber: string;
  timestamp: string; // ISO
  from: `0x${string}`;
  to: `0x${string}`;
  value: string; // wei, as a decimal string
};

/** Shape of public/demo/sand-snapshot.json, written by `npm run snapshot`. */
export type SandSnapshot = {
  createdAt: string;
  totalSupply: Record<string, string>; // chainId -> wei
  transfers: SandTransfer[];
};

export function useSandSnapshot() {
  return useQuery({
    queryKey: ["sand-snapshot"],
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    queryFn: async ({ signal }) => {
      const res = await fetch("/demo/sand-snapshot.json", { signal });
      if (!res.ok) throw new Error(`Snapshot not found (${res.status}). Run "npm run snapshot".`);
      return (await res.json()) as SandSnapshot;
    },
  });
}

const sandCall = (chainId: ChainId, functionName: "totalSupply") =>
  ({ chainId, address: CONTRACTS[chainId].sand, abi: sandAbi, functionName }) as const;

export function useSandSupply() {
  const snapshot = useSandSnapshot();
  const live = useReadContracts({
    contracts: SAND_CHAINS.map((id) => sandCall(id, "totalSupply")),
    allowFailure: false,
    query: { retry: 1 },
  });

  const source: DataSource = live.isError ? "fallback" : "live";
  let supply: Record<ChainId, bigint> | null = null;
  if (source === "live" && live.data) {
    supply = { [mainnet.id]: live.data[0], [polygon.id]: live.data[1] } as Record<ChainId, bigint>;
  } else if (source === "fallback" && snapshot.data) {
    const s = snapshot.data.totalSupply;
    supply = { [mainnet.id]: BigInt(s[mainnet.id]), [polygon.id]: BigInt(s[polygon.id]) } as Record<ChainId, bigint>;
  }

  return {
    supply,
    source,
    snapshotDate: snapshot.data?.createdAt,
    isError: !supply && (source === "live" ? live.isError : snapshot.isError),
    retryLive: live.refetch,
  };
}

async function recentTransfersOn(client: PublicClient, chainId: ChainId): Promise<SandTransfer[]> {
  const latest = await client.getBlockNumber();
  const logs = await client.getLogs({
    address: CONTRACTS[chainId].sand,
    event: sandAbi.find((item) => item.type === "event" && item.name === "Transfer")!,
    fromBlock: latest - TRANSFER_LOOKBACK[chainId],
    toBlock: latest,
  });
  const newest = logs.slice(-TRANSFERS_PER_CHAIN).reverse();

  // One block read per distinct block, for timestamps.
  const blockNumbers = [...new Set(newest.map((l) => l.blockNumber))];
  const blocks = await Promise.all(blockNumbers.map((n) => client.getBlock({ blockNumber: n })));
  const timeOf = new Map(blocks.map((b) => [b.number, new Date(Number(b.timestamp) * 1000).toISOString()]));

  return newest.map((l) => ({
    chainId,
    hash: l.transactionHash,
    logIndex: l.logIndex,
    blockNumber: l.blockNumber.toString(),
    timestamp: timeOf.get(l.blockNumber)!,
    from: l.args.from!,
    to: l.args.to!,
    value: l.args.value!.toString(),
  }));
}

/** Newest SAND transfers across both chains, refreshed every 30 seconds. */
export function useRecentTransfers() {
  const snapshot = useSandSnapshot();
  const ethClient = usePublicClient({ chainId: mainnet.id });
  const polyClient = usePublicClient({ chainId: polygon.id });

  const live = useQuery({
    queryKey: ["sand-transfers"],
    enabled: !!ethClient && !!polyClient,
    refetchInterval: 30_000,
    retry: 1,
    queryFn: async () => {
      const [eth, poly] = await Promise.all([
        recentTransfersOn(ethClient as PublicClient, mainnet.id),
        recentTransfersOn(polyClient as PublicClient, polygon.id),
      ]);
      return [...eth, ...poly].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },
  });

  const source: DataSource = live.isError && !live.data ? "fallback" : "live";
  const transfers = source === "live" ? (live.data ?? null) : (snapshot.data?.transfers ?? null);

  return {
    transfers,
    source,
    snapshotDate: snapshot.data?.createdAt,
    isFetching: source === "live" && live.isFetching,
    updatedAt: source === "live" ? live.dataUpdatedAt : 0,
    isError: !transfers && (source === "live" ? live.isError : snapshot.isError),
    retryLive: live.refetch,
  };
}

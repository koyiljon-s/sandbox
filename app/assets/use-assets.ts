"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { polygon } from "wagmi/chains";
import type { PublicClient } from "viem";
import { ASSET_CONTRACT, assetAbi } from "@/lib/contracts";
import type { DataSource } from "@/lib/data-source";

/** One item, as saved by `npm run snapshot` (image stored locally). */
export type AssetItem = {
  id: string;
  name: string;
  type?: string;
  catalyst?: string;
  image?: string;
  externalUrl?: string;
  lastTransfer: { hash: string; copies: string; timestamp: string };
};

export type AssetsSnapshot = { createdAt: string; items: AssetItem[] };

export type AssetTransfer = {
  hash: string;
  logIndex: number;
  id: string;
  from: string;
  to: string;
  copies: string;
  timestamp: string;
};

/** ~2.8 hours of Polygon blocks (about 2s each). */
const LOOKBACK = BigInt(5_000);
const SHOWN = 8;

/**
 * Gallery items come from the snapshot: their metadata and images live on
 * IPFS, and public gateways are too slow (5–25 s) to load live in a demo.
 */
export function useAssetsSnapshot() {
  return useQuery({
    queryKey: ["assets-snapshot"],
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    queryFn: async ({ signal }) => {
      const res = await fetch("/demo/assets-snapshot.json", { signal });
      if (!res.ok) throw new Error(`Snapshot not found (${res.status}). Run "npm run snapshot -- assets".`);
      return (await res.json()) as AssetsSnapshot;
    },
  });
}

async function readActivity(client: PublicClient) {
  const latest = await client.getBlockNumber();
  const logs = await client.getLogs({
    address: ASSET_CONTRACT,
    event: assetAbi.find((i) => i.type === "event" && i.name === "TransferSingle")!,
    fromBlock: latest - LOOKBACK,
    toBlock: latest,
  });

  const newest = logs.slice(-SHOWN).reverse();
  const blockNumbers = [...new Set(newest.map((l) => l.blockNumber))];
  const blocks = await Promise.all(blockNumbers.map((n) => client.getBlock({ blockNumber: n })));
  const timeOf = new Map(blocks.map((b) => [b.number, new Date(Number(b.timestamp) * 1000).toISOString()]));

  return {
    transfers: newest.map(
      (l): AssetTransfer => ({
        hash: l.transactionHash,
        logIndex: l.logIndex,
        id: l.args.id!.toString(),
        from: l.args.from!,
        to: l.args.to!,
        copies: l.args.value!.toString(),
        timestamp: timeOf.get(l.blockNumber)!,
      }),
    ),
    // Totals over the whole lookback window, for the big numbers.
    stats: {
      transfers: logs.length,
      copies: logs.reduce((sum, l) => sum + l.args.value!, BigInt(0)),
      items: new Set(logs.map((l) => l.args.id!.toString())).size,
    },
  };
}

/**
 * Live item transfers (TransferSingle events), refreshed every 30 seconds.
 * If the chain can't be reached, falls back to each snapshot item's last move.
 */
export function useAssetActivity() {
  const client = usePublicClient({ chainId: polygon.id });
  const snapshot = useAssetsSnapshot();

  const live = useQuery({
    queryKey: ["asset-activity"],
    enabled: !!client,
    refetchInterval: 30_000,
    retry: 1,
    queryFn: () => readActivity(client as PublicClient),
  });

  const source: DataSource = live.isError && !live.data ? "fallback" : "live";
  const transfers: AssetTransfer[] | null =
    source === "live"
      ? (live.data?.transfers ?? null)
      : snapshot.data
        ? snapshot.data.items
            .map((it) => ({ hash: it.lastTransfer.hash, logIndex: 0, id: it.id, from: "", to: "", copies: it.lastTransfer.copies, timestamp: it.lastTransfer.timestamp }))
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, SHOWN)
        : null;

  return {
    transfers,
    stats: source === "live" ? live.data?.stats : undefined,
    source,
    snapshotDate: snapshot.data?.createdAt,
    isFetching: source === "live" && live.isFetching,
    retryLive: live.refetch,
  };
}

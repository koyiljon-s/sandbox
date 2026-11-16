"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { CONTRACTS, landAbi, landTokenId } from "@/lib/contracts";
import { isHttpsUrl, parcelStatus, type LandMetadata, type ParcelStatus } from "@/lib/land";
import { snapshotStatus, useLandSnapshot } from "@/lib/land-snapshot";

/**
 * Where the data on screen came from:
 * - live: read from the blockchain just now
 * - snapshot: demo mode is on, so the saved snapshot is used on purpose
 * - fallback: live reads failed, so the snapshot is shown instead
 */
export type DataSource = "live" | "snapshot" | "fallback";

const ownerOf = (chainId: typeof polygon.id | typeof mainnet.id, tokenId: bigint) =>
  ({
    chainId,
    address: CONTRACTS[chainId].land,
    abi: landAbi,
    functionName: "ownerOf",
    args: [tokenId],
  }) as const;

/**
 * Owner status for every parcel in a window, read in one multicall per chain.
 * ownerOf reverts for parcels that don't exist on a chain; allowFailure turns
 * that into a per-parcel "failure" instead of failing the whole batch.
 */
export function useLandWindow(x0: number, y0: number, cols: number, rows: number, { demoMode }: { demoMode: boolean }) {
  const snapshot = useLandSnapshot();

  const ids = useMemo(() => {
    const out: bigint[] = [];
    for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x0 + cols; x++) out.push(landTokenId(x, y));
    return out;
  }, [x0, y0, cols, rows]);

  const contracts = useMemo(
    () => ids.flatMap((id) => [ownerOf(polygon.id, id), ownerOf(mainnet.id, id)]),
    [ids],
  );

  const live = useReadContracts({
    contracts,
    allowFailure: true,
    // One retry, so a dead RPC falls back to the snapshot in seconds, not ~10s.
    query: { enabled: !demoMode, placeholderData: keepPreviousData, retry: 1 },
  });

  const source: DataSource = demoMode ? "snapshot" : live.isError && !live.data ? "fallback" : "live";

  const statuses = useMemo((): ParcelStatus[] | null => {
    if (source !== "live") {
      const snap = snapshot.data;
      return snap ? ids.map((id) => snapshotStatus(snap, id) ?? "unminted") : null;
    }
    if (!live.data) return null;
    return ids.map((_, i) => {
      const p = live.data[i * 2];
      const e = live.data[i * 2 + 1];
      return parcelStatus(
        p?.status === "success" ? (p.result as string) : undefined,
        e?.status === "success" ? (e.result as string) : undefined,
      );
    });
  }, [source, snapshot.data, live.data, ids]);

  return {
    statuses,
    source,
    snapshotDate: snapshot.data?.createdAt,
    isFetching: source === "live" ? live.isFetching : snapshot.isFetching,
    /** Nothing to show: live failed and there's no snapshot either. */
    isError: !statuses && (source === "live" ? live.isError : snapshot.isError),
    retryLive: live.refetch,
  };
}

/** Owners on both chains, tokenURI and metadata for one parcel. */
export function useParcel(x: number, y: number, { demoMode }: { demoMode: boolean }) {
  const tokenId = landTokenId(x, y);
  const snapshot = useLandSnapshot();

  const owners = useReadContracts({
    contracts: [ownerOf(polygon.id, tokenId), ownerOf(mainnet.id, tokenId)],
    allowFailure: true,
    query: { enabled: !demoMode, retry: 1 },
  });

  const source: DataSource = demoMode ? "snapshot" : owners.isError ? "fallback" : "live";

  // ----- Live path -----
  const livePolygonOwner = owners.data?.[0]?.status === "success" ? (owners.data[0].result as `0x${string}`) : undefined;
  const liveEthereumOwner = owners.data?.[1]?.status === "success" ? (owners.data[1].result as `0x${string}`) : undefined;
  const liveStatus = owners.data ? parcelStatus(livePolygonOwner, liveEthereumOwner) : undefined;
  const liveMetadataChain = liveStatus === "polygon" ? polygon.id : liveStatus && liveStatus !== "unminted" ? mainnet.id : undefined;

  const uri = useReadContracts({
    contracts: liveMetadataChain
      ? [{ chainId: liveMetadataChain, address: CONTRACTS[liveMetadataChain].land, abi: landAbi, functionName: "tokenURI", args: [tokenId] } as const]
      : [],
    allowFailure: true,
    query: { enabled: source === "live" && !!liveMetadataChain },
  });
  const tokenUri = uri.data?.[0]?.status === "success" ? (uri.data[0].result as string) : undefined;

  const liveMetadata = useQuery({
    queryKey: ["land-metadata", tokenUri],
    enabled: source === "live" && isHttpsUrl(tokenUri),
    staleTime: 10 * 60_000,
    queryFn: async ({ signal }) => {
      const res = await fetch(tokenUri!, { signal });
      if (!res.ok) throw new Error(`Metadata request failed (${res.status})`);
      return (await res.json()) as LandMetadata;
    },
  });

  if (source === "live") {
    return {
      source,
      tokenId,
      status: liveStatus,
      polygonOwner: livePolygonOwner,
      ethereumOwner: liveEthereumOwner,
      metadataChain: liveMetadataChain,
      metadata: liveMetadata.data,
      /** False only in snapshot mode, for parcels saved without details. */
      hasDetails: true,
      isPending: owners.isPending,
      isError: false,
      metadataPending: liveMetadata.isPending && liveMetadata.fetchStatus !== "idle",
      metadataError: liveMetadata.isError,
      snapshotDate: snapshot.data?.createdAt,
      retryLive: owners.refetch,
    };
  }

  // ----- Snapshot path (demo mode, or live failed) -----
  const snap = snapshot.data;
  const saved = snap?.parcels[tokenId.toString()];
  return {
    source,
    tokenId,
    status: snap ? snapshotStatus(snap, tokenId) : undefined,
    polygonOwner: saved?.polygonOwner,
    ethereumOwner: saved?.ethereumOwner,
    metadataChain: saved?.metadataChain === "polygon" ? polygon.id : saved?.metadataChain === "ethereum" ? mainnet.id : undefined,
    metadata: saved?.metadata,
    hasDetails: !!saved,
    isPending: snapshot.isPending,
    isError: snapshot.isError,
    metadataPending: false,
    metadataError: false,
    snapshotDate: snap?.createdAt,
    retryLive: owners.refetch,
  };
}

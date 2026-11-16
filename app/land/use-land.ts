"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { CONTRACTS, landAbi, landTokenId } from "@/lib/contracts";
import { isHttpsUrl, parcelStatus, type LandMetadata, type ParcelStatus } from "@/lib/land";

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
export function useLandWindow(x0: number, y0: number, cols: number, rows: number) {
  const ids = useMemo(() => {
    const out: bigint[] = [];
    for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x0 + cols; x++) out.push(landTokenId(x, y));
    return out;
  }, [x0, y0, cols, rows]);

  const contracts = useMemo(
    () => ids.flatMap((id) => [ownerOf(polygon.id, id), ownerOf(mainnet.id, id)]),
    [ids],
  );

  const query = useReadContracts({
    contracts,
    allowFailure: true,
    query: { placeholderData: keepPreviousData },
  });

  const statuses = useMemo(() => {
    if (!query.data) return null;
    const out: ParcelStatus[] = [];
    for (let i = 0; i < ids.length; i++) {
      const p = query.data[i * 2];
      const e = query.data[i * 2 + 1];
      out.push(
        parcelStatus(
          p?.status === "success" ? (p.result as string) : undefined,
          e?.status === "success" ? (e.result as string) : undefined,
        ),
      );
    }
    return out;
  }, [query.data, ids.length]);

  return { statuses, isPending: query.isPending, isFetching: query.isFetching, isError: query.isError, refetch: query.refetch };
}

/** Owners on both chains, tokenURI and metadata for one parcel. */
export function useParcel(x: number, y: number) {
  const tokenId = landTokenId(x, y);

  const owners = useReadContracts({
    contracts: [ownerOf(polygon.id, tokenId), ownerOf(mainnet.id, tokenId)],
    allowFailure: true,
  });

  const polygonOwner = owners.data?.[0]?.status === "success" ? (owners.data[0].result as `0x${string}`) : undefined;
  const ethereumOwner = owners.data?.[1]?.status === "success" ? (owners.data[1].result as `0x${string}`) : undefined;
  const status = owners.data ? parcelStatus(polygonOwner, ethereumOwner) : undefined;
  // Read metadata from the chain where the parcel currently lives.
  const metadataChain = status === "polygon" ? polygon.id : status ? mainnet.id : undefined;

  const uri = useReadContracts({
    contracts: metadataChain
      ? [{ chainId: metadataChain, address: CONTRACTS[metadataChain].land, abi: landAbi, functionName: "tokenURI", args: [tokenId] } as const]
      : [],
    allowFailure: true,
    query: { enabled: !!metadataChain && status !== "unminted" },
  });
  const tokenUri = uri.data?.[0]?.status === "success" ? (uri.data[0].result as string) : undefined;

  const metadata = useQuery({
    queryKey: ["land-metadata", tokenUri],
    enabled: isHttpsUrl(tokenUri),
    staleTime: 10 * 60_000,
    queryFn: async ({ signal }) => {
      const res = await fetch(tokenUri!, { signal });
      if (!res.ok) throw new Error(`Metadata request failed (${res.status})`);
      return (await res.json()) as LandMetadata;
    },
  });

  return {
    tokenId,
    status,
    polygonOwner,
    ethereumOwner,
    metadataChain,
    tokenUri,
    metadata: metadata.data,
    isPending: owners.isPending,
    isError: owners.isError,
    metadataPending: metadata.isPending && metadata.fetchStatus !== "idle",
    metadataError: metadata.isError,
    refetch: owners.refetch,
  };
}

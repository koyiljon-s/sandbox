"use client";

import { useState } from "react";
import { IconDatabase, IconExternalLink, IconLoader2, IconRefresh } from "@tabler/icons-react";
import { mainnet, polygon } from "wagmi/chains";
import { CONTRACTS, EXPLORERS } from "@/lib/contracts";
import { STATUS_LABEL, isHttpsUrl } from "@/lib/land";
import { formatSnapshotDate } from "@/lib/land-snapshot";
import { shortAddress } from "@/lib/format";
import { useParcel } from "./use-land";

const STATUS_NOTE = {
  polygon: "This parcel was moved to Polygon. Its Ethereum copy is held by a contract, so the Polygon owner is the current owner.",
  ethereum: "This parcel is on Ethereum mainnet and hasn't been moved to Polygon.",
  contract: "The Ethereum token is held by a contract and there's no Polygon owner. It may be in transit between chains.",
  unminted: "No token exists for this parcel on either chain. It may be reserved or not yet sold.",
} as const;

export function ParcelDetails({ x, y }: { x: number; y: number }) {
  const p = useParcel(x, y);
  const [imageFailed, setImageFailed] = useState(false);

  if (p.isPending) {
    return (
      <p className="flex items-center gap-2 text-muted">
        <IconLoader2 size={18} stroke={1.75} className="animate-spin" /> Reading Polygon and Ethereum…
      </p>
    );
  }

  if (p.isError || !p.status) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted">
          Couldn&apos;t read this parcel from the blockchain, and no saved snapshot was found.
        </p>
        <button
          type="button"
          onClick={() => p.retryLive()}
          className="flex items-center justify-center gap-2 border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2"
        >
          <IconRefresh size={18} stroke={1.75} /> Try again
        </button>
      </div>
    );
  }

  const currentOwner = p.status === "polygon" ? p.polygonOwner : p.status === "ethereum" ? p.ethereumOwner : undefined;
  const chainId = p.metadataChain;
  const explorer = chainId ? EXPLORERS[chainId] : undefined;
  const md = p.metadata;
  // Live metadata links to remote HTTPS images; the snapshot stores local copies.
  const rawImage = md?.image;
  const isLocalCopy = p.source !== "live" && typeof rawImage === "string" && rawImage.startsWith("/demo/images/");
  const image = !imageFailed && (isLocalCopy || isHttpsUrl(rawImage)) ? rawImage : undefined;
  const savedOn = p.snapshotDate ? formatSnapshotDate(p.snapshotDate) : "";
  const experience = md?.sandbox?.name;

  return (
    <div className="flex flex-col gap-5">
      {p.source !== "live" && (
        <p className="flex items-start gap-2 border border-estate/50 bg-estate-soft p-3 text-sm">
          <IconDatabase size={18} stroke={1.75} className="mt-0.5 shrink-0 text-estate" />
          <span>
            Live data unavailable.{" "}
            From the snapshot saved {savedOn}
            {p.hasDetails ? "." : ". Owner and metadata are saved only for the preset parcels."}
          </span>
        </p>
      )}
      {image && (
        // Remote preview from the metadata; next/image would need every host allow-listed.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={`Preview of ${md?.name ?? `LAND (${x}, ${y})`}`} className="aspect-video w-full border border-line bg-surface-2 object-cover" onError={() => setImageFailed(true)} />
      )}

      <div className="flex flex-col gap-1.5">
        <p className="flex items-center gap-2 font-semibold">
          <span
            className={`size-2.5 rounded-full ${
              p.status === "polygon" ? "bg-land-polygon" : p.status === "ethereum" ? "bg-land-ethereum" : "bg-subtle"
            }`}
          />
          {STATUS_LABEL[p.status]}
        </p>
        <p className="text-sm text-muted">{STATUS_NOTE[p.status]}</p>
        {p.source === "fallback" && (
          <button type="button" onClick={() => p.retryLive()} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
            <IconRefresh size={16} stroke={1.75} /> Retry live
          </button>
        )}
      </div>

      <dl className="flex flex-col divide-y divide-line border border-line">
        <Row label="Coordinates" value={`(${x}, ${y})`} />
        <Row label="Token ID" value={p.tokenId.toString()} mono />
        {currentOwner && <Row label="Owner" value={shortAddress(currentOwner)} title={currentOwner} mono />}
        {chainId && <Row label="Network" value={chainId === polygon.id ? "Polygon" : "Ethereum"} />}
        {!currentOwner && !p.hasDetails && p.status !== "unminted" && <Row label="Owner" value="Live only" />}
        {experience && <Row label="Experience" value={experience} />}
        {md?.properties
          ?.filter((prop) => prop.trait_type === "Land Type")
          .map((prop) => <Row key="type" label="Type" value={String(prop.value)} />)}
      </dl>

      {p.metadataPending && (
        <p className="flex items-center gap-2 text-sm text-subtle">
          <IconLoader2 size={16} stroke={1.75} className="animate-spin" /> Loading metadata…
        </p>
      )}
      {p.metadataError && <p className="text-sm text-subtle">Metadata couldn&apos;t be loaded from The Sandbox&apos;s API.</p>}

      {explorer && chainId && p.status !== "unminted" && (
        <div className="flex flex-col gap-2">
          <ExternalButton href={`${explorer}/nft/${CONTRACTS[chainId].land}/${p.tokenId}`}>
            Token on {chainId === polygon.id ? "Polygonscan" : "Etherscan"}
          </ExternalButton>
          {currentOwner && (
            <ExternalButton href={`${explorer}/address/${currentOwner}`}>Owner&apos;s address</ExternalButton>
          )}
          {p.status === "polygon" && p.ethereumOwner && (
            <ExternalButton href={`${EXPLORERS[mainnet.id]}/nft/${CONTRACTS[mainnet.id].land}/${p.tokenId}`}>
              Ethereum copy on Etherscan
            </ExternalButton>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono, title }: { label: string; value: string; mono?: boolean; title?: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd title={title} className={`text-right font-medium break-all ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2"
    >
      {children} <IconExternalLink size={16} stroke={1.75} />
    </a>
  );
}

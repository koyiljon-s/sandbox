"use client";

import { IconExternalLink, IconLoader2, IconRefresh } from "@tabler/icons-react";
import { mainnet, polygon } from "wagmi/chains";
import { useConnection } from "wagmi";
import { CONTRACTS, EXPLORERS } from "@/lib/contracts";
import { STATUS_LABEL, isHttpsUrl } from "@/lib/land";
import { shortAddress } from "@/components/wallet/format";
import { useParcel } from "./use-land";

const STATUS_NOTE = {
  polygon: "This parcel was moved to Polygon. Its Ethereum copy is held by a contract, so the Polygon owner is the current owner.",
  ethereum: "This parcel is on Ethereum mainnet and hasn't been moved to Polygon.",
  contract: "The Ethereum token is held by a contract and there's no Polygon owner. It may be in transit between chains.",
  unminted: "No token exists for this parcel on either chain. It may be reserved or not yet sold.",
} as const;

export function ParcelDetails({ x, y }: { x: number; y: number }) {
  const p = useParcel(x, y);
  const { address: me } = useConnection();

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
        <p className="text-muted">Couldn&apos;t read this parcel from the blockchain.</p>
        <button
          type="button"
          onClick={() => p.refetch()}
          className="flex items-center justify-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2"
        >
          <IconRefresh size={18} stroke={1.75} /> Try again
        </button>
      </div>
    );
  }

  const currentOwner = p.status === "polygon" ? p.polygonOwner : p.status === "ethereum" ? p.ethereumOwner : undefined;
  const isMine = !!me && !!currentOwner && me.toLowerCase() === currentOwner.toLowerCase();
  const chainId = p.metadataChain;
  const explorer = chainId ? EXPLORERS[chainId] : undefined;
  const md = p.metadata;
  const image = isHttpsUrl(md?.image) ? md.image : undefined;
  const experience = md?.sandbox?.name;

  return (
    <div className="flex flex-col gap-5">
      {image && (
        // Remote preview from the metadata; next/image would need every host allow-listed.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={`Preview of ${md?.name ?? `LAND (${x}, ${y})`}`} className="aspect-video w-full border border-line bg-surface-2 object-cover" />
      )}

      <div className="flex flex-col gap-1.5">
        <p className="flex items-center gap-2 font-semibold">
          <span
            className={`size-2.5 rounded-full ${
              p.status === "polygon" ? "bg-land-polygon" : p.status === "ethereum" ? "bg-land-ethereum" : "bg-subtle"
            }`}
          />
          {STATUS_LABEL[p.status]}
          {isMine && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">You own this</span>}
        </p>
        <p className="text-sm text-muted">{STATUS_NOTE[p.status]}</p>
      </div>

      <dl className="flex flex-col divide-y divide-line border border-line">
        <Row label="Coordinates" value={`(${x}, ${y})`} />
        <Row label="Token ID" value={p.tokenId.toString()} mono />
        {currentOwner && <Row label="Owner" value={shortAddress(currentOwner)} title={currentOwner} mono />}
        {chainId && <Row label="Network" value={chainId === polygon.id ? "Polygon" : "Ethereum"} />}
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
      className="flex items-center justify-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2"
    >
      {children} <IconExternalLink size={16} stroke={1.75} />
    </a>
  );
}

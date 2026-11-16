"use client";

import { useState } from "react";
import { polygon } from "wagmi/chains";
import { IconArrowRight, IconExternalLink, IconRefresh } from "@tabler/icons-react";
import { CellGrid, FramedSection } from "@/components/frame";
import { FallbackBanner } from "@/components/data-status";
import { RetroWindow } from "@/components/retro-window";
import { ASSET_CONTRACT, EXPLORERS } from "@/lib/contracts";
import { shortAddress, timeAgo } from "@/lib/format";
import { useAssetActivity, useAssetsSnapshot, type AssetItem } from "./use-assets";

const ZERO = "0x0000000000000000000000000000000000000000";
const POLYGONSCAN = EXPLORERS[polygon.id];

/** "17 Nov": short enough for a window title bar on a phone. */
const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** Long ERC-1155 IDs, shortened for display: 2479…1098. */
const shortId = (id: string) => (id.length > 10 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id);

/**
 * The Assets page as a little desktop, matching LAND and Economy: a gallery
 * of recent items, the selected item's details, live activity and a short
 * ERC-721 vs ERC-1155 note.
 */
export function AssetsDesktop() {
  const snapshot = useAssetsSnapshot();
  const activity = useAssetActivity();
  const items = snapshot.data?.items;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Default to the first item, so Item Info is never empty.
  const selected = items?.find((it) => it.id === selectedId) ?? items?.[0];
  const nameOf = new Map(items?.map((it) => [it.id, it.name]));

  const activityStatus = activity.source === "fallback" ? "snapshot" : activity.isFetching || !activity.transfers ? "loading…" : "live · 30s";

  return (
    <>
      <FramedSection>
        {activity.source === "fallback" && activity.transfers && (
          <div className="border-t border-line p-4 sm:px-10">
            <FallbackBanner snapshotDate={activity.snapshotDate} onRetry={() => activity.retryLive()} />
          </div>
        )}

        {/* The desktop */}
        <div className="tone-dark border-t border-line bg-background bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:14px_14px] p-4 sm:p-8">
          {/* Phones: Gallery → Item Info → Activity → 721 vs 1155. lg+: gallery left, the rest stacked right. */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_auto_1fr]">
            {/* Gallery */}
            <RetroWindow
              title="Gallery"
              version={snapshot.data ? `saved ${shortDate(snapshot.data.createdAt)}` : undefined}
              tone="dark"
              className="order-1 self-start lg:order-none lg:row-span-3"
            >
              {snapshot.isError ? (
                <p className="p-6 font-mono text-sm text-muted">No saved items. Run &quot;npm run snapshot -- assets&quot;.</p>
              ) : (
                // Phones: a swipeable strip, so Item Info sits right under it. sm+: a grid.
                <ul
                  aria-label="Recent items"
                  className="flex snap-x snap-mandatory gap-px overflow-x-auto bg-line sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible xl:grid-cols-4"
                >
                  {!items
                    ? Array.from({ length: 8 }, (_, i) => (
                        <li key={i} className="aspect-square w-40 shrink-0 animate-pulse bg-surface sm:w-auto" />
                      ))
                    : items.map((it) => {
                        const isSelected = it.id === selected?.id;
                        return (
                          <li key={it.id} className="w-40 shrink-0 snap-start bg-background sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedId(it.id)}
                              aria-pressed={isSelected}
                              className={`flex size-full flex-col gap-2 p-3 text-left ${
                                isSelected ? "bg-[#f285a0] text-[#3d2d31]" : "hover:bg-surface"
                              }`}
                            >
                              <span className={`flex aspect-square items-center justify-center ${isSelected ? "bg-[#f7aec0]" : "bg-surface"}`}>
                                {it.image ? (
                                  // Locally saved snapshot image.
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={it.image} alt="" className="size-[85%] object-contain" loading="lazy" />
                                ) : (
                                  <span className="label-mono text-muted">no image</span>
                                )}
                              </span>
                              <span className="line-clamp-2 text-sm leading-snug font-medium">{it.name}</span>
                              {it.type && <span className={`label-mono ${isSelected ? "" : "text-muted"}`}>{it.type}</span>}
                            </button>
                          </li>
                        );
                      })}
                </ul>
              )}
            </RetroWindow>

            {/* Selected item */}
            <RetroWindow
              title="Item Info"
              version={selected ? `#${shortId(selected.id)}` : undefined}
              className="tone-grey order-2 self-start lg:order-none"
            >
              {selected ? <ItemInfo item={selected} /> : <p className="p-4 font-mono text-sm text-muted">Pick an item.</p>}
            </RetroWindow>

            {/* Live activity */}
            <RetroWindow title="Activity.log" version={activityStatus} tone="pink" className="order-3 self-start lg:order-none">
              {!activity.transfers ? (
                activity.source === "live" && !activity.isFetching ? (
                  <div className="flex flex-col items-start gap-3 p-4">
                    <p className="text-sm">Couldn&apos;t load activity.</p>
                    <button
                      type="button"
                      onClick={() => activity.retryLive()}
                      className="flex items-center gap-2 border border-foreground px-3 py-1.5 text-sm font-medium hover:bg-foreground hover:text-background"
                    >
                      <IconRefresh size={16} stroke={1.75} /> Try again
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {Array.from({ length: 5 }, (_, i) => (
                      <li key={i} className="px-4 py-3">
                        <span className="block h-9 animate-pulse bg-surface-2" />
                      </li>
                    ))}
                  </ul>
                )
              ) : activity.transfers.length === 0 ? (
                <p className="px-4 py-4 font-mono text-sm text-muted">No item moves in the last few hours.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {activity.transfers.map((t) => (
                    <li key={`${t.hash}:${t.logIndex}:${t.id}`} className="flex flex-col gap-1 px-4 py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium" title={nameOf.get(t.id) ?? t.id}>
                          {nameOf.get(t.id) ?? `Item #${shortId(t.id)}`}
                        </span>
                        <span className="label-mono shrink-0">×{t.copies}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted">
                          {t.from ? (
                            <>
                              {t.from.toLowerCase() === ZERO ? "minted" : shortAddress(t.from)}
                              <IconArrowRight size={12} stroke={2} className="shrink-0" />
                              {shortAddress(t.to)}
                            </>
                          ) : (
                            "last move"
                          )}
                        </span>
                        <a
                          href={`${POLYGONSCAN}/tx/${t.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="label-mono flex shrink-0 items-center gap-1 text-muted hover:text-foreground"
                        >
                          {timeAgo(t.timestamp)}
                          <IconExternalLink size={12} stroke={1.75} />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </RetroWindow>

            {/* ERC-721 vs ERC-1155 */}
            <RetroWindow title="721 vs 1155.txt" className="tone-white order-4 self-start lg:order-none">
              <dl className="divide-y divide-line">
                <div className="flex flex-col gap-1 px-4 py-3">
                  <dt className="label-mono text-muted">LAND · ERC-721</dt>
                  <dd className="font-mono text-sm">ownerOf(id) → 1 owner</dd>
                </div>
                <div className="flex flex-col gap-1 px-4 py-3">
                  <dt className="label-mono text-muted">ASSETS · ERC-1155</dt>
                  <dd className="font-mono text-sm">balanceOf(owner, id) → N copies</dd>
                </div>
              </dl>
            </RetroWindow>
          </div>
        </div>
      </FramedSection>

      {/* Live totals */}
      <FramedSection label="Last ~3 hours" title="Items on the move" tone="pink">
        <CellGrid className="md:grid-cols-3">
          <BigNumber value={activity.stats?.transfers.toLocaleString()} label="item transfers" />
          <BigNumber value={activity.stats?.copies.toLocaleString()} label="copies moved" />
          <BigNumber value={activity.stats?.items.toLocaleString()} label="different items" />
        </CellGrid>
      </FramedSection>
    </>
  );
}

function ItemInfo({ item }: { item: AssetItem }) {
  const rows: [string, string][] = [
    ["Type", item.type ?? "—"],
    ["Catalyst", item.catalyst ?? "—"],
    ["Token ID", shortId(item.id)],
    ["Last moved", `${timeAgo(item.lastTransfer.timestamp)} · ×${item.lastTransfer.copies}`],
  ];
  return (
    <div className="flex flex-col">
      {item.image && (
        <div className="flex aspect-[4/3] items-center justify-center border-b border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.name} className="size-[80%] object-contain" />
        </div>
      )}
      <p className="px-4 pt-3 pb-1 text-lg leading-snug font-medium">{item.name}</p>
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2">
            <dt className="label-mono text-muted">{label}</dt>
            <dd className="text-right font-mono text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2 border-t border-line p-4">
        {item.externalUrl && <ExternalButton href={item.externalUrl}>View on The Sandbox</ExternalButton>}
        <ExternalButton href={`${POLYGONSCAN}/token/${ASSET_CONTRACT}?a=${item.id}`}>Token on Polygonscan</ExternalButton>
      </div>
    </div>
  );
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 border border-foreground px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background"
    >
      {children} <IconExternalLink size={15} stroke={1.75} />
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

import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { CellGrid, FramedSection } from "@/components/frame";
import { BlockClock } from "./block-clock";
import { MiniMap } from "./mini-map";
import { BigNumbers, ChainCompare, StatHeadline } from "./preview-stats";
import { RetroWindow } from "./retro-window";

/*
 * Design preview: the Overview in a retro-desktop style (inspired by
 * typesafe.ai), kept separate from "/" so the two can be compared.
 * Not linked from the nav.
 */
export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false },
};

const FAQ = [
  { q: "What is LAND?", a: "A parcel of The Sandbox map, owned as an NFT." },
  { q: "Why two chains?", a: "Ethereum is secure but costly. Polygon is cheaper." },
  { q: "Do I need a wallet?", a: "No. Everything here is public." },
  { q: "Where does the data come from?", a: "Straight from the contracts. No backend." },
  { q: "What if the internet drops?", a: "A saved snapshot takes over." },
];

export default function PreviewPage() {
  return (
    <div className="flex flex-col">
      {/* Hero: a little desktop with live windows */}
      <FramedSection divider={false}>
        <div className="flex flex-col gap-10 px-6 pt-12 pb-14 sm:px-10 sm:pt-16">
          <p className="label-mono text-subtle">LAND Explorer · System 0.1 · Preview</p>

          <div className="tone-dark bg-background bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:14px_14px] p-4 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <RetroWindow title="LAND Map 1.0" version="snapshot" className="tone-light">
                <MiniMap />
                <p className="label-mono flex gap-4 border-t border-line px-4 py-2 text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 bg-land-polygon" /> Polygon
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 bg-land-ethereum" /> Ethereum
                  </span>
                </p>
              </RetroWindow>
              <div className="flex flex-col gap-6">
                <RetroWindow title="Block Clock 1.1" version="live" tone="pink">
                  <BlockClock />
                </RetroWindow>
                <RetroWindow title="Read me.txt" className="tone-light">
                  <p className="px-4 py-3 font-mono text-sm text-muted">
                    Land, items and money are tokens. This reads them live.
                  </p>
                </RetroWindow>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <StatHeadline />
            <Link
              href="/land"
              className="tone-pink group flex w-fit shrink-0 items-center gap-2 bg-background px-5 py-3 font-medium text-foreground hover:bg-surface"
            >
              Open the map
              <IconArrowRight
                size={18}
                stroke={2}
                className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </FramedSection>

      {/* Chains side by side */}
      <FramedSection label="01 · Compare" title="Two chains, one map" tone="dark">
        <div className="border-t border-line p-6 sm:p-10">
          <ChainCompare />
        </div>
      </FramedSection>

      {/* Big numbers */}
      <FramedSection label="02 · Numbers" title="By the numbers" tone="pink">
        <CellGrid className="md:grid-cols-3">
          <BigNumbers />
        </CellGrid>
      </FramedSection>

      {/* FAQ */}
      <FramedSection label="03 · FAQ" title="Questions">
        <div className="divide-y divide-line border-t border-line">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-xl font-medium tracking-[-0.02em] hover:bg-surface sm:px-10 [&::-webkit-details-marker]:hidden">
                {q}
                <IconPlus
                  size={20}
                  stroke={1.75}
                  className="shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="px-6 pb-5 text-lg text-muted sm:px-10">{a}</p>
            </details>
          ))}
        </div>
      </FramedSection>

      {/* Stamp */}
      <FramedSection>
        <p className="label-mono flex flex-wrap justify-between gap-2 px-6 py-6 text-subtle sm:px-10">
          <span>LAND Explorer · Version 0.1</span>
          <span>LX.0S1 · Made for class</span>
        </p>
      </FramedSection>
    </div>
  );
}

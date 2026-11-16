import Link from "next/link";
import {
  IconArrowRight,
  IconBox,
  IconBuildingStore,
  IconChevronRight,
  IconCoin,
  IconDatabase,
  IconDeviceGamepad2,
  IconMap2,
  IconPalette,
  IconPlugConnected,
  IconWorld,
} from "@tabler/icons-react";
import { NAV_ITEMS } from "@/lib/nav";
import { AnimatedLetters } from "@/components/animated-letters";
import { CellGrid, FramedSection } from "@/components/frame";
import { ChainSplit, TokenStat } from "./overview-stats";

/** Colour-tinted tags under the hero, one per token type. */
const HERO_TAGS = [
  { label: "LAND", standard: "ERC-721", href: "/land", text: "text-land-polygon", tint: "bg-land-polygon/10 group-hover:bg-land-polygon/18" },
  { label: "SAND", standard: "ERC-20", href: "/economy", text: "text-accent", tint: "bg-accent/8 group-hover:bg-accent/15" },
  { label: "ASSETS", standard: "ERC-1155", href: "/assets", text: "text-estate", tint: "bg-estate/10 group-hover:bg-estate/18" },
];

const TOKENS = [
  {
    kind: "land" as const,
    icon: IconMap2,
    name: "LAND",
    standard: "ERC-721",
    body: "One unique parcel of the map.",
    href: "/land",
    cta: "Explore the map",
  },
  {
    kind: "sand" as const,
    icon: IconCoin,
    name: "SAND",
    standard: "ERC-20",
    body: "The currency. Every coin is identical.",
    href: "/economy",
    cta: "See the economy",
  },
  {
    kind: "assets" as const,
    icon: IconBox,
    name: "ASSETS",
    standard: "ERC-1155",
    body: "Creator items. One design, many copies.",
    href: "/assets",
    cta: "Browse assets",
  },
];

const FLOW = [
  { icon: IconPalette, title: "Create", body: "Design in VoxEdit." },
  { icon: IconBox, title: "Mint", body: "Turn it into an ASSET." },
  { icon: IconBuildingStore, title: "Sell", body: "Sell it for SAND." },
  { icon: IconDeviceGamepad2, title: "Build", body: "Use it on LAND." },
  { icon: IconCoin, title: "Earn", body: "Players come, SAND flows." },
];

const HOW_IT_WORKS = [
  {
    icon: IconPlugConnected,
    title: "Straight from the chain",
    body: "No backend. Public contracts only.",
  },
  {
    icon: IconWorld,
    title: "No wallet needed",
    body: "All of this data is public.",
  },
  {
    icon: IconDatabase,
    title: "Works offline",
    body: "A saved snapshot steps in.",
  },
];

export default function OverviewPage() {
  const tour = NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <FramedSection divider={false}>
        <div className="flex flex-col gap-7 px-6 pt-16 pb-14 sm:px-10 sm:pt-24 sm:pb-20">
          <p className="label-mono text-accent">01 · Overview</p>
          <h1 className="display max-w-6xl text-[clamp(3.25rem,8vw,7.5rem)]">Explore The Sandbox&apos;s on-chain world</h1>
          <p className="max-w-2xl text-xl text-muted">
            A virtual world where land, items and money are tokens. Read live from the blockchain.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/land"
              className="group flex items-center gap-2 bg-accent px-5 py-3 font-medium text-accent-ink hover:bg-accent-strong"
            >
              Start exploring
              <IconArrowRight
                size={18}
                stroke={2}
                className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
            <Link href="/economy" className="border border-line-strong px-5 py-3 font-medium hover:bg-surface-2">
              About SAND
            </Link>
          </div>
        </div>
        {/* Token tags as a strip of shared-border cells. */}
        <CellGrid className="sm:grid-cols-3">
          {HERO_TAGS.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className={`wave group relative flex items-center justify-between gap-2 bg-background px-6 py-4 font-medium sm:px-10 ${tag.text}`}
            >
              {/* Tint as a layer: a translucent cell background would let the grid lines show through. */}
              <span aria-hidden="true" className={`absolute inset-0 transition-colors ${tag.tint}`} />
              <span className="relative">
                <AnimatedLetters text={tag.label} effect="wave" />
              </span>
              <span className="label-mono relative opacity-70">{tag.standard}</span>
            </Link>
          ))}
        </CellGrid>
      </FramedSection>

      {/* Three token types */}
      <FramedSection
        label="02 · Tokens"
        title="Three kinds of token"
        lead="A different token standard for each job."
      >
        <CellGrid className="lg:grid-cols-3">
          {TOKENS.map(({ kind, icon: Icon, name, standard, body, href, cta }) => (
            <article key={name} className="flex flex-col gap-5 bg-background p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center bg-accent-soft text-accent">
                  <Icon size={22} stroke={1.75} />
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.02em]">{name}</h3>
                  <p className="label-mono text-muted">{standard}</p>
                </div>
              </div>
              <TokenStat kind={kind} />
              <p className="flex-1 text-muted">{body}</p>
              <Link href={href} className="flex w-fit items-center gap-1 font-medium text-accent hover:underline">
                {cta} <IconChevronRight size={18} stroke={1.75} />
              </Link>
            </article>
          ))}
        </CellGrid>
      </FramedSection>

      {/* Creator economy */}
      <FramedSection
        label="03 · Economy loop"
        title="How creators earn"
      >
        <CellGrid className="sm:grid-cols-2 lg:grid-cols-5">
          {FLOW.map(({ icon: Icon, title, body }, i) => (
            // The 5th step spans both columns on the 2-column layout, so no empty cell shows.
            <div key={title} className="flex flex-col gap-2 bg-background p-6 sm:last:col-span-2 lg:last:col-span-1">
              <span className="flex items-center justify-between">
                <Icon size={24} stroke={1.75} className="text-accent" />
                <span className="label-mono text-subtle">0{i + 1}</span>
              </span>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="text-muted">{body}</p>
            </div>
          ))}
        </CellGrid>
      </FramedSection>

      {/* Two chains */}
      <FramedSection
        label="04 · Networks"
        title="Why two blockchains?"
        lead="Ethereum is secure but costly. Polygon is cheaper, and parcels can move across."
      >
        <div className="border-t border-line p-6 sm:p-10">
          <ChainSplit />
        </div>
      </FramedSection>

      {/* How the demo works */}
      <FramedSection label="05 · Under the hood" title="How this demo works">
        <CellGrid className="md:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-2 bg-background p-6 sm:p-10">
              <Icon size={22} stroke={1.75} className="text-accent" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="text-muted">{body}</p>
            </div>
          ))}
        </CellGrid>
      </FramedSection>

      {/* Tour */}
      <FramedSection label="06 · Tour" title="The tour">
        <CellGrid className="sm:grid-cols-2 xl:grid-cols-4">
          {tour.map(({ icon: NavIcon, ...item }, i) => (
            <Link key={item.href} href={item.href} className="group flex flex-col gap-2 bg-background p-6 hover:bg-surface sm:p-10">
              <span className="flex items-center justify-between">
                <NavIcon size={20} stroke={1.75} className="text-accent" />
                <span className="label-mono text-subtle">0{i + 2}</span>
              </span>
              <span className="mt-6 flex items-center gap-1 text-lg font-semibold">
                {item.label}
                <IconArrowRight
                  size={16}
                  stroke={2}
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </span>
              <span className="text-muted">{item.caption}</span>
            </Link>
          ))}
        </CellGrid>
      </FramedSection>
    </div>
  );
}

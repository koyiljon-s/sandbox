import Link from "next/link";
import type { ReactNode } from "react";
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
import { ChainSplit, TokenStat } from "./overview-stats";

const TOKENS = [
  {
    kind: "land" as const,
    icon: IconMap2,
    name: "LAND",
    standard: "ERC-721 · unique NFT",
    body: "A parcel of the 408 × 408 map. Each one has its own coordinates and owner, so no two are interchangeable.",
    href: "/land",
    cta: "Explore the map",
  },
  {
    kind: "sand" as const,
    icon: IconCoin,
    name: "SAND",
    standard: "ERC-20 · fungible token",
    body: "The currency of the world. Every SAND is identical, so it's counted in amounts, like money.",
    href: "/economy",
    cta: "See the economy",
  },
  {
    kind: "assets" as const,
    icon: IconBox,
    name: "ASSETS",
    standard: "ERC-1155 · semi-fungible",
    body: "Items made by creators: a sword or a tree. One design can be minted as many identical copies.",
    href: "/assets",
    cta: "Browse assets",
  },
];

const FLOW = [
  { icon: IconPalette, title: "Create", body: "Design a voxel item in VoxEdit." },
  { icon: IconBox, title: "Mint", body: "Publish it as an ASSET token." },
  { icon: IconBuildingStore, title: "Sell", body: "Trade it on the marketplace for SAND." },
  { icon: IconDeviceGamepad2, title: "Build", body: "Place assets on LAND with Game Maker." },
  { icon: IconCoin, title: "Earn", body: "Players visit; creators and owners earn SAND." },
];

const HOW_IT_WORKS = [
  {
    icon: IconPlugConnected,
    title: "Reads the contracts directly",
    body: "No backend or database. The browser calls The Sandbox's public smart contracts on Polygon and Ethereum through an RPC endpoint.",
  },
  {
    icon: IconWorld,
    title: "No wallet or sign-in",
    body: "Everything shown here is public on the blockchain. Anyone can read who owns what, without an account.",
  },
  {
    icon: IconDatabase,
    title: "Works offline",
    body: "A saved snapshot of the whole map takes over automatically if the blockchain can't be reached.",
  },
];

export default function OverviewPage() {
  const tour = NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <div className="flex flex-col gap-14 px-6 py-10">
      {/* Hero */}
      <section className="flex max-w-3xl flex-col gap-5">
        <p className="font-mono text-sm text-accent">01 · Overview</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Explore The Sandbox&apos;s on-chain world</h1>
        <p className="text-xl text-muted">
          The Sandbox is a virtual world where players build, own and trade. Its land, items and currency are all
          blockchain tokens, which means anyone can verify who owns what. This demo reads those tokens live.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/land" className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-strong">
            Start exploring <IconArrowRight size={18} stroke={1.75} />
          </Link>
          <Link href="/economy" className="rounded-lg border border-line-strong px-5 py-3 font-semibold hover:bg-surface-2">
            About SAND
          </Link>
        </div>
      </section>

      {/* Three token types */}
      <Section
        title="Three kinds of token"
        lead="The Sandbox uses a different token standard for each job. That choice is the core idea of this demo."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {TOKENS.map(({ kind, icon: Icon, name, standard, body, href, cta }) => (
            <article key={name} className="flex flex-col gap-4 border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon size={22} stroke={1.75} />
                </span>
                <div>
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="font-mono text-sm text-muted">{standard}</p>
                </div>
              </div>
              <TokenStat kind={kind} />
              <p className="flex-1 text-muted">{body}</p>
              <Link href={href} className="flex w-fit items-center gap-1 font-semibold text-accent hover:underline">
                {cta} <IconChevronRight size={18} stroke={1.75} />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Creator economy */}
      <Section title="How creators earn" lead="The tokens connect into one loop, from making an item to earning from it.">
        <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {FLOW.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex flex-col gap-2 bg-surface p-5">
              <span className="flex items-center justify-between">
                <Icon size={24} stroke={1.75} className="text-accent" />
                <span className="font-mono text-sm text-subtle">{i + 1}</span>
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Two chains */}
      <Section
        title="Why two blockchains?"
        lead="LAND started on Ethereum, which is secure but expensive to use. Polygon is a cheaper network connected to Ethereum by a bridge, and owners can move parcels across. Here's where every parcel is today:"
      >
        <div className="border border-line bg-surface p-6">
          <ChainSplit />
        </div>
      </Section>

      {/* How the demo works */}
      <Section title="How this demo works">
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-2 border border-line bg-surface p-5">
              <Icon size={22} stroke={1.75} className="text-accent" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Tour */}
      <Section title="The tour">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tour.map(({ icon: NavIcon, ...item }, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-2 border border-line bg-surface p-5 hover:border-line-strong hover:bg-surface-2"
            >
              <span className="flex items-center justify-between">
                <NavIcon size={20} stroke={1.75} className="text-accent" />
                <span className="font-mono text-sm text-subtle">0{i + 2}</span>
              </span>
              <span className="text-lg font-semibold">{item.label}</span>
              <span className="text-muted">{item.caption}</span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex max-w-3xl flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {lead && <p className="text-lg text-muted">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

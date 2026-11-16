import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";
import { Icon } from "@/components/shell/icons";

const SECTION_BLURBS: Record<string, string> = {
  "/land": "Browse the LAND map, see who owns each parcel, and how parcels merge into ESTATES.",
  "/economy": "SAND, the ERC-20 token used for buying, staking and governance.",
  "/assets": "Creator-made items, and why they use ERC-1155 instead of ERC-721.",
  "/mint": "Mint a test parcel on a testnet, live during the presentation.",
};

export default function OverviewPage() {
  const sections = NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <div className="flex flex-col gap-10 px-6 py-10">
      <section className="flex max-w-3xl flex-col gap-5">
        <p className="font-mono text-sm text-accent">01 · Overview</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Explore The Sandbox&apos;s on-chain world
        </h1>
        <p className="text-xl text-muted">
          The Sandbox is a virtual world where land, items and currency are blockchain tokens.
          This demo reads those tokens straight from their public smart contracts.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/land"
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-strong"
          >
            Start exploring
          </Link>
          <Link
            href="/economy"
            className="rounded-lg border border-line-strong px-5 py-3 font-semibold hover:bg-surface-2"
          >
            About SAND
          </Link>
        </div>
      </section>

      <section aria-labelledby="sections-heading" className="flex flex-col gap-4">
        <h2 id="sections-heading" className="text-sm font-semibold uppercase tracking-wider text-subtle">
          The tour
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sections.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-3 border border-line bg-surface p-5 hover:border-line-strong hover:bg-surface-2"
            >
              <span className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-surface-3 text-accent">
                  <Icon name={item.icon} />
                </span>
                <span className="font-mono text-sm text-subtle">0{i + 2}</span>
              </span>
              <span className="text-lg font-semibold">{item.label}</span>
              <span className="text-muted">{SECTION_BLURBS[item.href]}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

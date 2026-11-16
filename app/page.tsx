import Link from "next/link";
import type { ReactNode } from "react";
import { IconCoin, IconCube, IconHexagon3d, IconMap2, type Icon } from "@tabler/icons-react";
import { CellGrid, FramedSection } from "@/components/frame";
import { RetroWindow } from "@/components/retro-window";
import { BlockClock } from "@/components/block-clock";

/*
 * The Overview: a launcher desktop where each page is an "app",
 * matching the window style of the LAND and Economy pages.
 */

type App = {
  href: string;
  name: string;
  caption: string;
  icon: Icon;
  /** Tile colour block (see .tone-* in globals.css). */
  tone: string;
};

const APPS: App[] = [
  { href: "/land", name: "LAND.app", caption: "Map & owners", icon: IconMap2, tone: "tone-grey" },
  { href: "/economy", name: "Economy.app", caption: "SAND, live", icon: IconCoin, tone: "tone-pink" },
  { href: "/assets", name: "Assets.app", caption: "Creator items", icon: IconCube, tone: "tone-white" },
];

const FACTS = [
  { value: "166,464", label: "parcels of LAND" },
  { value: "3B", label: "SAND, fixed supply" },
  { value: "2", label: "chains: Ethereum + Polygon" },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <FramedSection divider={false}>
        <div className="flex flex-col gap-6 px-6 pt-12 pb-10 sm:px-10 sm:pt-16">
          <p className="label-mono text-accent">01 · Overview</p>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1] font-medium tracking-[-0.04em]">
            The Sandbox, on-chain.
            <br />
            <span className="text-muted">Open an app to explore.</span>
          </h1>
        </div>
      </FramedSection>

      {/* The desktop */}
      <FramedSection>
        <div className="tone-dark border-t border-line bg-background text-foreground">
          {/* Menu bar */}
          <div className="tone-white flex h-9 items-center justify-between gap-4 border-b border-foreground bg-background px-4 text-foreground">
            <span className="label-mono flex items-center gap-2">
              <IconHexagon3d size={15} stroke={2} />
              LAND Explorer
              <span className="hidden text-muted sm:inline">· System 0.1</span>
            </span>
            <span className="label-mono hidden text-muted sm:inline">Ethereum · Polygon</span>
          </div>

          <div className="grid min-h-[440px] gap-10 bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:14px_14px] p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* App icons */}
            <nav aria-label="Apps">
              <ul className="grid grid-cols-2 content-start gap-x-6 gap-y-10 sm:grid-cols-3">
                {APPS.map((app) => (
                  <li key={app.href}>
                    <AppIcon {...app} />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Windows */}
            <div className="flex flex-col gap-6">
              <RetroWindow title="About.txt" className="tone-white">
                <div className="flex flex-col gap-2 px-4 py-3 font-mono text-sm">
                  <p>The Sandbox is a virtual world.</p>
                  <p>Its land, items and money are tokens.</p>
                  <p className="text-muted">This app reads them live.</p>
                </div>
              </RetroWindow>
              <RetroWindow title="Status" version="live" className="tone-grey">
                <BlockClock />
              </RetroWindow>
            </div>
          </div>
        </div>
      </FramedSection>

      {/* Key facts */}
      <FramedSection label="At a glance" title="The numbers" tone="pink">
        <CellGrid className="md:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col gap-2 bg-background p-6 sm:p-10">
              <span className="text-[clamp(3rem,7vw,6rem)] leading-none font-medium tracking-[-0.05em] tabular-nums">
                {f.value}
              </span>
              <span className="label-mono text-muted">{f.label}</span>
            </div>
          ))}
        </CellGrid>
      </FramedSection>
    </div>
  );
}

/** A desktop icon: a coloured tile, then a name label that inverts on hover, like a selected icon. */
function AppIcon({ href, name, caption, icon: Icon, tone }: App) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-3 text-center outline-none">
      <span
        className={`${tone} flex size-24 items-center justify-center border border-foreground bg-background text-foreground transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none`}
      >
        <Icon size={40} stroke={1.5} />
      </span>
      <span className="flex flex-col items-center gap-1">
        <Label>{name}</Label>
        <span className="text-sm text-muted">{caption}</span>
      </span>
    </Link>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="label-mono px-1.5 py-0.5 group-hover:bg-foreground group-hover:text-background group-focus-visible:bg-foreground group-focus-visible:text-background">
      {children}
    </span>
  );
}

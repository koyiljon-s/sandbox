import type { Metadata } from "next";
import { FramedSection } from "@/components/frame";
import { EconomyDesktop } from "./economy-desktop";

export const metadata: Metadata = { title: "Economy" };

export default function EconomyPage() {
  return (
    <div className="flex flex-col">
      <FramedSection divider={false}>
        <div className="flex flex-col gap-6 px-6 pt-12 pb-10 sm:px-10 sm:pt-16">
          <p className="label-mono text-accent">03 · Economy</p>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1] font-medium tracking-[-0.04em]">
            3B SAND.
            <br />
            <span className="text-muted">Moving live on two chains.</span>
          </h1>
        </div>
      </FramedSection>
      <EconomyDesktop />
    </div>
  );
}

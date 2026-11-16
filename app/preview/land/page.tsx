import type { Metadata } from "next";
import { FramedSection } from "@/components/frame";
import { LandDesktop } from "./land-desktop";

/*
 * Design preview: the LAND page in a retro-desktop style (inspired by
 * typesafe.ai), kept separate from /land so the two can be compared.
 * Not linked from the nav.
 */
export const metadata: Metadata = {
  title: "LAND preview",
  robots: { index: false },
};

export default function LandPreviewPage() {
  return (
    <div className="flex flex-col">
      <FramedSection divider={false}>
        <div className="flex flex-col gap-6 px-6 pt-12 pb-10 sm:px-10 sm:pt-16">
          <p className="label-mono text-subtle">LAND Explorer · System 0.1 · LAND preview</p>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1] font-medium tracking-[-0.04em]">
            408 × 408 parcels.
            <br />
            <span className="text-muted">Click one.</span>
          </h1>
        </div>
      </FramedSection>
      <LandDesktop />
    </div>
  );
}

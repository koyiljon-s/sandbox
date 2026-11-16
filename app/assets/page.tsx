import type { Metadata } from "next";
import { FramedSection } from "@/components/frame";
import { AssetsDesktop } from "./assets-desktop";

export const metadata: Metadata = { title: "Assets" };

export default function AssetsPage() {
  return (
    <div className="flex flex-col">
      <FramedSection divider={false}>
        <div className="flex flex-col gap-6 px-6 pt-12 pb-10 sm:px-10 sm:pt-16">
          <p className="label-mono text-accent">04 · Assets</p>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] leading-[1] font-medium tracking-[-0.04em]">
            One design.
            <br />
            <span className="text-muted">Many copies.</span>
          </h1>
        </div>
      </FramedSection>
      <AssetsDesktop />
    </div>
  );
}

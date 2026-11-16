import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { LandGrid } from "./land-grid";

export const metadata: Metadata = { title: "LAND" };

export default function LandPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="02 · LAND"
        title="LAND explorer"
        description="The Sandbox map is 408 × 408 parcels, and each one is an ERC-721 NFT on Ethereum or Polygon. Colours below are read live from both chains; click a parcel for its owner and metadata."
        shows="ERC-721 ownership & metadata"
      />
      <LandGrid />
    </div>
  );
}

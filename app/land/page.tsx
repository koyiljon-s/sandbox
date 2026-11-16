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
        description="Every parcel on The Sandbox map is an ERC-721 NFT. Click a parcel to see its details."
        shows="ERC-721 ownership & metadata"
      />
      <LandGrid />
    </div>
  );
}

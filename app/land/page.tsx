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
        description="408 × 408 parcels, each an NFT. Click one to see its owner."
        shows="ERC-721 ownership"
      />
      <LandGrid />
    </div>
  );
}

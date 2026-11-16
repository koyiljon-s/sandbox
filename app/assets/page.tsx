import type { Metadata } from "next";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const metadata: Metadata = { title: "Assets" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="04 · Assets"
        title="ASSETS gallery"
        description="Items made by creators and traded as tokens. Each design can have many copies."
        shows="ERC-1155 vs. ERC-721"
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Gallery">A grid of ASSETS with image, name and supply.</PlaceholderCard>
        <PlaceholderCard title="ERC-721 vs. ERC-1155">Why LAND is unique (721) and items are semi-fungible (1155).</PlaceholderCard>
      </div>
    </div>
  );
}

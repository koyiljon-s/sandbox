import type { Metadata } from "next";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const metadata: Metadata = { title: "Assets" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="04 · Assets"
        title="ASSETS gallery"
        description="Creator items. One design, many copies."
        shows="ERC-1155 vs. ERC-721"
      />
      <div className="grid gap-4 p-6 sm:p-10 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Gallery">Items with image and supply.</PlaceholderCard>
        <PlaceholderCard title="ERC-721 vs. ERC-1155">Unique vs. multi-copy.</PlaceholderCard>
      </div>
    </div>
  );
}

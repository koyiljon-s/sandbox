import type { Metadata } from "next";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const metadata: Metadata = { title: "Mint" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="05 · Mint"
        title="Mint a test parcel"
        description="Mint your own parcel on a testnet. No real money."
        shows="Writing to the blockchain"
      />
      <div className="grid gap-4 p-6 sm:p-10 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Pick a spot">Any free parcel.</PlaceholderCard>
        <PlaceholderCard title="Mint">Sign on a testnet.</PlaceholderCard>
        <PlaceholderCard title="Done">See it on the explorer.</PlaceholderCard>
      </div>
    </div>
  );
}

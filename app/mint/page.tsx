import type { Metadata } from "next";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const metadata: Metadata = { title: "Mint" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="05 · Mint"
        title="Mint a test parcel"
        description="Pick coordinates and mint your own parcel NFT on a testnet. No real funds involved."
        shows="Writing to the blockchain"
      />
      <div className="grid gap-4 p-6 sm:p-10 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Choose coordinates">Select a free spot on the test map.</PlaceholderCard>
        <PlaceholderCard title="Mint">Sign the transaction with your wallet on a testnet.</PlaceholderCard>
        <PlaceholderCard title="Confirmation">Transaction hash and a link to the testnet explorer.</PlaceholderCard>
      </div>
    </div>
  );
}

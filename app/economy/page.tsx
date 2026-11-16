import type { Metadata } from "next";
import { PageHeader, PlaceholderCard } from "@/components/page-header";

export const metadata: Metadata = { title: "Economy" };

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="03 · Economy"
        title="SAND economy"
        description="SAND is the ERC-20 utility and governance token of The Sandbox."
        shows="ERC-20 balances, supply & transfers"
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Your SAND balance">Balance of the connected wallet, read from the SAND contract.</PlaceholderCard>
        <PlaceholderCard title="Total supply">Live total supply of SAND.</PlaceholderCard>
        <PlaceholderCard title="Recent transfers">Latest SAND transfer events, each linked to a block explorer.</PlaceholderCard>
        <PlaceholderCard title="What SAND is used for">Buying LAND and ASSETS, staking, and governance voting.</PlaceholderCard>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { EconomyDashboard } from "./economy-dashboard";

export const metadata: Metadata = { title: "Economy" };

export default function EconomyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        step="03 · Economy"
        title="SAND economy"
        description="SAND is the ERC-20 token behind The Sandbox: the currency for LAND and ASSETS, and the token used for staking and governance. It lives on Ethereum and is bridged to Polygon."
        shows="ERC-20 supply, balances & Transfer events"
      />
      <EconomyDashboard />
    </div>
  );
}

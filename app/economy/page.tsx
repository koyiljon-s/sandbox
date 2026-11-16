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
        description="The currency of The Sandbox, on Ethereum and Polygon."
        shows="ERC-20 supply & transfers"
      />
      <EconomyDashboard />
    </div>
  );
}

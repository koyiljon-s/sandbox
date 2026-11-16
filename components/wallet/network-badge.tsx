"use client";

import { useConnection } from "wagmi";

export function NetworkBadge({ collapsed }: { collapsed: boolean }) {
  const connection = useConnection();

  let dot = "bg-subtle";
  let label = "Not connected";
  if (connection.isConnected && connection.chain) {
    dot = "bg-success";
    label = connection.chain.name;
  } else if (connection.isConnected) {
    dot = "bg-danger";
    label = "Unsupported network";
  }

  return (
    <div
      title={`Network: ${label}`}
      className={`flex items-center gap-2 text-sm text-muted ${collapsed ? "justify-center" : "px-2"}`}
    >
      <span className={`size-2 shrink-0 rounded-full ${dot}`} />
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

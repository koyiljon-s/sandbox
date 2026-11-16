"use client";

import { useConnect, useConnection, useConnectors, type Connector } from "wagmi";
import { IconAlertTriangle, IconLoader2, IconWallet } from "@tabler/icons-react";
import { useShell } from "@/components/shell/app-shell";
import { AccountPanel, ConnectPanel, ConnectErrorPanel } from "./wallet-panels";
import { shortAddress, usableConnectors } from "./format";

export function WalletButton({ collapsed }: { collapsed: boolean }) {
  const connection = useConnection();
  const connectors = useConnectors();
  const { mutate: connect, isPending } = useConnect();
  const { openPanel } = useShell();

  const connectWith = (connector: Connector) =>
    connect(
      { connector },
      {
        onSuccess: () => openPanel({ id: "wallet:account", title: "Wallet", body: <AccountPanel /> }),
        onError: (error) =>
          openPanel({ id: "wallet:error", title: "Couldn't connect", body: <ConnectErrorPanel error={error} /> }),
      },
    );

  function handleClick() {
    if (connection.isConnected) {
      openPanel({ id: "wallet:account", title: "Wallet", body: <AccountPanel /> });
      return;
    }
    const wallets = usableConnectors(connectors);
    const noWalletInstalled = wallets.length === 1 && wallets[0].id === "injected" && !("ethereum" in window);
    if (noWalletInstalled) {
      openPanel({ id: "wallet:none", title: "No wallet found", body: <ConnectPanel onConnect={connectWith} /> });
    } else if (wallets.length === 1) {
      connectWith(wallets[0]);
    } else {
      openPanel({ id: "wallet:connect", title: "Connect a wallet", body: <ConnectPanel onConnect={connectWith} /> });
    }
  }

  const busy = isPending || connection.isReconnecting;
  const wrongNetwork = connection.isConnected && !connection.chain;

  let label = "Connect wallet";
  let icon = <IconWallet size={18} stroke={1.75} />;
  let style = "bg-accent text-accent-ink hover:bg-accent-strong";
  if (busy) {
    label = isPending ? "Check your wallet…" : "Reconnecting…";
    icon = <IconLoader2 size={18} stroke={1.75} className="animate-spin" />;
  } else if (wrongNetwork) {
    label = "Wrong network";
    icon = <IconAlertTriangle size={18} stroke={1.75} />;
    style = "bg-danger text-white hover:opacity-90";
  } else if (connection.isConnected) {
    label = shortAddress(connection.address);
    style = "border border-line-strong bg-surface-2 text-foreground hover:bg-surface-3";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={collapsed ? label : undefined}
      aria-label={connection.isConnected && !wrongNetwork ? `Wallet ${connection.address}` : label}
      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold disabled:cursor-wait disabled:opacity-70 ${style} ${
        collapsed ? "px-0" : "px-3"
      }`}
    >
      {icon}
      {!collapsed && <span className={connection.isConnected && !wrongNetwork ? "font-mono text-sm" : ""}>{label}</span>}
    </button>
  );
}

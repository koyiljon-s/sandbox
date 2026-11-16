"use client";

import { useState } from "react";
import { useChains, useConnection, useConnectors, useDisconnect, useSwitchChain, type Connector } from "wagmi";
import { IconCheck, IconCopy, IconExternalLink, IconLoader2 } from "@tabler/icons-react";
import { useShell } from "@/components/shell/app-shell";
import { EXPLORERS } from "@/lib/contracts";
import { usableConnectors } from "./format";

const secondaryButton =
  "flex items-center justify-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 font-semibold hover:bg-surface-2 disabled:opacity-60";

/* ---------- Choose a wallet ---------- */

export function ConnectPanel({ onConnect }: { onConnect: (connector: Connector) => void }) {
  const connectors = useConnectors();
  const wallets = usableConnectors(connectors);
  const noneInstalled = wallets.length === 1 && wallets[0].id === "injected" && typeof window !== "undefined" && !("ethereum" in window);

  if (noneInstalled) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          This demo needs a browser wallet extension to read your address. MetaMask is free and works in
          Chrome, Firefox, Brave and Edge.
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-ink hover:bg-accent-strong"
        >
          Get MetaMask <IconExternalLink size={16} stroke={1.75} />
        </a>
        <p className="text-sm text-subtle">You can still browse every page without a wallet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted">Pick the wallet to connect. Nothing is signed or sent: connecting only shares your address.</p>
      <ul className="flex flex-col gap-2">
        {wallets.map((connector) => (
          <li key={connector.uid}>
            <button
              type="button"
              onClick={() => onConnect(connector)}
              className="flex w-full items-center gap-3 border border-line px-4 py-3 text-left font-medium hover:border-line-strong hover:bg-surface-2"
            >
              {connector.icon ? (
                // Wallet-provided data: URI icon, so next/image adds nothing here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={connector.icon} alt="" width={24} height={24} className="size-6" />
              ) : (
                <span className="size-6 rounded-md bg-surface-3" />
              )}
              {connector.id === "injected" ? "Browser wallet" : connector.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Connection failed ---------- */

export function ConnectErrorPanel({ error }: { error: Error }) {
  let message = "Something went wrong while connecting. Please try again.";
  if (error.name === "UserRejectedRequestError") message = "The request was declined in your wallet. Nothing changed.";
  else if (error.name === "ProviderNotFoundError") message = "No wallet extension was found in this browser.";
  else if (error.name === "ResourceUnavailableRpcError")
    message = "Your wallet already has a pending request. Open the wallet extension to finish or cancel it.";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted">{message}</p>
      <p className="font-mono text-xs break-words text-subtle">{error.name}</p>
    </div>
  );
}

/* ---------- Connected account ---------- */

export function AccountPanel() {
  const connection = useConnection();
  const chains = useChains();
  const { mutate: switchChain, isPending: switching, variables } = useSwitchChain();
  const { mutate: disconnect } = useDisconnect();
  const { closePanel } = useShell();
  const [copied, setCopied] = useState(false);

  // status narrows the type; isConnected alone is also true while reconnecting.
  if (connection.status !== "connected") {
    return <p className="text-muted">Wallet disconnected.</p>;
  }

  const { address, chain, connector } = connection;
  const explorer = chain ? EXPLORERS[chain.id] : undefined;

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the full address is visible to select by hand.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-subtle">Address</h3>
        <div className="flex items-start gap-2 border border-line p-3">
          <span className="min-w-0 flex-1 font-mono text-sm break-all">{address}</span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy address"
            title="Copy address"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
          >
            {copied ? <IconCheck size={18} stroke={1.75} className="text-success" /> : <IconCopy size={18} stroke={1.75} />}
          </button>
        </div>
        <p className="text-sm text-subtle">Connected with {connector.name}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-subtle">Network</h3>
        {!chain && (
          <p className="border border-danger/40 bg-danger/10 p-3 text-sm">
            Your wallet is on a network this demo doesn&apos;t use. Switch to Polygon or Ethereum.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {chains.map((c) => {
            const current = chain?.id === c.id;
            const pending = switching && variables?.chainId === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={current || switching}
                  onClick={() => switchChain({ chainId: c.id })}
                  className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left font-medium ${
                    current
                      ? "border-accent bg-accent-soft"
                      : "border-line hover:border-line-strong hover:bg-surface-2 disabled:opacity-60"
                  }`}
                >
                  {c.name}
                  {current && <span className="text-sm text-accent">Connected</span>}
                  {pending && <IconLoader2 size={18} stroke={1.75} className="animate-spin text-muted" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-2">
        {explorer && (
          <a href={`${explorer}/address/${address}`} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
            View on {chain?.blockExplorers?.default.name ?? "explorer"} <IconExternalLink size={16} stroke={1.75} />
          </a>
        )}
        <button
          type="button"
          onClick={() => disconnect(undefined, { onSuccess: closePanel })}
          className={`${secondaryButton} text-danger`}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

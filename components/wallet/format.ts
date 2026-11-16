import type { Connector } from "wagmi";

/**
 * Wallets to offer. Browsers announce installed wallets individually (EIP-6963),
 * and there is also a generic "Injected" fallback; hide it when real ones exist.
 */
export function usableConnectors(connectors: readonly Connector[]) {
  const named = connectors.filter((c) => c.id !== "injected");
  return named.length > 0 ? named : connectors;
}

/** 0x1234…abcd */
export function shortAddress(address: string | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

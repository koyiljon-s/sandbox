import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, polygon } from "wagmi/chains";

/*
 * RPC endpoints. Public ones work with no key but can be slow or rate-limited;
 * set NEXT_PUBLIC_POLYGON_RPC_URL / NEXT_PUBLIC_ETHEREUM_RPC_URL (e.g. Alchemy)
 * in .env.local for the presentation.
 */
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com";
const ETHEREUM_RPC = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "https://ethereum-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  // Polygon first: it's where LAND activity mostly is now.
  chains: [polygon, mainnet],
  // Browser wallets such as MetaMask. No third-party account or key needed.
  connectors: [injected()],
  transports: {
    [polygon.id]: http(POLYGON_RPC),
    [mainnet.id]: http(ETHEREUM_RPC),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

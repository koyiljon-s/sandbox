import { parseAbi } from "viem";
import { mainnet, polygon } from "viem/chains";

/*
 * The Sandbox contract addresses. Each one was checked on-chain (name/symbol)
 * on 2026-11-16, and the Polygon ones match the official bridge docs:
 * https://docs.sandbox.game/en/owners/tsb-bridge
 */
export const CONTRACTS = {
  [polygon.id]: {
    land: "0x9d305a42A3975Ee4c1C57555BeD5919889DCE63F",
    sand: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
  },
  [mainnet.id]: {
    land: "0x5CC5B05a8A13E3fBDB0BB9FcCd98D38e50F90c38",
    sand: "0x3845badAde8e6dFF049820680d1F14bD3903a5d0",
  },
} as const;

/** Block explorers, for "View on chain" links. */
export const EXPLORERS = {
  [polygon.id]: "https://polygonscan.com",
  [mainnet.id]: "https://etherscan.io",
} as const;

/*
 * LAND is ERC-721 with metadata but NOT enumerable: there is no totalSupply()
 * or tokenOfOwnerByIndex(), so a wallet's parcels can't be listed from the
 * contract alone. ownerOf() reverts for parcels that don't exist on that chain.
 */
export const landAbi = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function width() view returns (uint256)",
  "function height() view returns (uint256)",
]);

export const sandAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

/*
 * ASSETS: creator items, ERC-1155, on Polygon. Not in the official bridge docs;
 * found via block explorer records and verified on-chain on 2026-11-17:
 * supportsInterface(ERC-1155) = true, name "The Sandbox's ASSETs", symbol "ASSET".
 * Like LAND it can't list its items, so recent ones come from transfer events.
 * uri(id) returns ipfs:// metadata (name, image, attributes).
 */
export const ASSET_CONTRACT = "0xdbc52cd5b8eda1a7bcbabb838ca927d23e3673e5" as const;

export const assetAbi = parseAbi([
  "function uri(uint256 id) view returns (string)",
  "function balanceOf(address owner, uint256 id) view returns (uint256)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
]);

/*
 * IPFS gateway for ASSET metadata and images. Public gateways are slow and
 * rate-limited (measured 5–25 s, or 429s), which is why the snapshot saves
 * item images locally. Override with NEXT_PUBLIC_IPFS_GATEWAY if you have one.
 */
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/** ipfs://CID/path → gateway URL; other URLs pass through. */
export function ipfsToHttp(uri: string, gateway: string = IPFS_GATEWAY) {
  return uri.startsWith("ipfs://") ? gateway + uri.slice("ipfs://".length) : uri;
}

/*
 * Ethereum contract holding ~51k LAND (as of 2026-11-16), including parcels
 * that also have an owner on Polygon. Probably a bridge, but it is NOT the
 * bridge listed in the official docs and could not be identified, so the UI
 * labels it neutrally rather than naming it.
 */
export const ETH_LAND_HOLDER_CONTRACT = "0x6cE82874EAf6E7602fD21Cf8bBDEd82705680A99";

/* ---------- LAND coordinates ---------- */

/** Map is 408 × 408 on both chains (read from width()/height()). */
export const LAND_GRID_SIZE = 408;
/** Displayed coordinates are centred: raw (204, 204) is shown as (0, 0). */
const OFFSET = LAND_GRID_SIZE / 2;

/**
 * tokenId = x + y × 408, with raw x/y in 0..407.
 * Verified: token 100000 has metadata "Land X 40, Land Y 245" and name "LAND (-164, 41)".
 */
export function landTokenId(x: number, y: number): bigint {
  const rx = x + OFFSET;
  const ry = y + OFFSET;
  if (!Number.isInteger(rx) || !Number.isInteger(ry) || rx < 0 || ry < 0 || rx >= LAND_GRID_SIZE || ry >= LAND_GRID_SIZE) {
    throw new RangeError(`LAND coordinates out of range: (${x}, ${y})`);
  }
  return BigInt(rx + ry * LAND_GRID_SIZE);
}

/** Inverse of landTokenId, returning centred display coordinates. */
export function landCoordinates(tokenId: bigint): { x: number; y: number } {
  const id = Number(tokenId);
  if (!Number.isInteger(id) || id < 0 || id >= LAND_GRID_SIZE * LAND_GRID_SIZE) {
    throw new RangeError(`Not a LAND token ID: ${tokenId}`);
  }
  return { x: (id % LAND_GRID_SIZE) - OFFSET, y: Math.floor(id / LAND_GRID_SIZE) - OFFSET };
}

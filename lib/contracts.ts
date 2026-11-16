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

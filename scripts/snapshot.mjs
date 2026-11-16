#!/usr/bin/env node
/**
 * Saves a snapshot of LAND and SAND data for demo mode / offline fallback.
 *
 *   npm run snapshot
 *
 * Writes public/demo/sand-snapshot.json: SAND total supply on each chain and
 * the newest Transfer events. And public/demo/land-snapshot.json:
 *   - statuses: one character per parcel for the whole 408 × 408 map, indexed by
 *     token ID: p = Polygon, e = Ethereum, c = held by contract, u = not minted
 *   - parcels: full details (owners, metadata, local preview image) for the presets
 *
 * Uses the same RPC env vars as the app (NEXT_PUBLIC_*_RPC_URL), else public RPCs.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, http } from "viem";
import { mainnet, polygon } from "viem/chains";
import { CONTRACTS, ETH_LAND_HOLDER_CONTRACT, LAND_GRID_SIZE, landAbi, sandAbi } from "../lib/contracts.ts";
import presets from "../lib/land-presets.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public/demo");
const IMG_DIR = path.join(OUT_DIR, "images");

const TOTAL = LAND_GRID_SIZE * LAND_GRID_SIZE;
const OFFSET = LAND_GRID_SIZE / 2;
// ownerOf calls per multicall request. At 1000, every Polygon call fails silently
// (hits the eth_call gas limit, and allowFailure reports each as "not owned").
// 500 measured correct; 250 leaves margin.
const CHUNK = 250;
const VERIFY_SAMPLE = 300;
const CONCURRENCY = 4;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const clients = {
  polygon: createPublicClient({
    chain: polygon,
    transport: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com", { retryCount: 4, timeout: 30_000 }),
  }),
  ethereum: createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "https://ethereum-rpc.publicnode.com", { retryCount: 4, timeout: 30_000 }),
  }),
};
const landAddress = { polygon: CONTRACTS[polygon.id].land, ethereum: CONTRACTS[mainnet.id].land };

// Same rule as parcelStatus() in lib/land.ts.
function status(polygonOwner, ethereumOwner) {
  if (polygonOwner) return "p";
  if (ethereumOwner && ethereumOwner.toLowerCase() === ETH_LAND_HOLDER_CONTRACT.toLowerCase()) return "c";
  if (ethereumOwner) return "e";
  return "u";
}

async function ownersForRange(chain, start, end) {
  const contracts = [];
  for (let id = start; id < end; id++) {
    contracts.push({ address: landAddress[chain], abi: landAbi, functionName: "ownerOf", args: [BigInt(id)] });
  }
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await clients[chain].multicall({ contracts, allowFailure: true, batchSize: 0 });
      return res.map((r) => (r.status === "success" ? r.result : undefined));
    } catch (err) {
      if (attempt >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

/** Re-reads random parcels in tiny batches; any mismatch means the bulk read was unreliable. */
async function verifySample(statuses) {
  const ids = Array.from({ length: VERIFY_SAMPLE }, () => Math.floor(Math.random() * TOTAL));
  let mismatches = 0;
  for (let i = 0; i < ids.length; i += 25) {
    const batch = ids.slice(i, i + 25);
    const read = async (chain) => {
      const res = await clients[chain].multicall({
        contracts: batch.map((id) => ({ address: landAddress[chain], abi: landAbi, functionName: "ownerOf", args: [BigInt(id)] })),
        allowFailure: true,
      });
      return res.map((r) => (r.status === "success" ? r.result : undefined));
    };
    const [p, e] = await Promise.all([read("polygon"), read("ethereum")]);
    batch.forEach((id, j) => {
      if (status(p[j], e[j]) !== statuses[id]) mismatches++;
    });
  }
  return mismatches;
}

async function snapshotMap() {
  const statuses = new Array(TOTAL);
  const starts = [];
  for (let s = 0; s < TOTAL; s += CHUNK) starts.push(s);
  let done = 0;
  const t0 = Date.now();

  async function worker() {
    while (starts.length) {
      const start = starts.shift();
      const end = Math.min(TOTAL, start + CHUNK);
      const [p, e] = await Promise.all([ownersForRange("polygon", start, end), ownersForRange("ethereum", start, end)]);
      for (let i = 0; i < end - start; i++) statuses[start + i] = status(p[i], e[i]);
      done += end - start;
      process.stdout.write(`\r  map: ${((done / TOTAL) * 100).toFixed(1)}% (${Math.round((Date.now() - t0) / 1000)}s)   `);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
  return statuses.join("");
}

async function readOrUndefined(chain, functionName, tokenId) {
  try {
    return await clients[chain].readContract({ address: landAddress[chain], abi: landAbi, functionName, args: [tokenId] });
  } catch {
    return undefined;
  }
}

/** Downloads a preview image; returns its public path, or undefined. */
async function saveImage(url, tokenId) {
  try {
    if (new URL(url).protocol !== "https:") return undefined;
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return undefined;
    const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[type.split(";")[0]] ?? null;
    if (!ext) return undefined;
    await writeFile(path.join(IMG_DIR, `${tokenId}.${ext}`), buf);
    return `/demo/images/${tokenId}.${ext}`;
  } catch {
    return undefined;
  }
}

async function snapshotParcel({ x, y }) {
  const tokenId = BigInt(x + OFFSET + (y + OFFSET) * LAND_GRID_SIZE);
  const [polygonOwner, ethereumOwner] = await Promise.all([
    readOrUndefined("polygon", "ownerOf", tokenId),
    readOrUndefined("ethereum", "ownerOf", tokenId),
  ]);
  const s = status(polygonOwner, ethereumOwner);
  const metadataChain = s === "p" ? "polygon" : s === "u" ? undefined : "ethereum";
  const entry = { tokenId: tokenId.toString(), x, y, polygonOwner, ethereumOwner, metadataChain };

  if (metadataChain) {
    const uri = await readOrUndefined(metadataChain, "tokenURI", tokenId);
    if (typeof uri === "string" && uri.startsWith("https://")) {
      try {
        const md = await (await fetch(uri, { signal: AbortSignal.timeout(20_000) })).json();
        // Keep only the fields the app displays.
        entry.metadata = {
          name: typeof md.name === "string" ? md.name : undefined,
          sandbox: md.sandbox && typeof md.sandbox.name === "string" ? { name: md.sandbox.name } : undefined,
          properties: Array.isArray(md.properties)
            ? md.properties
                .filter((p) => p && typeof p.trait_type === "string" && ["string", "number"].includes(typeof p.value))
                .map((p) => ({ trait_type: p.trait_type, value: p.value }))
            : undefined,
          image: typeof md.image === "string" ? await saveImage(md.image, tokenId) : undefined,
        };
      } catch {
        // Metadata is optional in the snapshot.
      }
    }
  }
  console.log(`  parcel (${x}, ${y}) #${tokenId}: ${s}${entry.metadata?.image ? " + image" : ""}`);
  return entry;
}

/* ---------- SAND ---------- */

// Same lookback as app/economy/use-sand.ts.
const SAND_LOOKBACK = { ethereum: 300n, polygon: 10_000n };
const chainIds = { ethereum: mainnet.id, polygon: polygon.id };

async function sandTransfers(chain) {
  const client = clients[chain];
  const latest = await client.getBlockNumber();
  const logs = await client.getLogs({
    address: CONTRACTS[chainIds[chain]].sand,
    event: sandAbi.find((i) => i.type === "event" && i.name === "Transfer"),
    fromBlock: latest - SAND_LOOKBACK[chain],
    toBlock: latest,
  });
  const newest = logs.slice(-8).reverse();
  const blocks = new Map();
  for (const n of new Set(newest.map((l) => l.blockNumber))) blocks.set(n, await client.getBlock({ blockNumber: n }));
  return newest.map((l) => ({
    chainId: chainIds[chain],
    hash: l.transactionHash,
    logIndex: l.logIndex,
    blockNumber: l.blockNumber.toString(),
    timestamp: new Date(Number(blocks.get(l.blockNumber).timestamp) * 1000).toISOString(),
    from: l.args.from,
    to: l.args.to,
    value: l.args.value.toString(),
  }));
}

async function snapshotSand() {
  console.log("Snapshotting SAND supply and recent transfers…");
  const supply = {};
  const transfers = [];
  for (const chain of ["ethereum", "polygon"]) {
    supply[chainIds[chain]] = (
      await clients[chain].readContract({ address: CONTRACTS[chainIds[chain]].sand, abi: sandAbi, functionName: "totalSupply" })
    ).toString();
    transfers.push(...(await sandTransfers(chain)));
  }
  transfers.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const snapshot = { createdAt: new Date().toISOString(), totalSupply: supply, transfers };
  await writeFile(path.join(OUT_DIR, "sand-snapshot.json"), JSON.stringify(snapshot));
  console.log(`Saved public/demo/sand-snapshot.json (${transfers.length} transfers)`);
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await snapshotSand();

  console.log(`Snapshotting ${TOTAL.toLocaleString()} parcels on Polygon + Ethereum…`);
  const statuses = await snapshotMap();
  if (statuses.length !== TOTAL || /[^pecu]/.test(statuses)) throw new Error("Snapshot is incomplete; not writing it.");

  console.log(`Verifying ${VERIFY_SAMPLE} random parcels with small batches…`);
  const mismatches = await verifySample(statuses);
  // A few can legitimately change hands during the run; more means bad reads.
  if (mismatches > 3) throw new Error(`${mismatches}/${VERIFY_SAMPLE} sampled parcels disagree; not writing the snapshot.`);
  console.log(`  ${mismatches} mismatches`);

  console.log("Snapshotting preset parcels…");
  const parcels = {};
  for (const preset of presets) {
    const entry = await snapshotParcel(preset);
    parcels[entry.tokenId] = entry;
  }

  const counts = Object.fromEntries([..."pecu"].map((c) => [c, statuses.split(c).length - 1]));
  const snapshot = { createdAt: new Date().toISOString(), gridSize: LAND_GRID_SIZE, counts, statuses, parcels };
  await writeFile(path.join(OUT_DIR, "land-snapshot.json"), JSON.stringify(snapshot));
  console.log("Saved public/demo/land-snapshot.json", counts);
}

main().catch((err) => {
  console.error("\nSnapshot failed:", err.shortMessage ?? err.message);
  process.exit(1);
});

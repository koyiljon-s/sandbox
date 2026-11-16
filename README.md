# LAND Explorer

A student demo that explores **The Sandbox** through its public smart contracts: who owns each parcel of land, where it lives (Ethereum or Polygon), and how the SAND token moves. Everything shown is read live from the blockchain. There's no backend, no database and no wallet needed.

> Unofficial student project. Not affiliated with or endorsed by The Sandbox.

## What it shows

| Page | What you see | Blockchain concept |
|---|---|---|
| **Overview** | A launcher desktop: each page is an "app", plus live block numbers and the key numbers | Blocks, tokens, two chains |
| **LAND** | A retro "desktop" of windows: live 408 × 408 map, search, parcel info, legend, and live counts of what's in view | ERC-721 ownership and metadata |
| **Economy** | A desktop of windows: live transfer feed, supply split, uses and contracts | ERC-20 supply and `Transfer` events |
| **Assets** | A desktop of windows: gallery of recent creator items, item info, live activity | ERC-1155: one design, many copies |

## Getting started

Requires **Node.js 22.18 or newer**. The snapshot script runs TypeScript directly in Node.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: your own RPC endpoints

The app works out of the box with free public RPC endpoints, but they can be slow or rate-limited. For a presentation, use your own (free from [Alchemy](https://www.alchemy.com) or [Infura](https://www.infura.io)):

```bash
cp .env.example .env.local
# then fill in:
# NEXT_PUBLIC_POLYGON_RPC_URL=...
# NEXT_PUBLIC_ETHEREUM_RPC_URL=...
```

`.env.local` is git-ignored. These keys are visible in the browser, which is normal for RPC keys; restrict them to your domain in the provider's dashboard.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` locally in the Cloudflare Worker runtime (after a build) |
| `npm run deploy` | Build and deploy to Cloudflare from your machine (needs `npx wrangler login` once) |
| `npm run lint` | ESLint |
| `npm run snapshot` | Save fresh offline data to `public/demo/` (a few minutes) |
| `npm run snapshot -- assets` | Refresh only the Assets gallery (items and images) |

## How it works

```mermaid
flowchart LR
    B[Browser] -->|multicall via RPC| P[(Polygon<br/>LAND · SAND)]
    B -->|multicall via RPC| E[(Ethereum<br/>LAND · SAND)]
    B -->|tokenURI| M[Sandbox metadata API]
    B -. if live reads fail .-> S[public/demo snapshot]
```

- **Direct contract reads.** [wagmi](https://wagmi.sh) and [viem](https://viem.sh) call the contracts from the browser. The visible map window (640 parcels) is read in one batched multicall per chain.
- **Two chains per parcel.** LAND exists on Ethereum and Polygon. A parcel moved to Polygon keeps a copy on Ethereum held by a contract, so **the Polygon owner, when present, is the current owner.**
- **Offline fallback.** If the RPC can't be reached, pages switch to a saved snapshot automatically and show an "Offline" banner. The snapshot covers ownership status for the **whole map** (about 23 KB gzipped), plus full details for the preset parcels.

### Verified contracts

Checked on-chain (name and symbol) on 16–17 Nov 2026. The LAND and SAND Polygon addresses match [The Sandbox's bridge docs](https://docs.sandbox.game/en/owners/tsb-bridge). ASSETS isn't in those docs; it was found through block-explorer records and confirmed on-chain as ERC-1155 ("The Sandbox's ASSETs").

| Contract | Network | Address |
|---|---|---|
| LAND | Polygon | `0x9d305a42A3975Ee4c1C57555BeD5919889DCE63F` |
| SAND | Polygon | `0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683` |
| LAND | Ethereum | `0x5CC5B05a8A13E3fBDB0BB9FcCd98D38e50F90c38` |
| SAND | Ethereum | `0x3845badAde8e6dFF049820680d1F14bD3903a5d0` |
| ASSETS (ERC-1155) | Polygon | `0xdbc52cd5b8eda1a7bcbabb838ca927d23e3673e5` |

### Things learned the hard way

- **LAND token IDs:** `tokenId = x + y × 408`, with raw coordinates 0–407. The map displays them centred, so raw (204, 204) is shown as (0, 0). Verified against token `100000` = LAND (-164, 41).
- **LAND isn't enumerable.** There's no `totalSupply()` or `tokenOfOwnerByIndex()`, so you can't list a wallet's parcels from the contract alone.
- **Multicall batch size matters on Polygon.** With 1,000 `ownerOf` calls per request, every call fails *silently* (reported as "not owned"). The snapshot script uses 250 and re-checks 300 random parcels in small batches before saving.

## Project structure

```
app/
  page.tsx              Overview (launcher desktop)
  land/                 LAND desktop (map, find, parcel info, legend), data hooks
  economy/              SAND desktop (transfers, supply, uses, contracts), data hooks
  assets/               ASSETS desktop (gallery, item info, activity), data hooks
  icon.svg, apple-icon.tsx
components/
  shell/                Top nav, app shell
  frame.tsx             Visible page frame, section lines, "+" marks, cell grids
  retro-window.tsx      Desktop-style window (striped title bar, version stamp)
  block-clock.tsx       Live latest block on Ethereum and Polygon
  data-status.tsx       Live / snapshot label, offline banner
lib/
  contracts.ts          Addresses, ABIs, token ID ↔ coordinates
  land.ts               Parcel status rules, search parsing
  wagmi.ts              Chains and RPC config (read-only, no wallet)
scripts/snapshot.mjs    Builds the offline snapshot
public/demo/            Snapshot data and saved preview images
```

## Design

Light, flat and structural: a framed centre column with visible rules and "+" marks, shared-border grids, square corners, large tightly-set headlines and small monospace labels. Every page uses retro desktop windows and colour blocks (near-black `#1f1f1f`, pink `#f285a0`, grey, white); any block can switch palette with a `tone-*` class (see `app/globals.css`). Type is [Space Grotesk](https://github.com/floriankarsten/space-grotesk) (OFL), icons are [Tabler](https://tabler.io/icons) (MIT). Hover animations respect the system's "reduce motion" setting.

## Known limitations

- **ESTATES** (merged parcels) aren't shown yet.
- The map assumes **y increases downward**; not yet checked against The Sandbox's own map.
- Some preview images are missing upstream (for example, LAND #100000 returns 404).
- ASSETS metadata and images live on IPFS, and public gateways are slow (5–25 s) or rate-limited. That's why the gallery uses the snapshot; only the activity feed is live.
- The explanatory text on SAND uses and the creator loop is simplified; check it against [The Sandbox's docs](https://docs.sandbox.game) before relying on it.

## Deployment

Live at **https://sandbox.orcyn.xyz**, as a Cloudflare Worker that serves the static export (Workers Static Assets). No server code runs: every page reads the blockchain from the browser.

- `next.config.ts` sets `output: "export"`, so `npm run build` writes the site to `out/`.
- `wrangler.jsonc` defines the Worker (`land-explorer`), points it at `out/`, and attaches the custom domain `sandbox.orcyn.xyz`. Cloudflare creates the DNS record and certificate.
- Deploys run automatically on every push to `main` (Cloudflare Workers Builds, connected to this repo): build command `npm run build`, deploy command `npx wrangler deploy`.
- RPC URLs (`NEXT_PUBLIC_*`) are baked in at **build** time, so set them as build variables in the Worker's Cloudflare settings, not as runtime variables.
- Snapshots in `public/demo/` ship with the build. Run `npm run snapshot`, commit, and push to refresh them online.

## Before presenting

1. Run `npm run snapshot` the day before.
2. Add your own RPC keys in `.env.local`.
3. Test the offline fallback once by turning Wi-Fi off.

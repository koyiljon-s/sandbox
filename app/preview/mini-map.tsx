"use client";

import { useEffect, useRef } from "react";
import { LAND_GRID_SIZE } from "@/lib/contracts";
import { useLandSnapshot } from "@/lib/land-snapshot";

/** Visible window of the mini map, in parcels. */
const COLS = 64;
const ROWS = 24;
/** Raw row where the window starts: the map's centre band, evenly split between both chains. */
const ROW0 = 200;
const CELL = 6; // canvas pixels per parcel; scaled up with crisp pixels
const STEP_MS = 400;

/**
 * Real ownership from the snapshot, drawn as pixels and slowly panning
 * across the map, Game-of-Life style. Holds still under reduced motion.
 */
export function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: snapshot } = useLandSnapshot();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !snapshot) return;

    const css = getComputedStyle(document.documentElement);
    const color = {
      p: css.getPropertyValue("--land-polygon").trim(),
      e: css.getPropertyValue("--land-ethereum").trim(),
      c: css.getPropertyValue("--line-strong").trim(),
      u: css.getPropertyValue("--surface-2").trim(),
      bg: css.getPropertyValue("--background").trim(),
    } as Record<string, string>;

    let offset = 120; // start inside a dense stretch
    const draw = () => {
      ctx.fillStyle = color.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const rawX = (offset + x) % LAND_GRID_SIZE;
          const code = snapshot.statuses[rawX + (ROW0 + y) * LAND_GRID_SIZE];
          ctx.fillStyle = color[code] ?? color.u;
          // 1px gap between cells keeps the grid readable.
          ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
        }
      }
    };

    draw();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      offset = (offset + 1) % LAND_GRID_SIZE;
      draw();
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [snapshot]);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * CELL}
      height={ROWS * CELL}
      role="img"
      aria-label="LAND ownership, panning slowly across the map. Violet is Polygon, teal is Ethereum."
      className="block h-auto w-full bg-surface-2 [image-rendering:pixelated]"
    />
  );
}

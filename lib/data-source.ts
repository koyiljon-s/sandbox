/**
 * Where the data on screen came from:
 * - live: read from the blockchain just now
 * - fallback: live reads failed, so the saved snapshot is shown instead
 */
export type DataSource = "live" | "fallback";

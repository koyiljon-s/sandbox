/**
 * Where the data on screen came from:
 * - live: read from the blockchain just now
 * - snapshot: demo mode is on, so the saved snapshot is used on purpose
 * - fallback: live reads failed, so the snapshot is shown instead
 */
export type DataSource = "live" | "snapshot" | "fallback";

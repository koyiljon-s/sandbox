"use client";

import { IconAlertTriangle, IconLoader2, IconRefresh } from "@tabler/icons-react";
import type { DataSource } from "@/lib/data-source";
import { formatSnapshotDate } from "@/lib/land-snapshot";

/** Small "where is this data from" label: live, updating, or snapshot. */
export function DataSourceLabel({
  source,
  isFetching,
  snapshotDate,
  hasData,
}: {
  source: DataSource;
  isFetching: boolean;
  snapshotDate?: string;
  hasData: boolean;
}) {
  if (source === "live" && isFetching) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted">
        <IconLoader2 size={14} stroke={1.75} className="animate-spin" /> Reading Polygon + Ethereum…
      </span>
    );
  }
  if (source === "live" && hasData) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-success" /> Live on-chain data
      </span>
    );
  }
  if (source === "fallback" && snapshotDate) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-estate" /> Snapshot from {formatSnapshotDate(snapshotDate)}
      </span>
    );
  }
  return null;
}

/** Shown when live reads failed and the page fell back to the saved snapshot. */
export function FallbackBanner({ snapshotDate, onRetry }: { snapshotDate?: string; onRetry: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 border border-estate/50 bg-estate-soft p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2">
        <IconAlertTriangle size={20} stroke={1.75} className="mt-0.5 shrink-0 text-estate" />
        <span>
          <span className="font-semibold">Offline.</span>{" "}
          <span className="text-muted">
            Showing snapshot{snapshotDate ? ` from ${formatSnapshotDate(snapshotDate)}` : ""}.
          </span>
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold hover:bg-surface-2"
        >
          <IconRefresh size={16} stroke={1.75} /> Retry live
        </button>
      </div>
    </div>
  );
}

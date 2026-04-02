// Nanosecond <-> Date utilities for Motoko Time type

export const NS_PER_MS = BigInt(1_000_000);

/** Convert Motoko nanosecond timestamp → JS Date */
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / NS_PER_MS));
}

/** Convert JS Date → Motoko nanosecond timestamp */
export function dateToNs(d: Date): bigint {
  return BigInt(d.getTime()) * NS_PER_MS;
}

/** Format a nanosecond timestamp as a locale date string */
export function formatDate(ns: bigint): string {
  if (!ns) return "-";
  return nsToDate(ns).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format as short date + time */
export function formatDateTime(ns: bigint): string {
  if (!ns) return "-";
  return nsToDate(ns).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Days until a nanosecond timestamp from now */
export function daysUntil(ns: bigint): number {
  const ms = Number(ns / NS_PER_MS) - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Expiry = collection date + 42 days */
export function computeExpiry(collectionNs: bigint): bigint {
  const expiry = new Date(Number(collectionNs / NS_PER_MS));
  expiry.setDate(expiry.getDate() + 42);
  return dateToNs(expiry);
}

/** Now as nanosecond timestamp */
export function nowNs(): bigint {
  return dateToNs(new Date());
}

/** Generate a bigint ID from the current timestamp */
export function generateId(): bigint {
  return BigInt(Date.now());
}

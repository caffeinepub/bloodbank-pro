import { BloodGroup } from "../backend";

// Display labels for blood groups
export const BG_DISPLAY: Record<BloodGroup, string> = {
  aPos: "A+",
  aNeg: "A-",
  bPos: "B+",
  bNeg: "B-",
  abPos: "AB+",
  abNeg: "AB-",
  oPos: "O+",
  oNeg: "O-",
};

// CSS class per blood group
export const BG_CSS: Record<BloodGroup, string> = {
  aPos: "bg-blood-apos",
  aNeg: "bg-blood-aneg",
  bPos: "bg-blood-bpos",
  bNeg: "bg-blood-bneg",
  abPos: "bg-blood-abpos",
  abNeg: "bg-blood-abneg",
  oPos: "bg-blood-opos",
  oNeg: "bg-blood-oneg",
};

export const ALL_BLOOD_GROUPS = Object.values(BloodGroup);

// Inventory status helpers
export function getStockLevel(units: number): "critical" | "low" | "ok" {
  if (units === 0) return "critical";
  if (units < 5) return "low";
  return "ok";
}

export const STOCK_COLORS: Record<"critical" | "low" | "ok", string> = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  low: "text-warning-foreground bg-warning/20 border-warning/30",
  ok: "text-success-foreground bg-success/10 border-success/20",
};

export const STOCK_LABEL: Record<"critical" | "low" | "ok", string> = {
  critical: "Critical",
  low: "Low",
  ok: "Available",
};

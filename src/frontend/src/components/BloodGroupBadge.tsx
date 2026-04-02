import type { BloodGroup } from "../backend";
import { BG_CSS, BG_DISPLAY } from "../utils/blood";

interface Props {
  bloodGroup: BloodGroup;
  size?: "sm" | "md";
}

export function BloodGroupBadge({ bloodGroup, size = "md" }: Props) {
  const label = BG_DISPLAY[bloodGroup];
  const css = BG_CSS[bloodGroup];
  const sizeClass =
    size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${sizeClass} ${css}`}
    >
      {label}
    </span>
  );
}

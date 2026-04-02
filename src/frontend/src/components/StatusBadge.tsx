interface Props {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  // Test statuses
  pending: "bg-warning/20 text-warning-foreground border border-warning/30",
  passed: "bg-success/10 text-success-foreground border border-success/20",
  failed: "bg-destructive/10 text-destructive border border-destructive/20",
  // Inventory
  available: "bg-success/10 text-success-foreground border border-success/20",
  reserved: "bg-info/10 text-info-foreground border border-info/20",
  used: "bg-muted text-muted-foreground border border-border",
  expired: "bg-destructive/10 text-destructive border border-destructive/20",
  // Requests
  approved: "bg-info/10 text-info-foreground border border-info/20",
  fulfilled: "bg-success/10 text-success-foreground border border-success/20",
  rejected: "bg-destructive/10 text-destructive border border-destructive/20",
  // Urgency
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning/30 text-warning-foreground border border-warning/30",
  medium: "bg-info/10 text-info-foreground border border-info/20",
  low: "bg-muted text-muted-foreground border border-border",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
  available: "Available",
  reserved: "Reserved",
  used: "Used",
  expired: "Expired",
  approved: "Approved",
  fulfilled: "Fulfilled",
  rejected: "Rejected",
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function StatusBadge({ status }: Props) {
  const key = status.toLowerCase();
  const style =
    STATUS_STYLES[key] ?? "bg-muted text-muted-foreground border border-border";
  const label = STATUS_LABELS[key] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

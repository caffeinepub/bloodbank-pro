import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  Droplets,
  GitPullRequest,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { BloodGroup } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useDashboard, useInventory } from "../hooks/useQueries";
import {
  ALL_BLOOD_GROUPS,
  BG_DISPLAY,
  STOCK_LABEL,
  getStockLevel,
} from "../utils/blood";
import { daysUntil, formatDate } from "../utils/time";

function stockTextColor(level: "critical" | "low" | "ok"): string {
  if (level === "critical") return "text-destructive";
  if (level === "low") return "text-warning-foreground";
  return "text-success-foreground";
}

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboard();
  const { data: inventoryRows = [], isLoading: invLoading } = useInventory();

  const inventoryMap = new Map<string, number>();
  if (summary) {
    for (const [bg, units] of summary.inventory) {
      inventoryMap.set(bg, Number(units));
    }
  }

  const totalUnits = Array.from(inventoryMap.values()).reduce(
    (a, b) => a + b,
    0,
  );

  // Expiry alerts: units expiring within 7 days
  const expiryAlerts = inventoryRows.filter(([, u]) => {
    if (u.status === "expired") return false;
    const days = daysUntil(u.expiryTimestamp);
    return days >= 0 && days <= 7;
  });

  // Low stock blood groups
  const lowStockGroups = ALL_BLOOD_GROUPS.filter((bg) => {
    const units = inventoryMap.get(bg) ?? 0;
    return getStockLevel(units) !== "ok";
  });

  return (
    <AppLayout pageTitle="Dashboard">
      <PageHeader title="Dashboard" subtitle="Blood bank overview" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Donors"
              value={Number(summary?.totalDonors ?? 0)}
              icon={<Users className="w-5 h-5" />}
              color="primary"
            />
            <StatCard
              label="Total Patients"
              value={Number(summary?.totalPatients ?? 0)}
              icon={<UserCheck className="w-5 h-5" />}
              color="info"
            />
            <StatCard
              label="Pending Requests"
              value={Number(summary?.pendingRequests ?? 0)}
              icon={<GitPullRequest className="w-5 h-5" />}
              color="warning"
            />
            <StatCard
              label="Total Blood Units"
              value={totalUnits}
              icon={<Droplets className="w-5 h-5" />}
              color="success"
            />
          </>
        )}
      </div>

      {/* Alerts */}
      {!summaryLoading && !invLoading && (
        <div className="space-y-3 mb-6">
          {lowStockGroups.length > 0 && (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertTriangle className="w-4 h-4 text-warning-foreground" />
              <AlertDescription className="text-warning-foreground">
                <strong>Low stock alert:</strong>{" "}
                {lowStockGroups.map((bg) => BG_DISPLAY[bg]).join(", ")} —
                consider restocking.
              </AlertDescription>
            </Alert>
          )}
          {expiryAlerts.length > 0 && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <Clock className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>
                  {expiryAlerts.length} unit
                  {expiryAlerts.length !== 1 ? "s" : ""}
                </strong>{" "}
                expiring within 7 days.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Inventory grid */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Blood Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {ALL_BLOOD_GROUPS.map((bg, i) => {
                const units = inventoryMap.get(bg) ?? 0;
                const level = getStockLevel(units);
                return (
                  <motion.div
                    key={bg}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col items-center p-3 rounded-lg bg-card border border-border"
                  >
                    <BloodGroupBadge bloodGroup={bg as BloodGroup} size="sm" />
                    <p className="text-xl font-bold mt-1.5">{units}</p>
                    <p
                      className={`text-[10px] font-semibold uppercase ${stockTextColor(level)}`}
                    >
                      {STOCK_LABEL[level]}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiry details */}
      {expiryAlerts.length > 0 && (
        <Card className="shadow-card mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-destructive" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiryAlerts.map(([id, u]) => (
                <div
                  key={String(id)}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge bloodGroup={u.bloodGroup as BloodGroup} />
                    <span className="text-sm">{Number(u.units)} units</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p className="text-sm font-medium text-destructive">
                      {formatDate(u.expiryTimestamp)} (
                      {daysUntil(u.expiryTimestamp)}d)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}

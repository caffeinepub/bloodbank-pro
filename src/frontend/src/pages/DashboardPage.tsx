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
  const { data: inventory = [], isLoading: invLoading } = useInventory();

  // Build inventory map from summary
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
  const expiryAlerts = inventory.filter((u) => {
    if (u.status === "expired") return false;
    const days = daysUntil(u.expiryTimestamp);
    return days >= 0 && days <= 7;
  });

  // Low stock blood groups
  const lowStockGroups = ALL_BLOOD_GROUPS.filter((bg) => {
    const units = inventoryMap.get(bg) ?? 0;
    return units < 5;
  });

  const loading = summaryLoading || invLoading;

  return (
    <AppLayout pageTitle="Dashboard">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview of blood bank operations \u2022 ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* Low stock alert banner */}
      {!loading && lowStockGroups.length > 0 && (
        <Alert
          className="mb-5 border-destructive/30 bg-destructive/5"
          data-ocid="dashboard.low_stock.error_state"
        >
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            <span className="font-semibold text-destructive">
              Low Stock Alert:
            </span>{" "}
            {lowStockGroups.map((bg) => BG_DISPLAY[bg]).join(", ")} &#8212;
            units critically low or unavailable.
          </AlertDescription>
        </Alert>
      )}

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          label="Total Donors"
          value={
            loading ? "-" : Number(summary?.totalDonors ?? 0).toLocaleString()
          }
          icon={<Users className="w-5 h-5" />}
          loading={loading}
          sub="Registered donors"
        />
        <StatCard
          label="Total Patients"
          value={
            loading ? "-" : Number(summary?.totalPatients ?? 0).toLocaleString()
          }
          icon={<UserCheck className="w-5 h-5" />}
          loading={loading}
          sub="Registered patients"
        />
        <StatCard
          label="Pending Requests"
          value={
            loading
              ? "-"
              : Number(summary?.pendingRequests ?? 0).toLocaleString()
          }
          icon={<GitPullRequest className="w-5 h-5" />}
          loading={loading}
          color="text-warning-foreground"
          sub="Awaiting fulfillment"
        />
        <StatCard
          label="Total Blood Units"
          value={loading ? "-" : totalUnits.toLocaleString()}
          icon={<Droplets className="w-5 h-5" />}
          loading={loading}
          sub="Across all blood groups"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Blood inventory grid */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                Blood Inventory by Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div
                  className="grid grid-cols-4 gap-3"
                  data-ocid="dashboard.inventory.table"
                >
                  {ALL_BLOOD_GROUPS.map((bg, idx) => {
                    const units = inventoryMap.get(bg) ?? 0;
                    const level = getStockLevel(units);
                    const borderClass =
                      level === "critical"
                        ? "border-destructive/30 bg-destructive/5"
                        : level === "low"
                          ? "border-warning/30 bg-warning/5"
                          : "border-border bg-card";
                    return (
                      <motion.div
                        key={bg}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`rounded-xl border p-3 text-center ${borderClass}`}
                        data-ocid={`dashboard.inventory.item.${idx + 1}`}
                      >
                        <BloodGroupBadge
                          bloodGroup={bg as BloodGroup}
                          size="sm"
                        />
                        <p className="text-2xl font-bold mt-1.5 text-foreground">
                          {units}
                        </p>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${stockTextColor(level)}`}
                        >
                          {STOCK_LABEL[level]}
                        </p>
                        {units > 0 && units < 5 && (
                          <Badge className="mt-1 text-[9px] px-1 py-0 bg-warning/20 text-warning-foreground border-warning/30">
                            Low
                          </Badge>
                        )}
                        {units === 0 && (
                          <Badge className="mt-1 text-[9px] px-1 py-0 bg-destructive/20 text-destructive border-destructive/30">
                            None
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiry alerts */}
        <div>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning-foreground" />
                Expiry Alerts
                {expiryAlerts.length > 0 && (
                  <Badge className="bg-warning/20 text-warning-foreground border border-warning/30 text-[10px]">
                    {expiryAlerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : expiryAlerts.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="dashboard.expiry.empty_state"
                >
                  <TrendingUp className="w-8 h-8 text-success-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No expiry alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All inventory is fresh
                  </p>
                </div>
              ) : (
                <div className="space-y-2" data-ocid="dashboard.expiry.list">
                  {expiryAlerts.map((unit, idx) => {
                    const days = daysUntil(unit.expiryTimestamp);
                    return (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: expiry list
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-warning/5 border border-warning/20"
                        data-ocid={`dashboard.expiry.item.${idx + 1}`}
                      >
                        <div>
                          <BloodGroupBadge
                            bloodGroup={unit.bloodGroup}
                            size="sm"
                          />
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {Number(unit.units)} unit
                            {Number(unit.units) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-bold ${
                              days === 0
                                ? "text-destructive"
                                : "text-warning-foreground"
                            }`}
                          >
                            {days === 0 ? "Expires today!" : `${days}d left`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(unit.expiryTimestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

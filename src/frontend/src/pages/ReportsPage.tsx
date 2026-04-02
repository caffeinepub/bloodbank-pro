import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Download } from "lucide-react";
import { useMemo } from "react";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { PageHeader } from "../components/PageHeader";
import {
  useCollections,
  useDonors,
  useInventory,
  usePatients,
  useRequests,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";

function SectionCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { data: inventory = [], isLoading: invLoading } = useInventory();
  const { data: donors = [], isLoading: donLoading } = useDonors();
  const { data: collections = [], isLoading: colLoading } = useCollections();
  const { data: requests = [], isLoading: reqLoading } = useRequests();
  const { data: patients = [], isLoading: patLoading } = usePatients();

  const isLoading =
    invLoading || donLoading || colLoading || reqLoading || patLoading;

  // Inventory by blood group (available units)
  const invByBg = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of inventory) {
      if (u.status === "available") {
        const key = u.bloodGroup;
        m.set(key, (m.get(key) ?? 0) + Number(u.units));
      }
    }
    return m;
  }, [inventory]);

  // Collections stats
  const colStats = useMemo(
    () => ({
      total: collections.length,
      passed: collections.filter((c) => c.testStatus === "passed").length,
      failed: collections.filter((c) => c.testStatus === "failed").length,
      pending: collections.filter((c) => c.testStatus === "pending").length,
      totalVol: collections.reduce((a, c) => a + Number(c.volumeMl), 0),
    }),
    [collections],
  );

  // Request stats
  const reqStats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      fulfilled: requests.filter((r) => r.status === "fulfilled").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests],
  );

  // Donor stats by blood group
  const donByBg = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of donors) {
      m.set(d.bloodGroup, (m.get(d.bloodGroup) ?? 0) + 1);
    }
    return m;
  }, [donors]);

  return (
    <AppLayout pageTitle="Reports">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Summary of blood bank operations"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="no-print"
            data-ocid="reports.print.button"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Donors", val: donors.length },
              { label: "Total Patients", val: patients.length },
              { label: "Total Collections", val: collections.length },
              { label: "Total Requests", val: requests.length },
              {
                label: "Blood Units Available",
                val: Array.from(invByBg.values()).reduce((a, b) => a + b, 0),
              },
            ].map(({ label, val }) => (
              <Card key={label} className="shadow-card">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-3xl font-bold mt-1">{val}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Inventory by blood group */}
          <SectionCard title="🩸 Blood Inventory by Group">
            <Table data-ocid="reports.inventory.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Available Units</TableHead>
                  <TableHead>Donors</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_BLOOD_GROUPS.map((bg, idx) => {
                  const avail = invByBg.get(bg) ?? 0;
                  const donors2 = donByBg.get(bg) ?? 0;
                  return (
                    <TableRow
                      key={bg}
                      data-ocid={`reports.inventory.item.${idx + 1}`}
                    >
                      <TableCell>
                        <BloodGroupBadge bloodGroup={bg} />
                      </TableCell>
                      <TableCell className="font-semibold">{avail}</TableCell>
                      <TableCell>{donors2}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold ${
                            avail === 0
                              ? "text-destructive"
                              : avail < 5
                                ? "text-warning-foreground"
                                : "text-success-foreground"
                          }`}
                        >
                          {avail === 0 ? "Critical" : avail < 5 ? "Low" : "OK"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Collection stats */}
            <SectionCard title="😊 Donation Statistics">
              <div className="space-y-3">
                {[
                  {
                    label: "Total Collections",
                    val: colStats.total,
                    color: "text-foreground",
                  },
                  {
                    label: "Test Passed",
                    val: colStats.passed,
                    color: "text-success-foreground",
                  },
                  {
                    label: "Test Failed",
                    val: colStats.failed,
                    color: "text-destructive",
                  },
                  {
                    label: "Test Pending",
                    val: colStats.pending,
                    color: "text-warning-foreground",
                  },
                  {
                    label: "Total Volume (ml)",
                    val: colStats.totalVol.toLocaleString(),
                    color: "text-info-foreground",
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className={`text-sm font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Request stats */}
            <SectionCard title="📌 Request Statistics">
              <div className="space-y-3">
                {[
                  {
                    label: "Total Requests",
                    val: reqStats.total,
                    color: "text-foreground",
                  },
                  {
                    label: "Pending",
                    val: reqStats.pending,
                    color: "text-warning-foreground",
                  },
                  {
                    label: "Approved",
                    val: reqStats.approved,
                    color: "text-info-foreground",
                  },
                  {
                    label: "Fulfilled",
                    val: reqStats.fulfilled,
                    color: "text-success-foreground",
                  },
                  {
                    label: "Rejected",
                    val: reqStats.rejected,
                    color: "text-destructive",
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className={`text-sm font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Footer */}
          <Separator />
          <p className="text-xs text-muted-foreground text-center pb-2">
            Report generated on {new Date().toLocaleString()} &mdash; LifeLine
            Blood Bank Management System
          </p>
        </div>
      )}
    </AppLayout>
  );
}

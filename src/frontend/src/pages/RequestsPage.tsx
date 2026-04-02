import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  GitPullRequest,
  Loader2,
  Plus,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type BloodRequest } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  useCreateRequest,
  usePatients,
  useRequests,
  useUpdateRequest,
} from "../hooks/useQueries";
import { getStoredRole } from "../utils/auth";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { formatDate, nowNs } from "../utils/time";

const REQUEST_STATUSES = ["pending", "approved", "fulfilled", "rejected"];

const EMPTY_REQUEST: BloodRequest = {
  patientId: BigInt(0),
  bloodGroup: BloodGroup.aPos,
  unitsNeeded: BigInt(1),
  status: "pending",
  requestedTimestamp: nowNs(),
  notes: "",
  handledBy: "",
};

export function RequestsPage() {
  const { data: requestRows = [], isLoading } = useRequests();
  const { data: patientRows = [] } = usePatients();
  const createRequest = useCreateRequest();
  const updateRequest = useUpdateRequest();

  const [statusFilter, setStatusFilter] = useState("all");
  const [bgFilter, setBgFilter] = useState<BloodGroup | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<BloodRequest>({ ...EMPTY_REQUEST });

  const patientMap = new Map<string, string>();
  for (const [id, p] of patientRows) patientMap.set(String(id), p.name);

  const filtered = requestRows.filter(([, r]) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchBg = bgFilter === "all" || r.bloodGroup === bgFilter;
    return matchStatus && matchBg;
  });

  const set = (k: keyof BloodRequest, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    try {
      await createRequest.mutateAsync({ ...form, requestedTimestamp: nowNs() });
      toast.success("Blood request submitted.");
      setAddOpen(false);
      setForm({ ...EMPTY_REQUEST });
    } catch {
      toast.error("Failed to submit request.");
    }
  };

  const handleStatusChange = async (
    id: bigint,
    request: BloodRequest,
    newStatus: string,
  ) => {
    try {
      await updateRequest.mutateAsync({
        id,
        request: {
          ...request,
          status: newStatus,
          handledBy: getStoredRole() ?? "",
        },
      });
      toast.success(`Request marked as ${newStatus}.`);
    } catch {
      toast.error("Failed to update request.");
    }
  };

  const pendingCount = requestRows.filter(
    ([, r]) => r.status === "pending",
  ).length;

  return (
    <AppLayout pageTitle="Blood Requests">
      <PageHeader
        title="Blood Requests"
        subtitle={`${pendingCount} pending request${pendingCount !== 1 ? "s" : ""}`}
        actions={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            data-ocid="request.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Request
          </Button>
        }
      />
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-40"
              data-ocid="request.filter.status.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {REQUEST_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={bgFilter}
            onValueChange={(v) => setBgFilter(v as BloodGroup | "all")}
          >
            <SelectTrigger
              className="w-40"
              data-ocid="request.filter.bg.select"
            >
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {BG_DISPLAY[bg]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <p className="text-sm text-muted-foreground flex items-center">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<GitPullRequest className="w-8 h-8" />}
              title="No blood requests"
              message="Submit a blood request to get started."
              action={
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="request.empty.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Request
                </Button>
              }
            />
          ) : (
            <Table data-ocid="request.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Handled By
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(([id, r]) => (
                  <TableRow
                    key={String(id)}
                    className={
                      r.status === "pending"
                        ? "bg-warning/5 border-l-2 border-l-warning"
                        : ""
                    }
                    data-ocid={`request.item.${String(id)}`}
                  >
                    <TableCell className="font-medium">
                      {patientMap.get(String(r.patientId)) ??
                        `Patient #${Number(r.patientId)}`}
                    </TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={r.bloodGroup} />
                    </TableCell>
                    <TableCell>{Number(r.unitsNeeded)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(r.requestedTimestamp)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {r.handledBy || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">
                      {r.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {r.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-success-foreground hover:bg-success/10"
                              onClick={() =>
                                handleStatusChange(id, r, "approved")
                              }
                              data-ocid={`request.approve_button.${String(id)}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleStatusChange(id, r, "rejected")
                              }
                              data-ocid={`request.reject_button.${String(id)}`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {r.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-info-foreground hover:bg-info/10"
                            onClick={() =>
                              handleStatusChange(id, r, "fulfilled")
                            }
                            data-ocid={`request.fulfill_button.${String(id)}`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="request.add.dialog">
          <DialogHeader>
            <DialogTitle>New Blood Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <Select
                value={String(form.patientId)}
                onValueChange={(v) => set("patientId", BigInt(v))}
              >
                <SelectTrigger data-ocid="request.patient.select">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientRows.map(([id, p]) => (
                    <SelectItem key={String(id)} value={String(id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Select
                  value={form.bloodGroup}
                  onValueChange={(v) => set("bloodGroup", v as BloodGroup)}
                >
                  <SelectTrigger data-ocid="request.bloodgroup.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {BG_DISPLAY[bg]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Units Needed</Label>
                <Input
                  type="number"
                  min={1}
                  value={Number(form.unitsNeeded)}
                  onChange={(e) =>
                    set("unitsNeeded", BigInt(e.target.value || 1))
                  }
                  data-ocid="request.units.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes…"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                data-ocid="request.notes.textarea"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={createRequest.isPending}
              data-ocid="request.submit_button"
            >
              {createRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

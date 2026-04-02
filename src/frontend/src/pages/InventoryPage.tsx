import { Badge } from "@/components/ui/badge";
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
import { AlertTriangle, Loader2, Package, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type InventoryUnit } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  useCreateInventory,
  useInventory,
  useUpdateInventory,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY, getStockLevel } from "../utils/blood";
import { computeExpiry, daysUntil, formatDate, nowNs } from "../utils/time";

const INVENTORY_STATUSES = ["available", "reserved", "used", "expired"];

const EMPTY_UNIT: InventoryUnit = {
  bloodGroup: BloodGroup.aPos,
  units: BigInt(1),
  collectionId: BigInt(0),
  collectedTimestamp: nowNs(),
  expiryTimestamp: computeExpiry(nowNs()),
  status: "available",
};

function InventoryForm({
  value,
  onChange,
  onSubmit,
  loading,
  submitLabel,
}: {
  value: InventoryUnit;
  onChange: (k: keyof InventoryUnit, v: unknown) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Blood Group</Label>
          <Select
            value={value.bloodGroup}
            onValueChange={(v) => onChange("bloodGroup", v as BloodGroup)}
          >
            <SelectTrigger data-ocid="inventory.bloodgroup.select">
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
          <Label>Units</Label>
          <Input
            type="number"
            min={1}
            value={Number(value.units)}
            onChange={(e) => onChange("units", BigInt(e.target.value || 1))}
            data-ocid="inventory.units.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={value.status}
            onValueChange={(v) => onChange("status", v)}
          >
            <SelectTrigger data-ocid="inventory.status.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading}
        data-ocid="inventory.submit_button"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}

export function InventoryPage() {
  const { data: inventoryRows = [], isLoading } = useInventory();
  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory();

  const [bgFilter, setBgFilter] = useState<BloodGroup | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: bigint;
    unit: InventoryUnit;
  } | null>(null);
  const [form, setForm] = useState<InventoryUnit>({ ...EMPTY_UNIT });
  const [editForm, setEditForm] = useState<InventoryUnit>({ ...EMPTY_UNIT });

  const bgSummary = new Map<BloodGroup, number>();
  for (const [, u] of inventoryRows) {
    if (u.status === "available") {
      bgSummary.set(
        u.bloodGroup,
        (bgSummary.get(u.bloodGroup) ?? 0) + Number(u.units),
      );
    }
  }

  const filtered = inventoryRows.filter(([, u]) => {
    const matchBg = bgFilter === "all" || u.bloodGroup === bgFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchBg && matchStatus;
  });

  const set = (k: keyof InventoryUnit, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));
  const setEdit = (k: keyof InventoryUnit, v: unknown) =>
    setEditForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    try {
      await createInventory.mutateAsync(form);
      toast.success("Inventory unit added.");
      setAddOpen(false);
      setForm({ ...EMPTY_UNIT });
    } catch {
      toast.error("Failed to add inventory unit.");
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updateInventory.mutateAsync({ id: editTarget.id, unit: editForm });
      toast.success("Inventory unit updated.");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update inventory unit.");
    }
  };

  return (
    <AppLayout pageTitle="Inventory">
      <PageHeader
        title="Blood Inventory"
        subtitle="Track and manage available blood units"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setForm({ ...EMPTY_UNIT });
              setAddOpen(true);
            }}
            data-ocid="inventory.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Unit
          </Button>
        }
      />

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-5">
        {ALL_BLOOD_GROUPS.map((bg, idx) => {
          const units = bgSummary.get(bg) ?? 0;
          const level = getStockLevel(units);
          const levelColor =
            level === "critical"
              ? "text-destructive"
              : level === "low"
                ? "text-warning-foreground"
                : "text-success-foreground";
          return (
            <Card
              key={bg}
              className={`shadow-card cursor-pointer transition-all ${bgFilter === bg ? "ring-2 ring-primary" : ""}`}
              onClick={() => setBgFilter(bgFilter === bg ? "all" : bg)}
              data-ocid={`inventory.bloodgroup.item.${idx + 1}`}
            >
              <CardContent className="p-3 text-center">
                <BloodGroupBadge bloodGroup={bg} size="sm" />
                <p className="text-xl font-bold mt-1">{units}</p>
                <p
                  className={`text-[10px] font-semibold uppercase ${levelColor}`}
                >
                  {level === "critical"
                    ? "Critical"
                    : level === "low"
                      ? "Low"
                      : "OK"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Select
            value={bgFilter}
            onValueChange={(v) => setBgFilter(v as BloodGroup | "all")}
          >
            <SelectTrigger
              className="w-40"
              data-ocid="inventory.filter.bg.select"
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-40"
              data-ocid="inventory.filter.status.select"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {INVENTORY_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <p className="text-sm text-muted-foreground flex items-center">
            {filtered.length} unit{filtered.length !== 1 ? "s" : ""}
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
              icon={<Package className="w-8 h-8" />}
              title="No inventory units"
              message="Add blood units to build your inventory."
              action={
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="inventory.empty.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Unit
                </Button>
              }
            />
          ) : (
            <Table data-ocid="inventory.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Collected</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(([id, u]) => {
                  const days = daysUntil(u.expiryTimestamp);
                  const rowClass =
                    days < 0
                      ? "bg-destructive/5"
                      : days <= 7
                        ? "bg-warning/5"
                        : "";
                  return (
                    <TableRow
                      key={String(id)}
                      className={rowClass}
                      data-ocid={`inventory.item.${String(id)}`}
                    >
                      <TableCell>
                        <BloodGroupBadge bloodGroup={u.bloodGroup} />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {Number(u.units)}
                      </TableCell>
                      <TableCell>{formatDate(u.collectedTimestamp)}</TableCell>
                      <TableCell>{formatDate(u.expiryTimestamp)}</TableCell>
                      <TableCell>
                        {days < 0 ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Expired
                          </Badge>
                        ) : days <= 7 ? (
                          <Badge className="bg-warning/20 text-warning-foreground border-warning/30 text-xs">
                            {days}d
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {days}d
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => {
                            setEditTarget({ id, unit: u });
                            setEditForm({ ...u });
                          }}
                          data-ocid={`inventory.edit_button.${String(id)}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="inventory.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Inventory Unit</DialogTitle>
          </DialogHeader>
          <InventoryForm
            value={form}
            onChange={set}
            onSubmit={handleAdd}
            loading={createInventory.isPending}
            submitLabel="Add Unit"
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent data-ocid="inventory.edit.dialog">
          <DialogHeader>
            <DialogTitle>Update Inventory Unit</DialogTitle>
          </DialogHeader>
          <InventoryForm
            value={editForm}
            onChange={setEdit}
            onSubmit={handleEdit}
            loading={updateInventory.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

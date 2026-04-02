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
import { Droplets, Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Donation } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  useCollections,
  useCreateCollection,
  useDonors,
  useUpdateCollection,
} from "../hooks/useQueries";
import { formatDate, generateId, nowNs } from "../utils/time";

const TEST_STATUSES = ["pending", "passed", "failed"];
const STATUS_FILTER_OPTIONS = ["all", ...TEST_STATUSES];

const EMPTY_COLLECTION: Donation = {
  donorId: BigInt(0),
  collectionTimestamp: nowNs(),
  volumeMl: BigInt(450),
  testStatus: "pending",
  testedBy: "",
  notes: "",
};

export function CollectionsPage() {
  const { data: collections = [], isLoading } = useCollections();
  const { data: donors = [] } = useDonors();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();

  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: bigint;
    collection: Donation;
  } | null>(null);
  const [form, setForm] = useState<Donation>({ ...EMPTY_COLLECTION });
  const [editForm, setEditForm] = useState<Donation>({ ...EMPTY_COLLECTION });

  // Donor name map (index-based since backend uses bigint IDs we assigned)
  const donorMap = new Map<number, string>();
  donors.forEach((d, idx) => donorMap.set(idx, d.name));

  const filtered = collections.filter((c) =>
    statusFilter === "all" ? true : c.testStatus === statusFilter,
  );

  const updateField = <K extends keyof Donation>(
    prev: Donation,
    k: K,
    v: Donation[K],
  ): Donation => ({ ...prev, [k]: v });

  const handleAdd = async () => {
    try {
      await createCollection.mutateAsync({
        collection: form,
        id: generateId(),
      });
      toast.success("Collection record added.");
      setAddOpen(false);
      setForm({ ...EMPTY_COLLECTION });
    } catch {
      toast.error("Failed to add collection.");
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updateCollection.mutateAsync({
        id: editTarget.id,
        collection: editForm,
      });
      toast.success("Collection updated.");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update collection.");
    }
  };

  function CollectionForm({
    value,
    onChange,
    onSubmit,
    loading,
    submitLabel,
  }: {
    value: Donation;
    onChange: (d: Donation) => void;
    onSubmit: () => void;
    loading: boolean;
    submitLabel: string;
  }) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Donor</Label>
          <Select
            value={String(value.donorId)}
            onValueChange={(v) =>
              onChange(updateField(value, "donorId", BigInt(v)))
            }
          >
            <SelectTrigger data-ocid="collection.donor.select">
              <SelectValue placeholder="Select donor" />
            </SelectTrigger>
            <SelectContent>
              {donors.map((d, idx) => (
                <SelectItem key={d.name + String(idx)} value={String(idx)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Volume (ml)</Label>
            <Input
              type="number"
              min={200}
              max={550}
              value={Number(value.volumeMl)}
              onChange={(e) =>
                onChange(
                  updateField(value, "volumeMl", BigInt(e.target.value || 0)),
                )
              }
              data-ocid="collection.volume.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Test Status</Label>
            <Select
              value={value.testStatus}
              onValueChange={(v) =>
                onChange(updateField(value, "testStatus", v))
              }
            >
              <SelectTrigger data-ocid="collection.status.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEST_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Tested By</Label>
          <Input
            placeholder="Dr. Smith"
            value={value.testedBy}
            onChange={(e) =>
              onChange(updateField(value, "testedBy", e.target.value))
            }
            data-ocid="collection.testedby.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            placeholder="Optional notes…"
            rows={2}
            value={value.notes}
            onChange={(e) =>
              onChange(updateField(value, "notes", e.target.value))
            }
            data-ocid="collection.notes.textarea"
          />
        </div>
        <Button
          className="w-full"
          onClick={onSubmit}
          disabled={loading}
          data-ocid="collection.submit_button"
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

  return (
    <AppLayout pageTitle="Collections">
      <PageHeader
        title="Blood Collections"
        subtitle={`${collections.length} collection records`}
        actions={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            data-ocid="collection.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Collection
          </Button>
        }
      />

      {/* Filter */}
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-44"
              data-ocid="collection.filter.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All Statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground flex items-center">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </div>
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
              icon={<Droplets className="w-8 h-8" />}
              title="No collection records"
              message="Add a blood collection to get started."
              action={
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="collection.empty.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Collection
                </Button>
              }
            />
          ) : (
            <Table data-ocid="collection.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Volume (ml)</TableHead>
                  <TableHead>Test Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Tested By
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, idx) => (
                  <TableRow
                    key={String(c.donorId) + String(idx)}
                    data-ocid={`collection.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {donorMap.get(Number(c.donorId)) ??
                        `Donor #${Number(c.donorId)}`}
                    </TableCell>
                    <TableCell>{formatDate(c.collectionTimestamp)}</TableCell>
                    <TableCell>{Number(c.volumeMl)} ml</TableCell>
                    <TableCell>
                      <StatusBadge status={c.testStatus} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.testedBy || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">
                      {c.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => {
                          setEditTarget({ id: BigInt(idx), collection: c });
                          setEditForm({ ...c });
                        }}
                        data-ocid={`collection.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="collection.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Collection Record</DialogTitle>
          </DialogHeader>
          <CollectionForm
            value={form}
            onChange={setForm}
            onSubmit={handleAdd}
            loading={createCollection.isPending}
            submitLabel="Add Collection"
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent data-ocid="collection.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <CollectionForm
            value={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            loading={updateCollection.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

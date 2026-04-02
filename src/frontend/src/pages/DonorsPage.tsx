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
import { Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type Donor } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import {
  useCreateDonor,
  useDeleteDonor,
  useDonors,
  useUpdateDonor,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { formatDate, nowNs } from "../utils/time";

const EMPTY_DONOR: Donor = {
  name: "",
  age: BigInt(18),
  gender: "Male",
  bloodGroup: BloodGroup.aPos,
  phone: "",
  email: "",
  address: "",
  isActive: true,
  registrationTimestamp: BigInt(0),
  lastDonationTimestamp: BigInt(0),
};

function DonorForm({
  value,
  onChange,
  onSubmit,
  loading,
  submitLabel,
}: {
  value: Donor;
  onChange: (d: Donor) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const set = (k: keyof Donor, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Full Name</Label>
          <Input
            placeholder="Jane Doe"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            data-ocid="donor.name.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Age</Label>
          <Input
            type="number"
            min={18}
            max={65}
            value={Number(value.age)}
            onChange={(e) => set("age", BigInt(e.target.value || 18))}
            data-ocid="donor.age.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={value.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger data-ocid="donor.gender.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Blood Group</Label>
          <Select
            value={value.bloodGroup}
            onValueChange={(v) => set("bloodGroup", v as BloodGroup)}
          >
            <SelectTrigger data-ocid="donor.blood_group.select">
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
          <Label>Phone</Label>
          <Input
            placeholder="+1 555-0000"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            data-ocid="donor.phone.input"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="donor@email.com"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            data-ocid="donor.email.input"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Address</Label>
          <Input
            placeholder="123 Main St"
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            data-ocid="donor.address.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={value.isActive ? "active" : "inactive"}
            onValueChange={(v) => set("isActive", v === "active")}
          >
            <SelectTrigger data-ocid="donor.status.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading}
        data-ocid="donor.submit_button"
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

export function DonorsPage() {
  const { data: donorRows = [], isLoading } = useDonors();
  const createDonor = useCreateDonor();
  const updateDonor = useUpdateDonor();
  const deleteDonor = useDeleteDonor();

  const [search, setSearch] = useState("");
  const [bgFilter, setBgFilter] = useState<BloodGroup | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: bigint;
    donor: Donor;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [form, setForm] = useState<Donor>({ ...EMPTY_DONOR });
  const [editForm, setEditForm] = useState<Donor>({ ...EMPTY_DONOR });

  const filtered = donorRows.filter(([, d]) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchBg = bgFilter === "all" || d.bloodGroup === bgFilter;
    return matchSearch && matchBg;
  });

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (Number(form.age) < 18 || Number(form.age) > 65) {
      toast.error("Age must be 18–65.");
      return;
    }
    try {
      await createDonor.mutateAsync({
        ...form,
        registrationTimestamp: nowNs(),
        lastDonationTimestamp: BigInt(0),
      });
      toast.success("Donor added.");
      setAddOpen(false);
      setForm({ ...EMPTY_DONOR });
    } catch {
      toast.error("Failed to add donor.");
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updateDonor.mutateAsync({ id: editTarget.id, donor: editForm });
      toast.success("Donor updated.");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update donor.");
    }
  };

  const handleDelete = async () => {
    if (deleteTarget == null) return;
    try {
      await deleteDonor.mutateAsync(deleteTarget);
      toast.success("Donor removed.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete donor.");
    }
  };

  return (
    <AppLayout pageTitle="Donors">
      <PageHeader
        title="Donors"
        subtitle={`${donorRows.length} registered donors`}
        actions={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            data-ocid="donor.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Donor
          </Button>
        }
      />
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-9"
              placeholder="Search donors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="donor.search.input"
            />
          </div>
          <Select
            value={bgFilter}
            onValueChange={(v) => setBgFilter(v as BloodGroup | "all")}
          >
            <SelectTrigger className="w-36" data-ocid="donor.filter.bg.select">
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
          <p className="text-sm text-muted-foreground flex items-center">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
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
              icon={<Users className="w-8 h-8" />}
              title="No donors found"
              message="Add a donor to get started."
              action={
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="donor.empty.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Donor
                </Button>
              }
            />
          ) : (
            <Table data-ocid="donor.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="hidden sm:table-cell">Age</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Last Donated
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(([id, donor]) => (
                  <TableRow
                    key={String(id)}
                    data-ocid={`donor.item.${String(id)}`}
                  >
                    <TableCell className="font-medium">{donor.name}</TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={donor.bloodGroup} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {Number(donor.age)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {donor.phone}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(donor.lastDonationTimestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          donor.isActive
                            ? "bg-success/10 text-success-foreground border-success/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {donor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => {
                            setEditTarget({ id, donor });
                            setEditForm({ ...donor });
                          }}
                          data-ocid={`donor.edit_button.${String(id)}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(id)}
                          data-ocid={`donor.delete_button.${String(id)}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
        <DialogContent data-ocid="donor.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Donor</DialogTitle>
          </DialogHeader>
          <DonorForm
            value={form}
            onChange={setForm}
            onSubmit={handleAdd}
            loading={createDonor.isPending}
            submitLabel="Add Donor"
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent data-ocid="donor.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <DonorForm
              value={editForm}
              onChange={setEditForm}
              onSubmit={handleEdit}
              loading={updateDonor.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Donor"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteDonor.isPending}
      />
    </AppLayout>
  );
}

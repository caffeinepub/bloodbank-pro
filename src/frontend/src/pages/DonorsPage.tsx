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
  useProfile,
  useUpdateDonor,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { formatDate, generateId, nowNs } from "../utils/time";

const EMPTY_DONOR: Omit<
  Donor,
  "registrationTimestamp" | "lastDonationTimestamp"
> = {
  name: "",
  age: BigInt(0),
  gender: "Male",
  bloodGroup: BloodGroup.aPos,
  phone: "",
  email: "",
  address: "",
  isActive: true,
};

function DonorForm({
  value,
  onChange,
  onSubmit,
  loading,
  submitLabel,
}: {
  value: typeof EMPTY_DONOR;
  onChange: (d: typeof EMPTY_DONOR) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Full Name</Label>
          <Input
            placeholder="John Doe"
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
            placeholder="28"
            value={Number(value.age) || ""}
            onChange={(e) => set("age", BigInt(e.target.value || 0))}
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
            <SelectTrigger data-ocid="donor.bloodgroup.select">
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
            placeholder="+1 555-0100"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            data-ocid="donor.phone.input"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="john@example.com"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            data-ocid="donor.email.input"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Address</Label>
          <Input
            placeholder="123 Main St, City"
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            data-ocid="donor.address.input"
          />
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
  const { data: donors = [], isLoading } = useDonors();
  const { data: profile } = useProfile();
  const createDonor = useCreateDonor();
  const updateDonor = useUpdateDonor();
  const deleteDonor = useDeleteDonor();

  const isAdmin = profile?.role === "admin";

  const [search, setSearch] = useState("");
  const [bgFilter, setBgFilter] = useState<BloodGroup | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: bigint;
    donor: Donor;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const [form, setForm] = useState<typeof EMPTY_DONOR>({ ...EMPTY_DONOR });
  const [editForm, setEditForm] = useState<typeof EMPTY_DONOR>({
    ...EMPTY_DONOR,
  });

  const filtered = donors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.toLowerCase().includes(search.toLowerCase());
    const matchBg = bgFilter === "all" || d.bloodGroup === bgFilter;
    return matchSearch && matchBg;
  });

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      await createDonor.mutateAsync({
        donor: {
          ...form,
          registrationTimestamp: nowNs(),
          lastDonationTimestamp: BigInt(0),
        },
        id: generateId(),
      });
      toast.success("Donor added successfully.");
      setAddOpen(false);
      setForm({ ...EMPTY_DONOR });
    } catch {
      toast.error("Failed to add donor.");
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updateDonor.mutateAsync({
        id: editTarget.id,
        donor: {
          ...editForm,
          registrationTimestamp: editTarget.donor.registrationTimestamp,
          lastDonationTimestamp: editTarget.donor.lastDonationTimestamp,
        },
      });
      toast.success("Donor updated.");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update donor.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDonor.mutateAsync(deleteTarget);
      toast.success("Donor deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete donor.");
    }
  };

  return (
    <AppLayout pageTitle="Donors">
      <PageHeader
        title="Donors"
        subtitle={`${donors.length} registered donors`}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setForm({ ...EMPTY_DONOR });
              setAddOpen(true);
            }}
            data-ocid="donor.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Donor
          </Button>
        }
      />

      {/* Filters */}
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="donor.search_input"
            />
          </div>
          <Select value={bgFilter} onValueChange={(v) => setBgFilter(v as any)}>
            <SelectTrigger className="w-40" data-ocid="donor.bloodgroup.select">
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No donors found"
              message={
                search || bgFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Add your first donor to get started."
              }
              action={
                !search && bgFilter === "all" ? (
                  <Button
                    size="sm"
                    onClick={() => setAddOpen(true)}
                    data-ocid="donor.empty.add.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Donor
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table data-ocid="donor.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="hidden md:table-cell">Age</TableHead>
                  <TableHead className="hidden md:table-cell">Gender</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Last Donation
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((donor, idx) => (
                  <TableRow
                    key={donor.name + String(idx)}
                    data-ocid={`donor.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium">{donor.name}</TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={donor.bloodGroup} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {Number(donor.age)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {donor.gender}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {donor.phone}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {donor.lastDonationTimestamp
                        ? formatDate(donor.lastDonationTimestamp)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
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
                            setEditTarget({ id: BigInt(idx), donor });
                            setEditForm({
                              name: donor.name,
                              age: donor.age,
                              gender: donor.gender,
                              bloodGroup: donor.bloodGroup,
                              phone: donor.phone,
                              email: donor.email,
                              address: donor.address,
                              isActive: donor.isActive,
                            });
                          }}
                          data-ocid={`donor.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(BigInt(idx))}
                            data-ocid={`donor.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="donor.add.dialog">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
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

      {/* Edit modal */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent data-ocid="donor.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          <DonorForm
            value={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            loading={updateDonor.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Donor"
        description="Are you sure you want to delete this donor? This action cannot be undone."
        loading={deleteDonor.isPending}
      />
    </AppLayout>
  );
}

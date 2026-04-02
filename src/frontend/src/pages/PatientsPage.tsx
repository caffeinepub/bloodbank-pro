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
import { Loader2, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type Patient } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { BloodGroupBadge } from "../components/BloodGroupBadge";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  useCreatePatient,
  useDeletePatient,
  usePatients,
  useUpdatePatient,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";

const URGENCIES = ["low", "medium", "high", "critical"];

const EMPTY_PATIENT: Patient = {
  name: "",
  age: BigInt(0),
  gender: "Male",
  bloodGroup: BloodGroup.aPos,
  phone: "",
  hospital: "",
  urgency: "medium",
  isActive: true,
};

function PatientForm({
  value,
  onChange,
  onSubmit,
  loading,
  submitLabel,
}: {
  value: Patient;
  onChange: (p: Patient) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const set = (k: keyof Patient, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Full Name</Label>
          <Input
            placeholder="Jane Doe"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            data-ocid="patient.name.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Age</Label>
          <Input
            type="number"
            min={1}
            value={Number(value.age) || ""}
            onChange={(e) => set("age", BigInt(e.target.value || 0))}
            data-ocid="patient.age.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={value.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger data-ocid="patient.gender.select">
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
            <SelectTrigger data-ocid="patient.bloodgroup.select">
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
          <Label>Urgency</Label>
          <Select
            value={value.urgency}
            onValueChange={(v) => set("urgency", v)}
          >
            <SelectTrigger data-ocid="patient.urgency.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENCIES.map((u) => (
                <SelectItem key={u} value={u} className="capitalize">
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Hospital</Label>
          <Input
            placeholder="City General Hospital"
            value={value.hospital}
            onChange={(e) => set("hospital", e.target.value)}
            data-ocid="patient.hospital.input"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Phone</Label>
          <Input
            placeholder="+1 555-0200"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            data-ocid="patient.phone.input"
          />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={loading}
        data-ocid="patient.submit_button"
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

export function PatientsPage() {
  const { data: patientRows = [], isLoading } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [search, setSearch] = useState("");
  const [bgFilter, setBgFilter] = useState<BloodGroup | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: bigint;
    patient: Patient;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [form, setForm] = useState<Patient>({ ...EMPTY_PATIENT });
  const [editForm, setEditForm] = useState<Patient>({ ...EMPTY_PATIENT });

  const filtered = patientRows.filter(([, p]) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hospital.toLowerCase().includes(search.toLowerCase());
    const matchBg = bgFilter === "all" || p.bloodGroup === bgFilter;
    const matchUrgency = urgencyFilter === "all" || p.urgency === urgencyFilter;
    return matchSearch && matchBg && matchUrgency;
  });

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      await createPatient.mutateAsync(form);
      toast.success("Patient added.");
      setAddOpen(false);
      setForm({ ...EMPTY_PATIENT });
    } catch {
      toast.error("Failed to add patient.");
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updatePatient.mutateAsync({ id: editTarget.id, patient: editForm });
      toast.success("Patient updated.");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update patient.");
    }
  };

  const handleDelete = async () => {
    if (deleteTarget == null) return;
    try {
      await deletePatient.mutateAsync(deleteTarget);
      toast.success("Patient deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete patient.");
    }
  };

  return (
    <AppLayout pageTitle="Patients">
      <PageHeader
        title="Patients"
        subtitle={`${patientRows.length} registered patients`}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setForm({ ...EMPTY_PATIENT });
              setAddOpen(true);
            }}
            data-ocid="patient.add.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Patient
          </Button>
        }
      />
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Input
              placeholder="Search patients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="patient.search_input"
            />
          </div>
          <Select
            value={bgFilter}
            onValueChange={(v) => setBgFilter(v as BloodGroup | "all")}
          >
            <SelectTrigger
              className="w-36"
              data-ocid="patient.filter.bg.select"
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
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger
              className="w-36"
              data-ocid="patient.filter.urgency.select"
            >
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              {URGENCIES.map((u) => (
                <SelectItem key={u} value={u} className="capitalize">
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              icon={<UserCheck className="w-8 h-8" />}
              title="No patients found"
              message="Add a patient or adjust your filters."
              action={
                <Button
                  size="sm"
                  onClick={() => setAddOpen(true)}
                  data-ocid="patient.empty.add.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Patient
                </Button>
              }
            />
          ) : (
            <Table data-ocid="patient.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Age / Gender
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Hospital
                  </TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(([id, p]) => (
                  <TableRow
                    key={String(id)}
                    data-ocid={`patient.item.${String(id)}`}
                  >
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={p.bloodGroup} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {Number(p.age)} / {p.gender}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.hospital}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.urgency} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {p.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.isActive
                            ? "bg-success/10 text-success-foreground border-success/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => {
                            setEditTarget({ id, patient: p });
                            setEditForm({ ...p });
                          }}
                          data-ocid={`patient.edit_button.${String(id)}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(id)}
                          data-ocid={`patient.delete_button.${String(id)}`}
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
        <DialogContent data-ocid="patient.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            value={form}
            onChange={setForm}
            onSubmit={handleAdd}
            loading={createPatient.isPending}
            submitLabel="Add Patient"
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent data-ocid="patient.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <PatientForm
              value={editForm}
              onChange={setEditForm}
              onSubmit={handleEdit}
              loading={updatePatient.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Patient"
        description="Are you sure you want to delete this patient?"
        onConfirm={handleDelete}
        loading={deletePatient.isPending}
      />
    </AppLayout>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type BloodRequest, type Patient } from "../backend";
import { PortalLayout } from "../components/PortalLayout";
import {
  useCreatePatient,
  useCreateRequest,
  usePatients,
  useRequests,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { formatDate, nowNs } from "../utils/time";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  approved: "bg-info/20 text-info-foreground border-info/30",
  fulfilled: "bg-success/10 text-success-foreground border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function HospitalPortalPage() {
  const [hospitalName, setHospitalName] = useState("");
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    bloodGroup: BloodGroup.aPos,
    unitsNeeded: 1,
    urgency: "medium",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createPatient = useCreatePatient();
  const createRequest = useCreateRequest();
  const { data: allRequestRows = [] } = useRequests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.patientName.trim() || !hospitalName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const patient: Patient = {
        name: requestForm.patientName,
        age: BigInt(0),
        gender: "Unknown",
        bloodGroup: requestForm.bloodGroup,
        hospital: hospitalName,
        phone: "",
        urgency: requestForm.urgency,
        isActive: true,
      };
      const patientId = await createPatient.mutateAsync(patient);
      const request: BloodRequest = {
        patientId,
        bloodGroup: requestForm.bloodGroup,
        unitsNeeded: BigInt(requestForm.unitsNeeded),
        status: "pending",
        requestedTimestamp: nowNs(),
        notes: requestForm.notes,
        handledBy: "",
      };
      await createRequest.mutateAsync(request);
      setSubmitSuccess(true);
      toast.success("Blood request submitted successfully!");
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Hospital Portal">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[oklch(0.42_0.18_70)] to-[oklch(0.50_0.20_60)] p-6 text-white"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-8 h-8" />
              <h2 className="font-display text-2xl sm:text-3xl">
                Hospital Blood Request
              </h2>
            </div>
            <p className="text-white/80 max-w-xl">
              Submit emergency or scheduled blood requests for your patients.
              Our team will process them as quickly as possible.
            </p>
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <ClipboardList className="w-32 h-32" />
          </div>
        </motion.div>

        {submitSuccess ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl mb-1">
                  Request Submitted!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your blood request has been submitted and is pending review.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitSuccess(false);
                  setRequestForm({
                    patientName: "",
                    bloodGroup: BloodGroup.aPos,
                    unitsNeeded: 1,
                    urgency: "medium",
                    notes: "",
                  });
                }}
                data-ocid="hospital.new_request.button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Blood Request Form
              </CardTitle>
              <CardDescription>
                Fill in the details for the blood request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hospital-name">
                      Hospital Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hospital-name"
                      placeholder="City General Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      data-ocid="hospital.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="patient-name">
                      Patient Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patient-name"
                      placeholder="Patient full name"
                      value={requestForm.patientName}
                      onChange={(e) =>
                        setRequestForm((p) => ({
                          ...p,
                          patientName: e.target.value,
                        }))
                      }
                      data-ocid="hospital.patient_name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Blood Group Required</Label>
                    <Select
                      value={requestForm.bloodGroup}
                      onValueChange={(v) =>
                        setRequestForm((p) => ({
                          ...p,
                          bloodGroup: v as BloodGroup,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="hospital.blood_group.select">
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
                    <Label>Units Required</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={requestForm.unitsNeeded}
                      onChange={(e) =>
                        setRequestForm((p) => ({
                          ...p,
                          unitsNeeded: Number(e.target.value),
                        }))
                      }
                      data-ocid="hospital.units.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Urgency</Label>
                    <Select
                      value={requestForm.urgency}
                      onValueChange={(v) =>
                        setRequestForm((p) => ({ ...p, urgency: v }))
                      }
                    >
                      <SelectTrigger data-ocid="hospital.urgency.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low — Scheduled</SelectItem>
                        <SelectItem value="medium">
                          Medium — Non-emergency
                        </SelectItem>
                        <SelectItem value="high">High — Urgent</SelectItem>
                        <SelectItem value="critical">
                          Critical — Life-threatening
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any special requirements or medical notes…"
                      rows={3}
                      value={requestForm.notes}
                      onChange={(e) =>
                        setRequestForm((p) => ({ ...p, notes: e.target.value }))
                      }
                      data-ocid="hospital.notes.textarea"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={submitting}
                  data-ocid="hospital.submit.button"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4" />
                      Submit Blood Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {allRequestRows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Recent Requests
              </CardTitle>
              <CardDescription>
                Blood requests submitted through this portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allRequestRows.slice(0, 10).map(([id, req]) => (
                  <div
                    key={String(id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card"
                    data-ocid={`hospital.requests.item.${String(id)}`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {BG_DISPLAY[req.bloodGroup]} — {Number(req.unitsNeeded)}{" "}
                        unit{Number(req.unitsNeeded) !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(req.requestedTimestamp)}
                      </p>
                      {req.notes && (
                        <p className="text-xs text-muted-foreground">
                          {req.notes}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize shrink-0 ${STATUS_COLORS[req.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}

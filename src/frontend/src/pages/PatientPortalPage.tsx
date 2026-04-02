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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Loader2,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type BloodRequest, type Patient } from "../backend";
import { PortalLayout } from "../components/PortalLayout";
import {
  useCreatePatient,
  useCreateRequest,
  useRequests,
} from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { formatDate, nowNs } from "../utils/time";

const EMPTY_PATIENT: Patient = {
  name: "",
  age: BigInt(30),
  gender: "Male",
  bloodGroup: BloodGroup.aPos,
  phone: "",
  hospital: "",
  urgency: "medium",
  isActive: true,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/30",
  approved: "bg-info/20 text-info-foreground border-info/30",
  fulfilled: "bg-success/10 text-success-foreground border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function PatientPortalPage() {
  const [patientForm, setPatientForm] = useState<Patient>({ ...EMPTY_PATIENT });
  const [registeredPatientId, setRegisteredPatientId] = useState<bigint | null>(
    null,
  );
  const [requestForm, setRequestForm] = useState({
    bloodGroup: BloodGroup.aPos,
    unitsNeeded: 1,
    notes: "",
    manualPatientId: "",
  });
  const [activeTab, setActiveTab] = useState("register");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const createPatient = useCreatePatient();
  const createRequest = useCreateRequest();
  const { data: allRequestRows = [] } = useRequests();

  const setPatient = (k: keyof Patient, v: unknown) =>
    setPatientForm((prev) => ({ ...prev, [k]: v }));

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name.trim() || !patientForm.phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const newId = await createPatient.mutateAsync(patientForm);
      setRegisteredPatientId(newId);
      toast.success("Patient registered! You can now submit a blood request.");
      setActiveTab("request");
    } catch {
      toast.error("Failed to register patient. Please try again.");
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientId =
      registeredPatientId ??
      (requestForm.manualPatientId
        ? BigInt(requestForm.manualPatientId)
        : null);
    if (!patientId) {
      toast.error(
        "Please register as a patient first or enter your Patient ID.",
      );
      return;
    }
    try {
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
      setRequestSuccess(true);
      toast.success("Blood request submitted successfully!");
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  return (
    <PortalLayout title="Patient / Receiver Portal">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[oklch(0.42_0.18_250)] to-[oklch(0.50_0.20_230)] p-6 text-white"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-8 h-8 fill-white/20 stroke-white" />
              <h2 className="font-display text-2xl sm:text-3xl">
                We are Here to Help You
              </h2>
            </div>
            <p className="text-white/80 max-w-xl">
              Register as a patient and submit a blood request. Our team will
              review and process your request quickly.
            </p>
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <ClipboardList className="w-32 h-32" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="register" data-ocid="patient.register.tab">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Register
              </TabsTrigger>
              <TabsTrigger value="request" data-ocid="patient.request.tab">
                <Droplets className="w-4 h-4 mr-1.5" />
                Request Blood
              </TabsTrigger>
              <TabsTrigger value="status" data-ocid="patient.status.tab">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                My Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Patient Registration
                  </CardTitle>
                  <CardDescription>
                    Register your details to get access to blood services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registeredPatientId ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl mb-1">
                          {patientForm.name} — Registered!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Patient ID:{" "}
                          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {String(registeredPatientId)}
                          </code>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("request")}
                        className="gap-2"
                        data-ocid="patient.go_to_request.button"
                      >
                        <Droplets className="w-4 h-4" />
                        Submit Blood Request
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePatientSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="patient-name">
                            Full Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="patient-name"
                            placeholder="Jane Doe"
                            value={patientForm.name}
                            onChange={(e) => setPatient("name", e.target.value)}
                            data-ocid="patient.name.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="patient-age">Age</Label>
                          <Input
                            id="patient-age"
                            type="number"
                            min={1}
                            max={120}
                            placeholder="35"
                            value={Number(patientForm.age)}
                            onChange={(e) =>
                              setPatient("age", BigInt(e.target.value || 1))
                            }
                            data-ocid="patient.age.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Gender</Label>
                          <Select
                            value={patientForm.gender}
                            onValueChange={(v) => setPatient("gender", v)}
                          >
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
                            value={patientForm.bloodGroup}
                            onValueChange={(v) =>
                              setPatient("bloodGroup", v as BloodGroup)
                            }
                          >
                            <SelectTrigger data-ocid="patient.blood_group.select">
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
                          <Label htmlFor="patient-phone">
                            Phone <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="patient-phone"
                            type="tel"
                            placeholder="+1 555 000 0000"
                            value={patientForm.phone}
                            onChange={(e) =>
                              setPatient("phone", e.target.value)
                            }
                            data-ocid="patient.phone.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="patient-hospital">Hospital</Label>
                          <Input
                            id="patient-hospital"
                            placeholder="City General Hospital"
                            value={patientForm.hospital}
                            onChange={(e) =>
                              setPatient("hospital", e.target.value)
                            }
                            data-ocid="patient.hospital.input"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label>Urgency Level</Label>
                          <Select
                            value={patientForm.urgency}
                            onValueChange={(v) => setPatient("urgency", v)}
                          >
                            <SelectTrigger data-ocid="patient.urgency.select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                Low — Scheduled procedure
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium — Non-emergency need
                              </SelectItem>
                              <SelectItem value="high">
                                High — Urgent requirement
                              </SelectItem>
                              <SelectItem value="critical">
                                Critical — Life-threatening
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        size="lg"
                        disabled={createPatient.isPending}
                        data-ocid="patient.register.submit_button"
                      >
                        {createPatient.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Registering…
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Register as Patient
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="request">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Submit Blood Request
                  </CardTitle>
                  <CardDescription>
                    Specify the blood type and quantity needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {requestSuccess ? (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl mb-1">
                          Request Submitted!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your blood request is now pending review.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRequestSuccess(false);
                          setActiveTab("status");
                        }}
                        data-ocid="patient.view_requests.button"
                      >
                        View My Requests
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      {!registeredPatientId && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                          <AlertCircle className="w-4 h-4 text-warning-foreground mt-0.5 shrink-0" />
                          <p className="text-sm text-warning-foreground">
                            Register as a patient first, or enter your existing
                            Patient ID below.
                          </p>
                        </div>
                      )}
                      {registeredPatientId ? (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                          <p className="text-sm text-success-foreground">
                            Linked to patient:{" "}
                            <span className="font-semibold">
                              {patientForm.name}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label htmlFor="manual-patient-id">Patient ID</Label>
                          <Input
                            id="manual-patient-id"
                            placeholder="Enter your patient ID"
                            value={requestForm.manualPatientId}
                            onChange={(e) =>
                              setRequestForm((p) => ({
                                ...p,
                                manualPatientId: e.target.value,
                              }))
                            }
                            data-ocid="patient.patient_id.input"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Blood Group Needed</Label>
                          <Select
                            value={requestForm.bloodGroup}
                            onValueChange={(v) =>
                              setRequestForm((p) => ({
                                ...p,
                                bloodGroup: v as BloodGroup,
                              }))
                            }
                          >
                            <SelectTrigger data-ocid="patient.request_blood_group.select">
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
                          <Label htmlFor="units-needed">Units Needed</Label>
                          <Input
                            id="units-needed"
                            type="number"
                            min={1}
                            max={20}
                            value={requestForm.unitsNeeded}
                            onChange={(e) =>
                              setRequestForm((p) => ({
                                ...p,
                                unitsNeeded: Number(e.target.value),
                              }))
                            }
                            data-ocid="patient.units_needed.input"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="request-notes">Notes</Label>
                          <Textarea
                            id="request-notes"
                            placeholder="Any relevant medical information…"
                            rows={3}
                            value={requestForm.notes}
                            onChange={(e) =>
                              setRequestForm((p) => ({
                                ...p,
                                notes: e.target.value,
                              }))
                            }
                            data-ocid="patient.request_notes.textarea"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        size="lg"
                        disabled={createRequest.isPending}
                        data-ocid="patient.request.submit_button"
                      >
                        {createRequest.isPending ? (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    My Blood Requests
                  </CardTitle>
                  <CardDescription>
                    Track the status of your submitted blood requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allRequestRows.length === 0 ? (
                    <div
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="patient.requests.empty_state"
                    >
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No requests submitted yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allRequestRows.map(([id, req]) => (
                        <div
                          key={String(id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card"
                          data-ocid={`patient.requests.item.${String(id)}`}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {BG_DISPLAY[req.bloodGroup]} —{" "}
                              {Number(req.unitsNeeded)} unit
                              {Number(req.unitsNeeded) !== 1 ? "s" : ""}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PortalLayout>
  );
}

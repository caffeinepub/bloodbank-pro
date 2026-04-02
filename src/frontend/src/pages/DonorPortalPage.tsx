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
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Heart,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BloodGroup, type Donor } from "../backend";
import { PortalLayout } from "../components/PortalLayout";
import { useCreateDonor } from "../hooks/useQueries";
import { ALL_BLOOD_GROUPS, BG_DISPLAY } from "../utils/blood";
import { nowNs } from "../utils/time";

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

const BLOOD_COMPAT: {
  group: string;
  canDonateTo: string;
  canReceiveFrom: string;
}[] = [
  { group: "O-", canDonateTo: "Everyone", canReceiveFrom: "O-" },
  { group: "O+", canDonateTo: "O+, A+, B+, AB+", canReceiveFrom: "O+, O-" },
  { group: "A-", canDonateTo: "A-, A+, AB-, AB+", canReceiveFrom: "A-, O-" },
  { group: "A+", canDonateTo: "A+, AB+", canReceiveFrom: "A+, A-, O+, O-" },
  { group: "B-", canDonateTo: "B-, B+, AB-, AB+", canReceiveFrom: "B-, O-" },
  { group: "B+", canDonateTo: "B+, AB+", canReceiveFrom: "B+, B-, O+, O-" },
  { group: "AB-", canDonateTo: "AB-, AB+", canReceiveFrom: "AB-, A-, B-, O-" },
  { group: "AB+", canDonateTo: "AB+", canReceiveFrom: "Everyone" },
];

export function DonorPortalPage() {
  const [form, setForm] = useState<Donor>({ ...EMPTY_DONOR });
  const [success, setSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [showEligibility, setShowEligibility] = useState(false);
  const [showCompat, setShowCompat] = useState(false);
  const createDonor = useCreateDonor();

  const set = (k: keyof Donor, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (Number(form.age) < 18 || Number(form.age) > 65) {
      toast.error("Donor must be between 18 and 65 years old.");
      return;
    }
    try {
      const donorData: Donor = {
        ...form,
        registrationTimestamp: nowNs(),
        lastDonationTimestamp: BigInt(0),
      };
      await createDonor.mutateAsync(donorData);
      setRegisteredName(form.name);
      setSuccess(true);
      toast.success("Donation registered successfully! Thank you.");
    } catch {
      toast.error("Failed to register. Please try again.");
    }
  };

  return (
    <PortalLayout title="Blood Donor Portal">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[oklch(0.45_0.22_22)] to-[oklch(0.55_0.20_10)] p-6 text-white"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-8 h-8 fill-white/20 stroke-white" />
              <h2 className="font-display text-2xl sm:text-3xl">
                Save a Life Today
              </h2>
            </div>
            <p className="text-white/80 max-w-xl">
              One blood donation can save up to 3 lives. Register below and our
              team will contact you for the donation appointment.
            </p>
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <Droplets className="w-32 h-32" />
          </div>
        </motion.div>

        {success ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl mb-2">
                  Thank you, {registeredName}!
                </h3>
                <p className="text-muted-foreground">
                  Your donation registration has been recorded. Our team will
                  contact you shortly.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setForm({ ...EMPTY_DONOR });
                }}
                data-ocid="donor.portal.register_again.button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Register Another Donor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Donor Registration
              </CardTitle>
              <CardDescription>
                Fill in your details to register as a blood donor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="donor-name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      data-ocid="donor.portal.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-age">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="donor-age"
                      type="number"
                      min={18}
                      max={65}
                      placeholder="25"
                      value={Number(form.age)}
                      onChange={(e) => set("age", BigInt(e.target.value || 18))}
                      data-ocid="donor.portal.age.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) => set("gender", v)}
                    >
                      <SelectTrigger data-ocid="donor.portal.gender.select">
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
                      value={form.bloodGroup}
                      onValueChange={(v) => set("bloodGroup", v as BloodGroup)}
                    >
                      <SelectTrigger data-ocid="donor.portal.blood_group.select">
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
                    <Label htmlFor="donor-phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="donor-phone"
                      type="tel"
                      placeholder="+1 555-0000"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      data-ocid="donor.portal.phone.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="donor-email">Email</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      placeholder="donor@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      data-ocid="donor.portal.email.input"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="donor-address">Address</Label>
                    <Input
                      id="donor-address"
                      placeholder="123 Main St, City"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      data-ocid="donor.portal.address.input"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={createDonor.isPending}
                  data-ocid="donor.portal.submit_button"
                >
                  {createDonor.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering…
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Register as Donor
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader
            className="pb-2 cursor-pointer"
            onClick={() => setShowEligibility(!showEligibility)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Eligibility Criteria
              </CardTitle>
              {showEligibility ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {showEligibility && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Age between 18–65 years",
                      "Weight ≥50 kg",
                      "Hemoglobin ≥12.5 g/dL",
                      "No recent illness or infection",
                      "No blood-thinning medications",
                      "Not donated in the last 56 days",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-foreground shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card>
          <CardHeader
            className="pb-2 cursor-pointer"
            onClick={() => setShowCompat(!showCompat)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                Blood Compatibility Chart
              </CardTitle>
              {showCompat ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {showCompat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="pt-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground">
                          Group
                        </th>
                        <th className="text-left py-2 text-muted-foreground">
                          Can Donate To
                        </th>
                        <th className="text-left py-2 text-muted-foreground">
                          Can Receive From
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {BLOOD_COMPAT.map((r) => (
                        <tr
                          key={r.group}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2">
                            <Badge variant="outline" className="font-mono">
                              {r.group}
                            </Badge>
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {r.canDonateTo}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {r.canReceiveFrom}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </PortalLayout>
  );
}

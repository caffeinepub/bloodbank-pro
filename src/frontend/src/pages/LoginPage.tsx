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
import { Droplets, HeartPulse, Package, Shield, Users } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

interface Props {
  onComplete: () => void;
}

export function SetupProfile({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), role });
      toast.success("Profile saved! Welcome.");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-card-hover border-border">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-display text-xl">
            Complete Your Profile
          </CardTitle>
          <CardDescription>Set up your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="setup-name">Full Name</Label>
              <Input
                id="setup-name"
                placeholder="Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="setup.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setup-role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="setup-role" data-ocid="setup.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={saveProfile.isPending}
              data-ocid="setup.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Profile & Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const FEATURES = [
    { icon: Users, label: "Donor Management" },
    { icon: Package, label: "Inventory Tracking" },
    { icon: HeartPulse, label: "Patient Allocation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar to-[oklch(0.14_0.025_10)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 xl:w-3/5 relative overflow-hidden p-10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                LifeLine
              </p>
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Blood Bank System
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-display text-4xl xl:text-5xl text-white leading-tight mb-4">
              Saving Lives,
              <br />
              <span className="text-primary/90">One Drop</span> at a Time
            </h1>
            <p className="text-white/60 text-base max-w-md leading-relaxed">
              Comprehensive blood bank management &#8212; from donor
              registration to patient allocation, all in one secure platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <Icon className="w-5 h-5 text-primary/80 mb-2" />
                <p className="text-white/70 text-xs font-medium">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 -right-20 w-80 h-80 rounded-full border-2 border-primary" />
          <div className="absolute bottom-20 -left-10 w-60 h-60 rounded-full border border-primary" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/30" />
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <p className="text-white font-bold text-lg leading-tight">
            LifeLine Blood Bank
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-card-hover">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-display text-xl">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Sign in to access the Blood Bank System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure, decentralised authentication via Internet Identity. No
                passwords required.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-8 text-white/30 text-xs">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="hover:text-white/60 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

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
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Copy,
  Droplets,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  RefreshCw,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type AuthRole,
  clearAuth,
  generatePassword,
  getPasswordForRole,
  getStoredRole,
  getUsernameForRole,
  resetPassword,
  storeAuth,
  validateCredentials,
} from "../utils/auth";

// ── Role selection data ─────────────────────────────────────────────────────────────────────
type RoleOption = {
  role: AuthRole;
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "admin",
    icon: Shield,
    title: "Administrator",
    desc: "Full system access — manage donors, inventory, reports",
    color: "oklch(0.58 0.2 22)",
    bg: "oklch(0.58 0.2 22 / 0.08)",
    border: "oklch(0.58 0.2 22 / 0.3)",
  },
  {
    role: "staff",
    icon: Users,
    title: "Staff Member",
    desc: "Day-to-day operations — collections, requests, patients",
    color: "oklch(0.52 0.18 240)",
    bg: "oklch(0.52 0.18 240 / 0.08)",
    border: "oklch(0.52 0.18 240 / 0.3)",
  },
  {
    role: "donor",
    icon: Heart,
    title: "Blood Donor",
    desc: "Register to donate blood and save lives",
    color: "oklch(0.55 0.2 10)",
    bg: "oklch(0.55 0.2 10 / 0.08)",
    border: "oklch(0.55 0.2 10 / 0.3)",
  },
  {
    role: "patient",
    icon: Stethoscope,
    title: "Patient / Receiver",
    desc: "Request blood for yourself or a family member",
    color: "oklch(0.56 0.16 145)",
    bg: "oklch(0.56 0.16 145 / 0.08)",
    border: "oklch(0.56 0.16 145 / 0.3)",
  },
  {
    role: "hospital",
    icon: Building2,
    title: "Hospital",
    desc: "Coordinate blood supply for your facility",
    color: "oklch(0.62 0.17 70)",
    bg: "oklch(0.62 0.17 70 / 0.08)",
    border: "oklch(0.62 0.17 70 / 0.3)",
  },
];

// ── ForgotPassword ──────────────────────────────────────────────────────────────────────
function ForgotPasswordPanel({
  role,
  onBack,
}: { role: AuthRole; onBack: () => void }) {
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleGenerate = () => {
    const newPass = resetPassword(role);
    setGenerated(newPass);
    setConfirmed(false);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirm = () => {
    setConfirmed(true);
    toast.success(
      "Password updated! You can now log in with the new password.",
    );
    setTimeout(onBack, 1500);
  };

  const opt = ROLE_OPTIONS.find((r) => r.role === role);
  const username = getUsernameForRole(role);

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md"
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
        style={{ color: "#A7B0BF" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      <div
        className="rounded-2xl border p-8"
        style={{ background: "#141B24", borderColor: "#222B38" }}
      >
        {/* Role header */}
        {opt && (
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: opt.bg, border: `1px solid ${opt.border}` }}
            >
              <opt.icon className="w-6 h-6" style={{ color: opt.color }} />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "#E9EEF6" }}>
                Reset Password
              </p>
              <p className="text-xs" style={{ color: "#A7B0BF" }}>
                {opt.title} • username:{" "}
                <code
                  className="px-1.5 py-0.5 rounded font-mono"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#E9EEF6",
                  }}
                >
                  {username}
                </code>
              </p>
            </div>
          </div>
        )}

        <p className="text-sm mb-6" style={{ color: "#A7B0BF" }}>
          Click the button below to generate a new secure password for this
          account. Save it somewhere safe before confirming.
        </p>

        {/* Generate button */}
        <Button
          type="button"
          onClick={handleGenerate}
          className="w-full h-11 mb-4 font-semibold"
          variant="outline"
          style={{
            borderColor: "#374151",
            color: "#E9EEF6",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {generated ? "Regenerate Password" : "Generate New Password"}
        </Button>

        {/* Generated password display */}
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Label style={{ color: "#A7B0BF" }} className="mb-1.5 block">
              New Password
            </Label>
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center px-3 h-11 rounded-lg border font-mono text-sm tracking-widest"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: opt ? opt.border : "#374151",
                  color: "#E9EEF6",
                }}
              >
                {generated}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={handleCopy}
                style={{
                  borderColor: "#374151",
                  background: "rgba(255,255,255,0.04)",
                  color: copied ? "#4ade80" : "#A7B0BF",
                }}
                title="Copy password"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Confirm button */}
        {generated && !confirmed && (
          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full h-11 font-semibold"
            style={{ background: "oklch(0.45 0.22 22)", color: "white" }}
          >
            Confirm & Set Password
          </Button>
        )}

        {confirmed && (
          <div
            className="flex items-center gap-2 justify-center py-2 text-sm font-medium"
            style={{ color: "#4ade80" }}
          >
            <Check className="w-4 h-4" />
            Password updated! Redirecting to login…
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── LoginPage ───────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "credentials" | "forgot">(
    "select",
  );
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (role: AuthRole) => {
    setSelectedRole(role);
    setUsername("");
    setPassword("");
    setShowPass(false);
    setStep("credentials");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedRole(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!username.trim() || !password) {
      toast.error("Please enter your username and password.");
      return;
    }

    const valid = validateCredentials(selectedRole, username, password);
    if (!valid) {
      toast.error(
        "Invalid credentials. Please check your username and password.",
      );
      return;
    }

    setIsSubmitting(true);

    // Store auth and set portal role for non-staff/admin
    storeAuth(selectedRole);
    if (
      selectedRole === "donor" ||
      selectedRole === "patient" ||
      selectedRole === "hospital"
    ) {
      localStorage.setItem("portalRole", selectedRole);
    } else {
      localStorage.removeItem("portalRole");
    }

    toast.success(`Welcome! Logged in as ${selectedRole}.`);

    // Instant redirect - no IC call needed
    setTimeout(() => {
      navigate({
        to:
          selectedRole === "admin" || selectedRole === "staff"
            ? "/dashboard"
            : "/app",
      });
      // Force page reload to trigger AuthGate re-check
      window.location.href =
        selectedRole === "admin" || selectedRole === "staff"
          ? "/dashboard"
          : "/app";
    }, 300);
  };

  const currentPassword = selectedRole ? getPasswordForRole(selectedRole) : "";
  const hint = selectedRole
    ? { username: getUsernameForRole(selectedRole), password: currentPassword }
    : null;
  const selectedOption = ROLE_OPTIONS.find((r) => r.role === selectedRole);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0B0F14 0%, #121824 100%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 pt-6 pb-2 max-w-6xl mx-auto w-full">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          data-ocid="login.logo.button"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.45 0.22 22)" }}
          >
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base" style={{ color: "#E9EEF6" }}>
            BloodBank Pro
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
          style={{ color: "#A7B0BF" }}
          data-ocid="login.back_to_home.button"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-10">
                <h1
                  className="font-display text-3xl sm:text-4xl font-bold mb-3"
                  style={{ color: "#E9EEF6" }}
                >
                  Who are you?
                </h1>
                <p className="text-sm" style={{ color: "#A7B0BF" }}>
                  Select your role to access the right portal
                </p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="login.role_selection.section"
              >
                {ROLE_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.role}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleSelectRole(opt.role)}
                    className="group flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                    style={{ background: "#141B24", borderColor: "#222B38" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        opt.border;
                      (e.currentTarget as HTMLButtonElement).style.background =
                        opt.bg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#222B38";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#141B24";
                    }}
                    data-ocid={`login.${opt.role}.card`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        background: opt.bg,
                        border: `1px solid ${opt.border}`,
                      }}
                    >
                      <opt.icon
                        className="w-5 h-5"
                        style={{ color: opt.color }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: "#E9EEF6" }}
                      >
                        {opt.title}
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "#A7B0BF" }}
                      >
                        {opt.desc}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs font-medium mt-auto"
                      style={{ color: opt.color }}
                    >
                      Continue
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "credentials" && selectedRole && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md"
            >
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
                style={{ color: "#A7B0BF" }}
                data-ocid="login.back.button"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </button>

              <div
                className="rounded-2xl border p-8"
                style={{ background: "#141B24", borderColor: "#222B38" }}
              >
                {/* Role badge */}
                {selectedOption && (
                  <div className="flex items-center gap-3 mb-8">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: selectedOption.bg,
                        border: `1px solid ${selectedOption.border}`,
                      }}
                    >
                      <selectedOption.icon
                        className="w-6 h-6"
                        style={{ color: selectedOption.color }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-bold text-base"
                        style={{ color: "#E9EEF6" }}
                      >
                        {selectedOption.title}
                      </p>
                      <p className="text-xs" style={{ color: "#A7B0BF" }}>
                        Enter your credentials below
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="login-username"
                      style={{ color: "#A7B0BF" }}
                    >
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      placeholder={hint?.username ?? "Enter username"}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="h-11"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "#222B38",
                        color: "#E9EEF6",
                      }}
                      data-ocid="login.username.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="login-password"
                        style={{ color: "#A7B0BF" }}
                      >
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setStep("forgot")}
                        className="text-xs transition-colors hover:text-white underline-offset-2 hover:underline"
                        style={{ color: selectedOption?.color ?? "#A7B0BF" }}
                        data-ocid="login.forgot_password.button"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPass ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="h-11 pr-10"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderColor: "#222B38",
                          color: "#E9EEF6",
                        }}
                        data-ocid="login.password.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                        style={{ color: "#A7B0BF" }}
                        data-ocid="login.toggle_password.button"
                      >
                        {showPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold mt-2"
                    disabled={isSubmitting}
                    style={{
                      background: "oklch(0.45 0.22 22)",
                      color: "white",
                    }}
                    data-ocid="login.submit_button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing in…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Demo hint */}
                {hint && (
                  <div
                    className="mt-6 p-4 rounded-xl border"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#A7B0BF" }}
                    >
                      Demo Credentials
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: "rgba(167,176,191,0.6)" }}>
                          Username:{" "}
                        </span>
                        <code
                          className="px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "#E9EEF6",
                          }}
                        >
                          {hint.username}
                        </code>
                      </div>
                      <div>
                        <span style={{ color: "rgba(167,176,191,0.6)" }}>
                          Password:{" "}
                        </span>
                        <code
                          className="px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "#E9EEF6",
                          }}
                        >
                          {hint.password}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "forgot" && selectedRole && (
            <ForgotPasswordPanel
              key="forgot"
              role={selectedRole}
              onBack={() => setStep("credentials")}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 px-4">
        <p className="text-xs" style={{ color: "rgba(167,176,191,0.4)" }}>
          &copy; {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

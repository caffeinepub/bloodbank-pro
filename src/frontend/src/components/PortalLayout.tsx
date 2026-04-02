import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Droplets, LogOut } from "lucide-react";
import { clearAuth } from "../utils/auth";

interface PortalLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function PortalLayout({ children, title }: PortalLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0B0F14" }}
    >
      {/* Top Bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-sm border-b"
        style={{
          background: "rgba(14,20,30,0.9)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.45 0.22 22)" }}
            >
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-sm hidden sm:block"
              style={{ color: "#E9EEF6" }}
            >
              BloodBank Pro
            </span>
          </div>

          {/* Page title */}
          <h1
            className="font-display text-base sm:text-lg text-center flex-1"
            style={{ color: "#E9EEF6" }}
          >
            {title}
          </h1>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 hover:bg-white/5"
            style={{ color: "#A7B0BF" }}
            data-ocid="portal.logout.button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: "rgba(167,176,191,0.5)" }}
        >
          <span>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with love using caffeine.ai
            </a>
          </span>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="hover:text-white transition-colors font-medium"
          >
            Are you staff? → Admin Dashboard
          </button>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
  Database,
  Droplets,
  Heart,
  Menu,
  Shield,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({
  target,
  suffix = "",
}: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({
  label,
  title,
  subtitle,
}: { label: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border"
        style={{
          color: "oklch(0.58 0.2 22)",
          borderColor: "oklch(0.58 0.2 22 / 0.3)",
          background: "oklch(0.58 0.2 22 / 0.08)",
        }}
      >
        {label}
      </span>
      <h2
        className="font-display text-3xl md:text-4xl font-bold mb-4"
        style={{ color: "#E9EEF6" }}
      >
        {title}
      </h2>
      <p
        className="max-w-xl mx-auto text-sm md:text-base"
        style={{ color: "#A7B0BF" }}
      >
        {subtitle}
      </p>
    </motion.div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Donors", value: 1200, suffix: "+" },
  { label: "Blood Units Available", value: 850, suffix: "+" },
  { label: "Partner Hospitals", value: 45, suffix: "+" },
  { label: "Lives Saved", value: 3500, suffix: "+" },
];

const FEATURES = [
  {
    icon: Database,
    title: "Secure Data Management",
    desc: "All donor, patient, and hospital records stored securely on the Internet Computer blockchain — immutable and always available.",
  },
  {
    icon: Activity,
    title: "Real-time Inventory",
    desc: "Live blood inventory tracking with automatic alerts for low stock and expiry warnings to prevent critical shortages.",
  },
  {
    icon: Shield,
    title: "Multi-Role Access",
    desc: "Dedicated portals for donors, patients, hospitals, staff, and administrators with role-based permissions.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Comprehensive reports and analytics to monitor donation trends, request fulfillment rates, and inventory health.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Register Your Role",
    desc: "Sign in as a donor, patient, hospital, or staff member using secure credentials.",
  },
  {
    n: "02",
    title: "Submit Your Request",
    desc: "Donors register to give blood; patients submit blood requests; hospitals coordinate supply.",
  },
  {
    n: "03",
    title: "Staff Reviews",
    desc: "Blood bank staff reviews and approves requests, manages inventory, and tracks collections.",
  },
  {
    n: "04",
    title: "Lives Are Saved",
    desc: "Matched blood units are allocated and fulfilled, completing the life-saving cycle.",
  },
];

const PORTALS = [
  {
    icon: Heart,
    title: "Blood Donor",
    desc: "Register to donate blood and become a life-saver. Track your donation history and eligibility status.",
    cta: "Donate Now",
    color: "oklch(0.58 0.2 22)",
    bg: "oklch(0.58 0.2 22 / 0.08)",
    border: "oklch(0.58 0.2 22 / 0.25)",
  },
  {
    icon: Stethoscope,
    title: "Patient / Receiver",
    desc: "Submit blood requests for yourself or a family member. Track request status in real time.",
    cta: "Request Blood",
    color: "oklch(0.52 0.18 240)",
    bg: "oklch(0.52 0.18 240 / 0.08)",
    border: "oklch(0.52 0.18 240 / 0.25)",
  },
  {
    icon: Building2,
    title: "Hospital",
    desc: "Coordinate blood supply for your facility. Submit bulk requests and manage patient needs efficiently.",
    cta: "Request Supply",
    color: "oklch(0.56 0.16 145)",
    bg: "oklch(0.56 0.16 145 / 0.08)",
    border: "oklch(0.56 0.16 145 / 0.25)",
  },
];

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portals", href: "#portals" },
];

// ── Component ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToLogin = () => navigate({ to: "/login" });

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0B0F14 0%, #121824 100%)",
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(14,20,30,0.95)" : "rgba(14,20,30,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
        }}
        data-ocid="landing.nav.section"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo("#home")}
            className="flex items-center gap-2.5 shrink-0"
            data-ocid="landing.logo.button"
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => scrollTo(l.href)}
                className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "#A7B0BF" }}
                data-ocid={`landing.nav.${l.label.toLowerCase().replace(/ /g, "_")}.link`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm transition-colors hover:text-white"
              style={{ color: "#A7B0BF" }}
              data-ocid="landing.nav.login.link"
            >
              Login
            </Link>
            <Button
              size="sm"
              onClick={goToLogin}
              className="font-semibold"
              style={{ background: "oklch(0.45 0.22 22)", color: "white" }}
              data-ocid="landing.nav.get_started.button"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            data-ocid="landing.nav.menu.button"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => scrollTo(l.href)}
                    className="text-left px-3 py-2.5 text-sm rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: "#A7B0BF" }}
                  >
                    {l.label}
                  </button>
                ))}
                <div
                  className="border-t mt-1 pt-3 flex flex-col gap-2"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="text-sm px-3 py-2 text-left"
                    style={{ color: "#A7B0BF" }}
                  >
                    Login
                  </button>
                  <Button
                    size="sm"
                    onClick={goToLogin}
                    className="font-semibold"
                    style={{
                      background: "oklch(0.45 0.22 22)",
                      color: "white",
                    }}
                    data-ocid="landing.mobile.get_started.button"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative pt-32 pb-24 px-4 overflow-hidden"
        data-ocid="landing.hero.section"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.45 0.22 22), transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full opacity-5"
            style={{
              background:
                "radial-gradient(circle, oklch(0.52 0.18 240), transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8 border"
              style={{
                color: "oklch(0.58 0.2 22)",
                borderColor: "oklch(0.58 0.2 22 / 0.3)",
                background: "oklch(0.58 0.2 22 / 0.08)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "oklch(0.58 0.2 22)" }}
              />
              Powered by Internet Computer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ color: "#E9EEF6" }}
          >
            Every Drop Counts.{" "}
            <span style={{ color: "oklch(0.58 0.2 22)" }}>Every Second</span>{" "}
            Matters.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#A7B0BF" }}
          >
            A complete blood bank management system connecting donors, patients,
            and hospitals — built on decentralized technology for maximum
            transparency and reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button
              size="lg"
              onClick={goToLogin}
              className="gap-2 px-8 font-semibold text-base h-12"
              style={{ background: "oklch(0.45 0.22 22)", color: "white" }}
              data-ocid="landing.hero.get_started.button"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={() => scrollTo("#features")}
              className="text-sm flex items-center gap-2 transition-colors hover:text-white"
              style={{ color: "#A7B0BF" }}
              data-ocid="landing.hero.learn_more.button"
            >
              Learn More
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 max-w-3xl mx-auto"
            data-ocid="landing.stats.section"
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center py-5 px-4 ${i < 3 ? "md:border-r" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <span
                  className="font-display text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: "oklch(0.58 0.2 22)" }}
                >
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </span>
                <span
                  className="text-xs font-medium text-center"
                  style={{ color: "#A7B0BF" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-4"
        data-ocid="landing.features.section"
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Features"
            title="Key Features"
            subtitle="Everything you need to run a modern blood bank — from inventory to analytics, all in one platform."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#141B24", borderColor: "#222B38" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "oklch(0.45 0.22 22 / 0.12)" }}
                >
                  <f.icon
                    className="w-5 h-5"
                    style={{ color: "oklch(0.58 0.2 22)" }}
                  />
                </div>
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: "#E9EEF6" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#A7B0BF" }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-4"
        style={{ background: "rgba(255,255,255,0.02)" }}
        data-ocid="landing.how_it_works.section"
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Process"
            title="How It Works"
            subtitle="A streamlined, transparent process connecting every stakeholder in the blood donation ecosystem."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col gap-4"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-6 left-14 right-0 h-px hidden lg:block"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.45 0.22 22 / 0.4), transparent)",
                    }}
                  />
                )}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{
                      background: "oklch(0.45 0.22 22)",
                      color: "white",
                    }}
                  >
                    {step.n}
                  </div>
                </div>
                <div>
                  <h3
                    className="font-semibold text-sm mb-1.5"
                    style={{ color: "#E9EEF6" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#A7B0BF" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portals ─────────────────────────────────────────────────────── */}
      <section
        id="portals"
        className="py-24 px-4"
        data-ocid="landing.portals.section"
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Access"
            title="Our Portals"
            subtitle="Purpose-built experiences for each role in the blood donation process."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTALS.map((portal, i) => (
              <motion.div
                key={portal.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 border flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 group"
                style={{ background: "#141B24", borderColor: "#222B38" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: portal.bg,
                    border: `1px solid ${portal.border}`,
                  }}
                >
                  <portal.icon
                    className="w-7 h-7"
                    style={{ color: portal.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-base mb-2"
                    style={{ color: "#E9EEF6" }}
                  >
                    {portal.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#A7B0BF" }}
                  >
                    {portal.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goToLogin}
                  className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: portal.color }}
                  data-ocid={`landing.portal.${portal.title.toLowerCase().replace(/ \//, "_").replace(/ /g, "_")}.button`}
                >
                  {portal.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4" data-ocid="landing.cta.section">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-10 md:p-14 text-center border"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.22 22 / 0.15), oklch(0.52 0.18 240 / 0.08))",
              borderColor: "oklch(0.45 0.22 22 / 0.2)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "oklch(0.45 0.22 22)" }}
            >
              <Heart className="w-8 h-8 text-white fill-white/30" />
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "#E9EEF6" }}
            >
              Ready to Make a Difference?
            </h2>
            <p
              className="text-base mb-8 max-w-md mx-auto"
              style={{ color: "#A7B0BF" }}
            >
              Join thousands of donors, patients, and healthcare providers
              already using BloodBank Pro to save lives every day.
            </p>
            <Button
              size="lg"
              onClick={goToLogin}
              className="gap-2 px-10 font-semibold text-base h-12"
              style={{ background: "oklch(0.45 0.22 22)", color: "white" }}
              data-ocid="landing.cta.get_started.button"
            >
              Get Started Today
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-10 px-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.45 0.22 22)" }}
            >
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "#E9EEF6" }}>
              BloodBank Pro
            </span>
          </div>
          <div
            className="flex items-center gap-6 text-xs"
            style={{ color: "#A7B0BF" }}
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => scrollTo(l.href)}
                className="hover:text-white transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "rgba(167,176,191,0.5)" }}>
            &copy; {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

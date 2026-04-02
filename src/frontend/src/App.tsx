import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProfile } from "./hooks/useQueries";
import { CollectionsPage } from "./pages/CollectionsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DonorsPage } from "./pages/DonorsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage, SetupProfile } from "./pages/LoginPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RequestsPage } from "./pages/RequestsPage";

// ─── Auth gate wrapper ─────────────────────────────────────────────────────────
// Wraps all authenticated routes; handles seeding and setup
function AuthGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [seeded, setSeeded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Seed blood groups once on actor ready
  useEffect(() => {
    if (actor && !seeded) {
      setSeeded(true);
      actor.seedBloodGroups().catch(() => {
        /* ignore */
      });
    }
  }, [actor, seeded]);

  // After profile loads, check if setup needed
  useEffect(() => {
    if (!profileLoading && profile === null && identity) {
      setShowSetup(true);
    } else if (profile) {
      setShowSetup(false);
    }
  }, [profile, profileLoading, identity]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (showSetup && !profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-6">
        <SetupProfile onComplete={() => setShowSetup(false)} />
      </div>
    );
  }

  return <Outlet />;
}

// ─── Routes ──────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthGate,
});

const indexRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const donorsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/donors",
  component: DonorsPage,
});

const collectionsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/collections",
  component: CollectionsPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/inventory",
  component: InventoryPage,
});

const patientsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/patients",
  component: PatientsPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/requests",
  component: RequestsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/reports",
  component: ReportsPage,
});

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([
    indexRoute,
    dashboardRoute,
    donorsRoute,
    collectionsRoute,
    inventoryRoute,
    patientsRoute,
    requestsRoute,
    reportsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

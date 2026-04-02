import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useActor } from "./hooks/useActor";
import { CollectionsPage } from "./pages/CollectionsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DonorPortalPage } from "./pages/DonorPortalPage";
import { DonorsPage } from "./pages/DonorsPage";
import { HospitalPortalPage } from "./pages/HospitalPortalPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PatientPortalPage } from "./pages/PatientPortalPage";
import { PatientsPage } from "./pages/PatientsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { isLoggedIn } from "./utils/auth";

function AuthGate() {
  const { actor } = useActor();
  const seeded = useRef(false);

  useEffect(() => {
    if (actor && !seeded.current) {
      seeded.current = true;
      actor.seedBloodGroups().catch(() => {});
    }
  }, [actor]);

  if (!isLoggedIn()) {
    return <LoginPage />;
  }

  const portalRole = localStorage.getItem("portalRole");
  if (portalRole === "donor") return <DonorPortalPage />;
  if (portalRole === "patient") return <PatientPortalPage />;
  if (portalRole === "hospital") return <HospitalPortalPage />;

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthGate,
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

const appRedirectRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/app",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  authRoute.addChildren([
    appRedirectRoute,
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

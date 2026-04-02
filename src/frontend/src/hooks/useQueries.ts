import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BloodGroup,
  BloodRequest,
  Donation,
  Donor,
  InventoryUnit,
  Patient,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const QK = {
  dashboard: ["dashboard"],
  donors: ["donors"],
  collections: ["collections"],
  inventory: ["inventory"],
  patients: ["patients"],
  requests: ["requests"],
  profile: ["profile"],
  isAdmin: ["isAdmin"],
} as const;

function useEnabled() {
  const { actor, isFetching } = useActor();
  return { actor, enabled: !!actor && !isFetching };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.dashboard,
    queryFn: async () => actor!.getDashboardSummary(),
    enabled,
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function useProfile() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.profile,
    queryFn: async () => actor!.getCallerUserProfile(),
    enabled,
  });
}

export function useIsAdmin() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.isAdmin,
    queryFn: async () => actor!.isCallerAdmin(),
    enabled,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.profile }),
  });
}

// ─── Donors ───────────────────────────────────────────────────────────────────
export function useDonors() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.donors,
    queryFn: async () => actor!.getAllDonors(),
    enabled,
  });
}

export function useCreateDonor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ donor, id }: { donor: Donor; id: bigint }) =>
      actor!.createDonor(donor, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.donors });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useUpdateDonor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, donor }: { id: bigint; donor: Donor }) =>
      actor!.updateDonor(id, donor),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.donors }),
  });
}

export function useDeleteDonor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteDonor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.donors });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

// ─── Collections ──────────────────────────────────────────────────────────────
export function useCollections() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.collections,
    queryFn: async () => actor!.getAllCollections(),
    enabled,
  });
}

export function useCreateCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collection, id }: { collection: Donation; id: bigint }) =>
      actor!.createCollection(collection, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.collections }),
  });
}

export function useUpdateCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, collection }: { id: bigint; collection: Donation }) =>
      actor!.updateCollection(id, collection),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.collections }),
  });
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export function useInventory() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.inventory,
    queryFn: async () => actor!.getAllInventory(),
    enabled,
  });
}

export function useCreateInventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unit, id }: { unit: InventoryUnit; id: bigint }) =>
      actor!.createInventoryUnit(unit, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.inventory });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useUpdateInventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, unit }: { id: bigint; unit: InventoryUnit }) =>
      actor!.updateInventoryUnit(id, unit),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.inventory }),
  });
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export function usePatients() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.patients,
    queryFn: async () => actor!.getAllPatients(),
    enabled,
  });
}

export function useCreatePatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patient, id }: { patient: Patient; id: bigint }) =>
      actor!.createPatient(patient, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.patients });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useUpdatePatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patient }: { id: bigint; patient: Patient }) =>
      actor!.updatePatient(id, patient),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.patients }),
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.patients });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

// ─── Blood Requests ───────────────────────────────────────────────────────────
export function useRequests() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.requests,
    queryFn: async () => actor!.getAllRequests(),
    enabled,
  });
}

export function useCreateRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ request, id }: { request: BloodRequest; id: bigint }) =>
      actor!.createBloodRequest(request, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.requests });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useUpdateRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: bigint; request: BloodRequest }) =>
      actor!.updateBloodRequest(id, request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.requests });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

export function useDeleteRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteBloodRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.requests });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
export function useSeedBloodGroups() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: () => actor!.seedBloodGroups(),
  });
}

// ─── Filter by blood group ────────────────────────────────────────────────────
export function useDonorsByBloodGroup(bg: BloodGroup | "") {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: [...QK.donors, bg],
    queryFn: async () =>
      bg ? actor!.getDonorsByBloodGroup(bg) : actor!.getAllDonors(),
    enabled,
  });
}

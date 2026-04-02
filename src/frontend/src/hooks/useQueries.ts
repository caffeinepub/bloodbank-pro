import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BloodGroup,
  BloodRequest,
  Donation,
  Donor,
  InventoryUnit,
  Patient,
} from "../backend";
import { useActor } from "./useActor";

export const QK = {
  dashboard: ["dashboard"],
  donors: ["donors"],
  collections: ["collections"],
  inventory: ["inventory"],
  patients: ["patients"],
  requests: ["requests"],
} as const;

function useEnabled() {
  const { actor, isFetching } = useActor();
  return { actor, enabled: !!actor && !isFetching };
}

export function useDashboard() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.dashboard,
    queryFn: () => actor!.getDashboardSummary(),
    enabled,
  });
}

export function useDonors() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.donors,
    queryFn: () => actor!.getAllDonors(),
    enabled,
  });
}

export function useCreateDonor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (donor: Donor) => actor!.createDonor(donor),
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

export function useCollections() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.collections,
    queryFn: () => actor!.getAllCollections(),
    enabled,
  });
}

export function useCreateCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (collection: Donation) => actor!.createCollection(collection),
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

export function useDeleteCollection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteCollection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.collections }),
  });
}

export function useInventory() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.inventory,
    queryFn: () => actor!.getAllInventory(),
    enabled,
  });
}

export function useCreateInventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (unit: InventoryUnit) => actor!.createInventoryUnit(unit),
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

export function useDeleteInventory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteInventoryUnit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.inventory }),
  });
}

export function usePatients() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.patients,
    queryFn: () => actor!.getAllPatients(),
    enabled,
  });
}

export function useCreatePatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patient: Patient) => actor!.createPatient(patient),
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

export function useRequests() {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: QK.requests,
    queryFn: () => actor!.getAllRequests(),
    enabled,
  });
}

export function useCreateRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: BloodRequest) => actor!.createBloodRequest(request),
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

export function useSeedBloodGroups() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: () => actor!.seedBloodGroups(),
  });
}

export function useDonorsByBloodGroup(bg: BloodGroup | "") {
  const { actor, enabled } = useEnabled();
  return useQuery({
    queryKey: [...QK.donors, bg],
    queryFn: () =>
      bg ? actor!.getDonorsByBloodGroup(bg) : actor!.getAllDonors(),
    enabled,
  });
}

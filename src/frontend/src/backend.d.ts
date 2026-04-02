import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BloodRequest {
    status: string;
    requestedTimestamp: Time;
    patientId: bigint;
    unitsNeeded: bigint;
    bloodGroup: BloodGroup;
    notes: string;
    handledBy: string;
}
export interface Donation {
    testStatus: string;
    volumeMl: bigint;
    donorId: bigint;
    testedBy: string;
    collectionTimestamp: Time;
    notes: string;
}
export type Time = bigint;
export interface InventoryUnit {
    status: string;
    expiryTimestamp: Time;
    collectionId: bigint;
    collectedTimestamp: Time;
    bloodGroup: BloodGroup;
    units: bigint;
}
export interface Donor {
    age: bigint;
    name: string;
    isActive: boolean;
    email: string;
    bloodGroup: BloodGroup;
    address: string;
    gender: string;
    registrationTimestamp: Time;
    lastDonationTimestamp: Time;
    phone: string;
}
export interface BloodBankSummary {
    totalPatients: bigint;
    inventory: Array<[BloodGroup, bigint]>;
    pendingRequests: bigint;
    totalDonors: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Patient {
    age: bigint;
    hospital: string;
    urgency: string;
    name: string;
    isActive: boolean;
    bloodGroup: BloodGroup;
    gender: string;
    phone: string;
}
export enum BloodGroup {
    abNeg = "abNeg",
    abPos = "abPos",
    aNeg = "aNeg",
    aPos = "aPos",
    bNeg = "bNeg",
    bPos = "bPos",
    oNeg = "oNeg",
    oPos = "oPos"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBloodRequest(request: BloodRequest, id: bigint): Promise<bigint>;
    createCollection(collection: Donation, id: bigint): Promise<bigint>;
    createDonor(donor: Donor, id: bigint): Promise<bigint>;
    createInventoryUnit(unit: InventoryUnit, id: bigint): Promise<bigint>;
    createPatient(patient: Patient, id: bigint): Promise<bigint>;
    deleteBloodRequest(id: bigint): Promise<boolean>;
    deleteCollection(id: bigint): Promise<boolean>;
    deleteDonor(id: bigint): Promise<boolean>;
    deleteInventoryUnit(id: bigint): Promise<boolean>;
    deletePatient(id: bigint): Promise<boolean>;
    getAllCollections(): Promise<Array<Donation>>;
    getAllDonors(): Promise<Array<Donor>>;
    getAllInventory(): Promise<Array<InventoryUnit>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllRequests(): Promise<Array<BloodRequest>>;
    getBloodRequest(id: bigint): Promise<BloodRequest | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollection(id: bigint): Promise<Donation | null>;
    getDashboardSummary(): Promise<BloodBankSummary>;
    getDonor(id: bigint): Promise<Donor | null>;
    getDonorsByBloodGroup(bloodGroup: BloodGroup): Promise<Array<Donor>>;
    getInventoryByBloodGroup(bloodGroup: BloodGroup): Promise<Array<InventoryUnit>>;
    getInventoryUnit(id: bigint): Promise<InventoryUnit | null>;
    getPatient(id: bigint): Promise<Patient | null>;
    getRequestsByStatus(status: string): Promise<Array<BloodRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedBloodGroups(): Promise<void>;
    updateBloodRequest(id: bigint, request: BloodRequest): Promise<boolean>;
    updateCollection(id: bigint, collection: Donation): Promise<boolean>;
    updateDonor(id: bigint, donor: Donor): Promise<boolean>;
    updateInventoryUnit(id: bigint, unit: InventoryUnit): Promise<boolean>;
    updatePatient(id: bigint, patient: Patient): Promise<boolean>;
}

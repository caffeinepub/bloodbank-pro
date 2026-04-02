import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type BloodGroup = {
    #aPos;
    #aNeg;
    #bPos;
    #bNeg;
    #abPos;
    #abNeg;
    #oPos;
    #oNeg;
  };

  module BloodGroup {
    public func compare(bg1 : BloodGroup, bg2 : BloodGroup) : Order.Order {
      switch (bg1, bg2) {
        case (#aPos, #aPos) { #equal };
        case (#aPos, _) { #less };
        case (#aNeg, #aNeg) { #equal };
        case (#aNeg, #aPos) { #greater };
        case (#aNeg, _) { #less };
        case (#bPos, #bPos) { #equal };
        case (#bPos, #abPos) { #less };
        case (#bPos, #abNeg) { #less };
        case (#bPos, #oPos) { #greater };
        case (#bPos, _) { #greater };
        case (#bNeg, #bNeg) { #equal };
        case (#bNeg, #abPos) { #less };
        case (#bNeg, #abNeg) { #less };
        case (#bNeg, #oPos) { #greater };
        case (#bNeg, #oNeg) { #less };
        case (#abPos, #abPos) { #equal };
        case (#abPos, #abNeg) { #less };
        case (#abPos, _) { #greater };

        case (#abNeg, #abNeg) { #equal };
        case (#abNeg, #oPos) { #less };
        case (#abNeg, #oNeg) { #less };
        case (#oPos, #oPos) { #equal };
        case (#oPos, #oNeg) { #greater };
        case (#oNeg, #oNeg) { #equal };
        case (#oNeg, _) { #greater };
      };
    };

    public func toText(bg : BloodGroup) : Text {
      switch (bg) {
        case (#aPos) { "A+" };
        case (#aNeg) { "A-" };
        case (#bPos) { "B+" };
        case (#bNeg) { "B-" };
        case (#abPos) { "AB+" };
        case (#abNeg) { "AB-" };
        case (#oPos) { "O+" };
        case (#oNeg) { "O-" };
      };
    };
  };

  type Donor = {
    name : Text;
    age : Nat;
    gender : Text;
    bloodGroup : BloodGroup;
    phone : Text;
    email : Text;
    address : Text;
    lastDonationTimestamp : Time.Time;
    registrationTimestamp : Time.Time;
    isActive : Bool;
  };

  module Donor {
    public func compare(donor1 : Donor, donor2 : Donor) : Order.Order {
      Text.compare(donor1.name, donor2.name);
    };
  };

  type Donation = {
    donorId : Nat;
    collectionTimestamp : Time.Time;
    volumeMl : Nat;
    testStatus : Text;
    testedBy : Text;
    notes : Text;
  };

  type InventoryUnit = {
    bloodGroup : BloodGroup;
    units : Nat;
    collectionId : Nat;
    collectedTimestamp : Time.Time;
    expiryTimestamp : Time.Time;
    status : Text;
  };

  module InventoryUnit {
    public func compareByBloodGroup(iu1 : InventoryUnit, iu2 : InventoryUnit) : Order.Order {
      BloodGroup.compare(iu1.bloodGroup, iu2.bloodGroup);
    };
  };

  type Patient = {
    name : Text;
    age : Nat;
    gender : Text;
    bloodGroup : BloodGroup;
    hospital : Text;
    phone : Text;
    urgency : Text;
    isActive : Bool;
  };

  type BloodRequest = {
    patientId : Nat;
    bloodGroup : BloodGroup;
    unitsNeeded : Nat;
    status : Text;
    requestedTimestamp : Time.Time;
    handledBy : Text;
    notes : Text;
  };

  type BloodBankSummary = {
    inventory : [(BloodGroup, Nat)];
    pendingRequests : Nat;
    totalDonors : Nat;
    totalPatients : Nat;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let donorIdQueue = 0;
  let collectionIdQueue = 0;
  let inventoryIdQueue = 0;
  let patientIdQueue = 0;
  let requestIdQueue = 0;

  let donors = Map.empty<Nat, Donor>();
  let collections = Map.empty<Nat, Donation>();
  let inventory = Map.empty<Nat, InventoryUnit>();
  let patients = Map.empty<Nat, Patient>();
  let requests = Map.empty<Nat, BloodRequest>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getNextId(queue : Nat) : Nat {
    let nextId = queue + 1;
    return nextId;
  };

  func getDonorInternal(id : Nat) : ?Donor {
    donors.get(id);
  };

  func getCollectionInternal(id : Nat) : ?Donation {
    collections.get(id);
  };

  func getInventoryUnitInternal(id : Nat) : ?InventoryUnit {
    inventory.get(id);
  };

  func getPatientInternal(id : Nat) : ?Patient {
    patients.get(id);
  };

  func getBloodRequestInternal(id : Nat) : ?BloodRequest {
    requests.get(id);
  };

  public shared ({ caller }) func createDonor(donor : Donor, id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create donors");
    };
    let newDonor = createDonorInternal(donor, id);
    donors.add(id, newDonor);
    id;
  };

  func createDonorInternal(donor : Donor, id : Nat) : Donor {
    {
      donor with
      registrationTimestamp = Time.now();
    };
  };

  public shared ({ caller }) func updateDonor(id : Nat, donor : Donor) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update donors");
    };
    updateDonorInternal(id, donor);
    true;
  };

  func updateDonorInternal(id : Nat, donor : Donor) {
    switch (donors.get(id)) {
      case (null) { Runtime.trap("Donor not found") };
      case (?existingDonor) {
        let updatedDonor = {
          donor with
          registrationTimestamp = existingDonor.registrationTimestamp;
        };
        donors.add(id, updatedDonor);
      };
    };
  };

  public shared ({ caller }) func deleteDonor(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete donors");
    };
    deleteDonorInternal(id);
    true;
  };

  func deleteDonorInternal(id : Nat) {
    if (not donors.containsKey(id)) { Runtime.trap("Donor not found") };
    donors.remove(id);
  };

  public query ({ caller }) func getDonor(id : Nat) : async ?Donor {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view donor information");
    };
    donors.get(id);
  };

  public query ({ caller }) func getDonorsByBloodGroup(bloodGroup : BloodGroup) : async [Donor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can search donors");
    };
    donors.values().toArray().filter(func(d) { BloodGroup.compare(d.bloodGroup, bloodGroup) == #equal });
  };

  public query ({ caller }) func getAllDonors() : async [Donor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view all donors");
    };
    donors.values().toArray().sort();
  };

  public shared ({ caller }) func createCollection(collection : Donation, id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create collections");
    };
    collections.add(id, collection);
    id;
  };

  public shared ({ caller }) func updateCollection(id : Nat, collection : Donation) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update collections");
    };
    updateCollectionInternal(id, collection);
    true;
  };

  func updateCollectionInternal(id : Nat, collection : Donation) {
    if (not collections.containsKey(id)) { Runtime.trap("Collection not found") };
    collections.add(id, collection);
  };

  public shared ({ caller }) func deleteCollection(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete collections");
    };
    deleteCollectionInternal(id);
    true;
  };

  func deleteCollectionInternal(id : Nat) {
    if (not collections.containsKey(id)) { Runtime.trap("Collection not found") };
    collections.remove(id);
  };

  public query ({ caller }) func getCollection(id : Nat) : async ?Donation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view collections");
    };
    getCollectionInternal(id);
  };

  public query ({ caller }) func getAllCollections() : async [Donation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view all collections");
    };
    collections.values().toArray();
  };

  public shared ({ caller }) func createInventoryUnit(unit : InventoryUnit, id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create inventory units");
    };
    updateInventoryUnitInternal(id, unit);
    id;
  };

  public shared ({ caller }) func updateInventoryUnit(id : Nat, unit : InventoryUnit) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update inventory units");
    };
    updateInventoryUnitInternal(id, unit);
    true;
  };

  func updateInventoryUnitInternal(id : Nat, unit : InventoryUnit) {
    inventory.add(id, unit);
  };

  public shared ({ caller }) func deleteInventoryUnit(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete inventory units");
    };
    deleteInventoryUnitInternal(id);
    true;
  };

  func deleteInventoryUnitInternal(id : Nat) {
    if (not inventory.containsKey(id)) { Runtime.trap("Inventory unit not found") };
    inventory.remove(id);
  };

  public query ({ caller }) func getInventoryUnit(id : Nat) : async ?InventoryUnit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view inventory");
    };
    getInventoryUnitInternal(id);
  };

  public query ({ caller }) func getInventoryByBloodGroup(bloodGroup : BloodGroup) : async [InventoryUnit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view inventory");
    };
    inventory.values().toArray().filter(func(u) { BloodGroup.compare(u.bloodGroup, bloodGroup) == #equal });
  };

  public query ({ caller }) func getAllInventory() : async [InventoryUnit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view all inventory");
    };
    inventory.values().toArray().sort(InventoryUnit.compareByBloodGroup);
  };

  public shared ({ caller }) func createPatient(patient : Patient, id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create patients");
    };
    patients.add(id, patient);
    id;
  };

  public shared ({ caller }) func updatePatient(id : Nat, patient : Patient) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update patients");
    };
    updatePatientInternal(id, patient);
    true;
  };

  func updatePatientInternal(id : Nat, patient : Patient) {
    if (not patients.containsKey(id)) { Runtime.trap("Patient not found") };
    patients.add(id, patient);
  };

  public shared ({ caller }) func deletePatient(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete patients");
    };
    deletePatientInternal(id);
    true;
  };

  func deletePatientInternal(id : Nat) {
    if (not patients.containsKey(id)) { Runtime.trap("Patient not found") };
    patients.remove(id);
  };

  public query ({ caller }) func getPatient(id : Nat) : async ?Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view patient information");
    };
    getPatientInternal(id);
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view all patients");
    };
    patients.values().toArray();
  };

  public shared ({ caller }) func createBloodRequest(request : BloodRequest, id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create blood requests");
    };
    requests.add(id, request);
    id;
  };

  public shared ({ caller }) func updateBloodRequest(id : Nat, request : BloodRequest) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update blood requests");
    };
    updateBloodRequestInternal(id, request);
    true;
  };

  func updateBloodRequestInternal(id : Nat, request : BloodRequest) {
    if (not requests.containsKey(id)) { Runtime.trap("Blood request not found") };
    requests.add(id, request);
  };

  public shared ({ caller }) func deleteBloodRequest(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete blood requests");
    };
    deleteBloodRequestInternal(id);
    true;
  };

  func deleteBloodRequestInternal(id : Nat) {
    if (not requests.containsKey(id)) { Runtime.trap("Blood request not found") };
    requests.remove(id);
  };

  public query ({ caller }) func getBloodRequest(id : Nat) : async ?BloodRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view blood requests");
    };
    getBloodRequestInternal(id);
  };

  public query ({ caller }) func getRequestsByStatus(status : Text) : async [BloodRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view blood requests");
    };
    requests.values().toArray().filter(func(r) { Text.equal(r.status, status) });
  };

  public query ({ caller }) func getAllRequests() : async [BloodRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view all requests");
    };
    requests.values().toArray();
  };

  public query ({ caller }) func getDashboardSummary() : async BloodBankSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view dashboard");
    };
    let inventoryByGroup = inventory.values().toArray().sort(InventoryUnit.compareByBloodGroup);

    let inventorySummary = inventoryByGroup.map(
      func(u) { (u.bloodGroup, u.units) }
    );

    let pendingRequests = requests.values().toArray().filter(
      func(r) { Text.equal(r.status, "pending") }
    ).size();

    let totalDonors = donors.size();
    let totalPatients = patients.size();

    {
      inventory = inventorySummary;
      pendingRequests;
      totalDonors;
      totalPatients;
    };
  };

  public shared ({ caller }) func seedBloodGroups() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };
    inventory.clear();
    let seedExampleBloodGroups = [
      #aPos,
      #aNeg,
      #bPos,
      #bNeg,
      #abPos,
      #abNeg,
      #oPos,
      #oNeg,
    ];
    let timestamp = Time.now();
    for (bg in seedExampleBloodGroups.values()) {
      let id = getNextId(inventoryIdQueue);
      inventory.add(
        id,
        {
          bloodGroup = bg;
          units = 0;
          collectionId = 0;
          collectedTimestamp = timestamp;
          expiryTimestamp = timestamp;
          status = "available";
        },
      );
    };
  };
};
